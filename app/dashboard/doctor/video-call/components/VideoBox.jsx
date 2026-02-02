"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './VideoBox.module.css';
import { getSessionConfig, initZoomClient } from '@/utils/zoomUtils';

export default function VideoBox({ userRole, userName, onClientReady, onEndCall }) {
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [client, setClient] = useState(null);
    const [error, setError] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [remoteUserId, setRemoteUserId] = useState(null);
    const [isMounted, setIsMounted] = useState(true);

    const mainCanvasRef = useRef(null);
    const selfCanvasRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        let zoomClient = null;

        const setupZoom = async () => {
            try {
                // Pre-join: Request browser media permissions explicitly
                // This ensures prompts appear before the SDK tries to initialize
                console.info('Requesting browser media permissions...');
                try {
                    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    // Stop tracks immediately as we only wanted the permission
                    localStream.getTracks().forEach(track => track.stop());
                } catch (permErr) {
                    console.warn('Initial media permission request failed:', permErr);
                    // Continue anyway, Zoom SDK might handle it or show better error
                }

                const sdkClient = await initZoomClient();
                if (!sdkClient) return;

                zoomClient = sdkClient;
                setClient(zoomClient);

                const config = await getSessionConfig(userRole, userName);
                if (!config || !config.token) {
                    setError('Failed to generate Zoom token or config');
                    return;
                }

                // Initialize SDK
                await zoomClient.init('en-US', 'Global', { patchJsMedia: true }).catch(err => {
                    console.warn('Init with Global failed, trying US:', err);
                    return zoomClient.init('en-US', 'US', { patchJsMedia: true });
                });

                // Join session
                console.log('Joining Zoom session:', config.sessionName, 'Identity:', config.userIdentity);
                await zoomClient.join(
                    config.sessionName,
                    config.token,
                    config.userIdentity, // Unique identity
                    config.sessionPassword
                );

                console.log('Successfully joined Zoom session');

                const stream = zoomClient.getMediaStream();
                setMediaStream(stream);
                setIsConnected(true);

                if (onClientReady) onClientReady(zoomClient);

                // Set default states based on what's available
                const userInfo = zoomClient.getCurrentUserInfo();
                setIsVideoOn(!!userInfo.bVideoOn);
                setIsAudioOn(!!userInfo.audio);

                // Setup event listeners...
                setupEventListeners(zoomClient, stream);

            } catch (err) {
                console.error('Zoom SDK error detailed:', err);
                setError(err.reason || err.message || 'Failed to connect');
            }
        };

        const setupEventListeners = (client, stream) => {
            if (!client) return;

            // Handle peers
            const myUserId = client.getCurrentUserInfo().userId;

            client.on('peer-video-state-change', (payload) => {
                if (!isMounted) return;
                console.log('Peer video change:', payload);
                if (payload.action === 'Start') {
                    setRemoteUserId(payload.userId);
                    setTimeout(() => renderUserVideo(stream, payload.userId, mainCanvasRef.current), 500);
                } else if (payload.action === 'Stop') {
                    if (payload.userId === remoteUserId) setRemoteUserId(null);
                }
            });

            client.on('user-added', (users) => {
                console.log('Users joined:', users);
            });

            client.on('user-removed', (users) => {
                if (!isMounted) return;
                users.forEach(u => {
                    if (u.userId === remoteUserId) setRemoteUserId(null);
                });
            });
        };

        setupZoom();

        return () => {
            if (zoomClient) {
                // Ignore error if already left
                zoomClient.leave().catch(() => { });
            }
        };
    }, []);

    const renderUserVideo = async (stream, userId, canvas) => {
        if (!stream || !canvas || !userId) {
            return;
        }
        try {
            console.log(`Rendering video for: ${userId}`);
            await stream.renderVideo(
                canvas,
                userId,
                canvas.width,
                canvas.height,
                0, 0, 2
            ).catch(e => {
                // If it fails because canvas is not in DOM or already rendering
                if (e.reason !== 'Render is already start') {
                    console.warn('Render error:', e);
                }
            });
        } catch (e) {
            // Silently catch
        }
    };

    const toggleVideo = async () => {
        if (!mediaStream || !client) {
            console.warn('Media stream not ready');
            return;
        }

        try {
            if (isVideoOn) {
                console.log('Stopping video...');
                await mediaStream.stopVideo();
                setIsVideoOn(false);
                if (selfCanvasRef.current) {
                    await mediaStream.clearVideo(selfCanvasRef.current);
                }
            } else {
                console.log('Starting video...');
                await mediaStream.startVideo();
                setIsVideoOn(true);

                const myUserId = client.getCurrentUserInfo().userId;
                // Render self view after a short delay for camera to warm up
                setTimeout(() => {
                    if (selfCanvasRef.current && isMounted) {
                        renderUserVideo(mediaStream, myUserId, selfCanvasRef.current);
                    }
                }, 800);
            }
        } catch (error) {
            console.error('Toggle video error:', error);
            alert(`Camera error: ${error.reason || error.message || 'Check permissions'}`);
        }
    };

    const handleAudio = async () => {
        if (!mediaStream || !client) {
            console.warn('Audio handle: mediaStream or client missing');
            return;
        }
        try {
            const userInfo = client.getCurrentUserInfo();
            const isAudioStarted = !!userInfo.audio;

            if (!isAudioStarted) {
                console.log('Starting audio stream...');
                await mediaStream.startAudio().catch(e => console.warn('startAudio failed:', e));
                setIsAudioOn(true);
            } else {
                const isMuted = !!userInfo.muted;
                if (isMuted) {
                    console.log('Unmuting mic...');
                    await mediaStream.unmuteAudio().catch(e => console.warn('unmute failed:', e));
                    setIsAudioOn(true);
                } else {
                    console.log('Muting mic...');
                    await mediaStream.muteAudio().catch(e => console.warn('mute failed:', e));
                    setIsAudioOn(false);
                }
            }
        } catch (e) {
            console.error('Audio handle error:', e);
        }
    };

    return (
        <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
                <canvas
                    ref={mainCanvasRef}
                    className={styles.videoCanvas}
                    width={1280}
                    height={720}
                />

                {!isConnected && !error && (
                    <div className={styles.placeholder}>
                        <div className={styles.spinner}></div>
                        <p>Connecting...</p>
                    </div>
                )}

                {error && (
                    <div className={styles.placeholder}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <p className={styles.errorText}>Connection Error</p>
                        <p className={styles.errorDetail}>{error}</p>
                        <button className={styles.retryBtn} onClick={() => window.location.reload()}>Retry</button>
                    </div>
                )}

                {isConnected && !remoteUserId && (
                    <div className={styles.videoOff}>
                        <div className={styles.avatarCircle}>
                            {userRole === 'doctor' ? 'P' : 'D'}
                        </div>
                        <p className={styles.videoOffText}>
                            Waiting for {userRole === 'doctor' ? 'patient' : 'doctor'}...
                        </p>
                    </div>
                )}

                <div className={styles.selfView}>
                    <div className={styles.selfViewInner}>
                        <canvas
                            ref={selfCanvasRef}
                            style={{ width: '100%', height: '100%', display: isVideoOn ? 'block' : 'none' }}
                            width={320}
                            height={180}
                        />
                        {!isVideoOn && (
                            <div className={styles.selfAvatarSmall}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {isVideoOn && <div className={styles.selfTag}>You</div>}
                </div>

                <div className={styles.statusBadge}>
                    <div className={styles.statusDot}></div>
                    <span>Secure Session</span>
                </div>
            </div>

            <div className={styles.controls}>
                <button
                    className={`${styles.controlBtn} ${!isAudioOn ? styles.controlBtnOff : ''}`}
                    onClick={handleAudio}
                >
                    {isAudioOn ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="1" y1="1" x2="23" y2="23" />
                            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                            <path d="M17 16.95A7 7 0 0 1 5 12v-2" />
                        </svg>
                    )}
                </button>

                {/* END CALL BUTTON IN CENTER */}
                <button
                    className={styles.endCallBtn}
                    onClick={onEndCall}
                    title="End Call"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                        <line x1="23" y1="1" x2="1" y2="23"></line>
                    </svg>
                </button>

                <button
                    className={`${styles.controlBtn} ${!isVideoOn ? styles.controlBtnOff : ''}`}
                    onClick={toggleVideo}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {isVideoOn ? (
                            <>
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </>
                        ) : (
                            <>
                                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </>
                        )}
                    </svg>
                </button>
            </div>
        </div>
    );
}
