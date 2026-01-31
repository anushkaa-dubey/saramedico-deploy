"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './VideoBox.module.css';
import { getSessionConfig, initZoomClient } from '@/utils/zoomUtils';

export default function VideoBox({ userRole, userName, onClientReady, onEndCall }) {
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isAudioOn, setIsAudioOn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [client, setClient] = useState(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [remoteUserId, setRemoteUserId] = useState(null);

    const mainCanvasRef = useRef(null);
    const selfCanvasRef = useRef(null);

    useEffect(() => {
        let zoomClient = null;

        const setupZoom = async () => {
            try {
                const sdkClient = await initZoomClient();
                if (!sdkClient) return;

                zoomClient = sdkClient;
                setClient(zoomClient);

                const config = await getSessionConfig(userRole, userName);
                if (!config || !config.token) {
                    console.error('Failed to generate Zoom token');
                    return;
                }

                await zoomClient.init('en-US', 'Global', { patchJsMedia: true });

                // Join session
                console.log('Attempting to join Zoom session:', config.sessionName);
                await zoomClient.join(config.sessionName, config.token, userName, config.sessionPassword);
                console.log('Successfully joined Zoom session');

                const stream = zoomClient.getMediaStream();
                setMediaStream(stream);
                setIsConnected(true);

                if (onClientReady) onClientReady(zoomClient);

                // Initial participants check
                const users = zoomClient.getAllUser();
                const myUserId = zoomClient.getCurrentUserInfo().userId;
                users.forEach(u => {
                    if (u.userId !== myUserId && u.bVideoOn) {
                        setRemoteUserId(u.userId);
                        renderUserVideo(stream, u.userId, mainCanvasRef.current);
                    }
                });

                // Handle events
                zoomClient.on('peer-video-state-change', (payload) => {
                    if (payload.action === 'Start') {
                        setRemoteUserId(payload.userId);
                        renderUserVideo(stream, payload.userId, mainCanvasRef.current);
                    } else if (payload.action === 'Stop') {
                        if (payload.userId === remoteUserId) {
                            setRemoteUserId(null);
                        }
                    }
                });

                zoomClient.on('user-added', (users) => {
                    console.log('User joined');
                });

                zoomClient.on('user-removed', (users) => {
                    users.forEach(u => {
                        if (u.userId === remoteUserId) setRemoteUserId(null);
                    });
                });

            } catch (error) {
                console.error('Zoom SDK error detailed:', {
                    message: error.message,
                    type: error.type,
                    reason: error.reason,
                    code: error.code,
                    full: error
                });
            }
        };

        setupZoom();

        return () => {
            if (zoomClient) {
                zoomClient.leave().catch(console.error);
            }
        };
    }, []);

    const renderUserVideo = async (stream, userId, canvas) => {
        if (!stream || !canvas || !userId) {
            console.log('Skipping render: missing dependencies', { hasStream: !!stream, hasCanvas: !!canvas, userId });
            return;
        }
        try {
            console.log(`Attempting to render video for user: ${userId} on canvas:`, canvas);
            await stream.renderVideo(
                canvas,
                userId,
                canvas.width,
                canvas.height,
                0, 0, 2
            );
            console.log(`Render successful for user: ${userId}`);
        } catch (e) {
            console.error('Render error:', e);
        }
    };

    const toggleVideo = async () => {
        if (!mediaStream || !client) return;

        try {
            if (isVideoOn) {
                await mediaStream.stopVideo();
                setIsVideoOn(false);
                if (selfCanvasRef.current) {
                    await mediaStream.clearVideo(selfCanvasRef.current);
                }
            } else {
                // Ensure we don't try to start video if it's already capturing from another call
                try {
                    await mediaStream.startVideo();
                    setIsVideoOn(true);

                    const myUserId = client.getCurrentUserInfo().userId;
                    // Force a re-render after a short delay
                    setTimeout(() => {
                        if (selfCanvasRef.current) {
                            renderUserVideo(mediaStream, myUserId, selfCanvasRef.current);
                        }
                    }, 800);
                } catch (e) {
                    console.error('Camera start error:', e);
                    alert('Camera access failed. Please ensure it is not used by another app and try again.');
                }
            }
        } catch (error) {
            console.error('Toggle video error:', error);
        }
    };

    const handleAudio = async () => {
        if (!mediaStream || !client) return;
        try {
            const userInfo = client.getCurrentUserInfo();
            const isAudioStarted = userInfo.audio;

            if (isAudioStarted === '' || !isAudioStarted) {
                // Session audio not started
                await mediaStream.startAudio();
                setIsAudioOn(true);
            } else {
                const isMuted = userInfo.muted;
                if (isMuted) {
                    await mediaStream.unmuteAudio();
                    setIsAudioOn(true);
                } else {
                    await mediaStream.muteAudio();
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

                {!isConnected && (
                    <div className={styles.placeholder}>
                        <div className={styles.spinner}></div>
                        <p>Connecting...</p>
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
