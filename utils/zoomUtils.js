/**
 * Get session configuration for Zoom Video SDK from backend API
 */
export async function getSessionConfig(userRole, userName) {
    const sessionName = process.env.NEXT_PUBLIC_ZOOM_SESSION_NAME || 'SaraMedico_Session';
    const userIdentity = `${userRole}_${userName.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 1000)}`;
    const role = userRole === 'doctor' ? 1 : 0; // 1 for host, 0 for participant

    try {
        const response = await fetch('/api/zoom/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionName,
                role,
                userIdentity
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Zoom token from API');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting session config:', error);
        return null;
    }
}

/**
 * Initialize Zoom Video SDK Client
 */
export async function initZoomClient() {
    try {
        const { default: ZoomVideo } = await import('@zoom/videosdk');
        const client = ZoomVideo.createClient();
        return client;
    } catch (error) {
        console.error('Error initializing Zoom client:', error);
        return null;
    }
}
