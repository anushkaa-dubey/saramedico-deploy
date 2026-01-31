/**
 * Backend JWT Token Generation Example
 * 
 * This file shows how to properly generate Zoom Video SDK JWT tokens
 * on the backend server for production use.
 * 
 * IMPORTANT: This should be implemented on your backend server,
 * NOT in the frontend code!
 */

const jwt = require('jsonwebtoken');

/**
 * Generate Zoom Video SDK JWT Token
 * 
 * @param {string} sessionName - The name of the video session
 * @param {string} userRole - 'doctor' or 'patient'
 * @param {string} userId - Unique user identifier
 * @param {string} userName - Display name for the user
 * @returns {string} JWT token for Zoom Video SDK
 */
function generateZoomToken(sessionName, userRole, userId, userName) {
    // Get credentials from environment variables (NEVER hardcode these!)
    const sdkKey = process.env.ZOOM_SDK_KEY;
    const sdkSecret = process.env.ZOOM_SDK_SECRET;

    if (!sdkKey || !sdkSecret) {
        throw new Error('Zoom SDK credentials not configured');
    }

    // Token expiration time
    const iat = Math.round(new Date().getTime() / 1000); // Current timestamp
    const exp = iat + 60 * 60 * 2; // Expires in 2 hours

    // Role: 1 = host (doctor), 0 = participant (patient)
    const roleType = userRole === 'doctor' ? 1 : 0;

    // Payload
    const payload = {
        app_key: sdkKey,
        tpc: sessionName,           // Topic/Session name
        role_type: roleType,        // 1 for host, 0 for participant
        user_identity: userId,      // Unique user identifier
        version: 1,
        iat: iat,
        exp: exp
    };

    // Generate token
    const token = jwt.sign(payload, sdkSecret);

    return token;
}

/**
 * Express.js Route Example
 * 
 * POST /api/v1/zoom/generate-token
 * 
 * Request body:
 * {
 *   "sessionName": "appointment_12345",
 *   "userRole": "doctor" | "patient"
 * }
 * 
 * Response:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "sessionName": "appointment_12345",
 *   "sessionPassword": "optional_session_password"
 * }
 */
function setupZoomRoutes(app, authenticateUser) {
    app.post('/api/v1/zoom/generate-token', authenticateUser, async (req, res) => {
        try {
            const { sessionName, userRole } = req.body;
            const userId = req.user.id;
            const userName = req.user.name;

            // Validate input
            if (!sessionName || !userRole) {
                return res.status(400).json({
                    error: 'Missing required fields: sessionName, userRole'
                });
            }

            if (userRole !== 'doctor' && userRole !== 'patient') {
                return res.status(400).json({
                    error: 'Invalid userRole. Must be "doctor" or "patient"'
                });
            }

            // Generate token
            const token = generateZoomToken(sessionName, userRole, userId, userName);

            // Optional: Save session info to database
            // await saveVideoSession({
            //     sessionName,
            //     userId,
            //     userRole,
            //     startTime: new Date(),
            //     status: 'active'
            // });

            res.json({
                token,
                sessionName,
                sdkKey: process.env.ZOOM_SDK_KEY, // Client needs this for initialization
                sessionPassword: process.env.ZOOM_SESSION_PASSWORD || ''
            });

        } catch (error) {
            console.error('Error generating Zoom token:', error);
            res.status(500).json({
                error: 'Failed to generate Zoom token'
            });
        }
    });

    /**
     * Get session information
     * GET /api/v1/zoom/session/:sessionName
     */
    app.get('/api/v1/zoom/session/:sessionName', authenticateUser, async (req, res) => {
        try {
            const { sessionName } = req.params;

            // Fetch session info from database
            // const session = await getVideoSession(sessionName);

            // For testing, return mock data
            res.json({
                sessionName,
                status: 'active',
                participants: [
                    { id: 'doctor_123', name: 'Dr. Sarah Smith', role: 'doctor' },
                    { id: 'patient_456', name: 'Benjamin Frank', role: 'patient' }
                ]
            });

        } catch (error) {
            console.error('Error fetching session:', error);
            res.status(500).json({
                error: 'Failed to fetch session information'
            });
        }
    });

    /**
     * End video session
     * POST /api/v1/zoom/session/:sessionName/end
     */
    app.post('/api/v1/zoom/session/:sessionName/end', authenticateUser, async (req, res) => {
        try {
            const { sessionName } = req.params;

            // Update session status in database
            // await updateVideoSession(sessionName, { 
            //     status: 'ended',
            //     endTime: new Date()
            // });

            res.json({
                success: true,
                message: 'Session ended successfully'
            });

        } catch (error) {
            console.error('Error ending session:', error);
            res.status(500).json({
                error: 'Failed to end session'
            });
        }
    });
}

/**
 * FastAPI (Python) Example
 * 
 * from fastapi import APIRouter, Depends, HTTPException
 * from datetime import datetime, timedelta
 * import jwt
 * import os
 * 
 * router = APIRouter()
 * 
 * @router.post("/api/v1/zoom/generate-token")
 * async def generate_zoom_token(
 *     session_name: str,
 *     user_role: str,
 *     current_user = Depends(get_current_user)
 * ):
 *     sdk_key = os.getenv("ZOOM_SDK_KEY")
 *     sdk_secret = os.getenv("ZOOM_SDK_SECRET")
 *     
 *     if not sdk_key or not sdk_secret:
 *         raise HTTPException(status_code=500, detail="Zoom SDK not configured")
 *     
 *     iat = int(datetime.now().timestamp())
 *     exp = iat + 7200  # 2 hours
 *     
 *     role_type = 1 if user_role == "doctor" else 0
 *     
 *     payload = {
 *         "app_key": sdk_key,
 *         "tpc": session_name,
 *         "role_type": role_type,
 *         "user_identity": str(current_user.id),
 *         "version": 1,
 *         "iat": iat,
 *         "exp": exp
 *     }
 *     
 *     token = jwt.encode(payload, sdk_secret, algorithm="HS256")
 *     
 *     return {
 *         "token": token,
 *         "sessionName": session_name,
 *         "sdkKey": sdk_key,
 *         "sessionPassword": os.getenv("ZOOM_SESSION_PASSWORD", "")
 *     }
 */

module.exports = {
    generateZoomToken,
    setupZoomRoutes
};
