# Zoom Video SDK Integration Guide

## Overview

This document describes the Zoom Video SDK integration for the SaraMedico telemedicine platform. The integration enables secure video consultations between doctors and patients with an integrated chat feature.

## ⚠️ IMPORTANT: Testing Only

**This implementation is for TESTING PURPOSES ONLY.** In a production environment:
- JWT tokens MUST be generated on the backend server
- Never expose SDK secrets in frontend code
- Implement proper authentication and authorization
- Use secure WebSocket connections for real-time features

## Features Implemented

### Doctor's Video Call Interface
- **Video Box**: Zoom Video SDK integration for real-time video
- **Chat Box**: Real-time messaging visible to both doctor and patient
- **SOAP Notes**: Clinical documentation tool (doctor only)
- **Real-time Transcript**: Auto-generated conversation transcript
- **Assist Panel**: AI-powered suggestions and medical coding

### Patient's Video Call Interface
- **Video Box**: Zoom Video SDK integration
- **Chat Box**: Real-time messaging with doctor
- **Simplified Layout**: Clean interface focused on consultation

## Setup Instructions

### 1. Get Zoom Video SDK Credentials

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in to your Zoom account
3. Click "Develop" → "Build App"
4. Select "Video SDK" app type
5. Fill in the app details
6. Copy your **SDK Key** and **SDK Secret**

### 2. Configure Environment Variables

Update your `.env.local` file with your Zoom credentials:

```bash
# Zoom Video SDK Configuration (Testing Only)
NEXT_PUBLIC_ZOOM_SDK_KEY=your_actual_zoom_sdk_key
NEXT_PUBLIC_ZOOM_SDK_SECRET=your_actual_zoom_sdk_secret
NEXT_PUBLIC_ZOOM_SESSION_NAME=SaraMedico_Test_Session
NEXT_PUBLIC_ZOOM_SESSION_PASSWORD=test123
```

**Replace `your_actual_zoom_sdk_key` and `your_actual_zoom_sdk_secret` with your real credentials.**

### 3. Install Dependencies

The following packages have been installed:
```bash
npm install @zoom/videosdk jsonwebtoken
```

### 4. Production Implementation

For production use, you MUST:

#### Backend (Node.js/Express example):

```javascript
// backend/routes/zoom.js
const jwt = require('jsonwebtoken');

app.post('/api/zoom/generate-token', authenticateUser, async (req, res) => {
    const { sessionName, userRole } = req.body;
    
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2; // 2 hours
    
    const token = jwt.sign({
        app_key: process.env.ZOOM_SDK_KEY,
        tpc: sessionName,
        role_type: userRole === 'doctor' ? 1 : 0, // 1 = host, 0 = participant
        version: 1,
        user_identity: req.user.id,
        iat,
        exp
    }, process.env.ZOOM_SDK_SECRET);
    
    res.json({ token, sessionName });
});
```

#### Frontend Update:

```javascript
// utils/zoomUtils.js - Production version
export async function getZoomToken(sessionName, userRole) {
    const response = await fetch('/api/zoom/generate-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ sessionName, userRole })
    });
    
    const data = await response.json();
    return data.token;
}
```

## File Structure

```
app/
├── dashboard/
│   ├── doctor/
│   │   └── video-call/
│   │       ├── page.jsx                    # Doctor video call page
│   │       ├── VideoCall.module.css        # Doctor video call styles
│   │       └── components/
│   │           ├── VideoBox.jsx            # Zoom video component
│   │           ├── VideoBox.module.css     # Video styles
│   │           ├── ChatBox.jsx             # Chat component
│   │           ├── ChatBox.module.css      # Chat styles
│   │           ├── SOAPEditor.jsx          # SOAP notes
│   │           └── AssistPanel.jsx         # AI assist panel
│   │
│   └── patient/
│       └── video-call/
│           ├── page.jsx                    # Patient video call page
│           └── VideoCall.module.css        # Patient video call styles
│
utils/
└── zoomUtils.js                            # Zoom SDK utilities
```

## Usage

### Starting a Video Call

#### Doctor View:
1. Navigate to `/dashboard/doctor/video-call`
2. The system will automatically connect to the Zoom session
3. Doctor sees:
   - Video feed (left)
   - Chat box (below video)
   - Real-time transcript
   - SOAP notes editor
   - AI assist panel

#### Patient View:
1. Navigate to `/dashboard/patient/video-call`
2. The system will automatically connect to the same session
3. Patient sees:
   - Video feed (left)
   - Chat box (right)
   - End call button

### Using the Chat

- Type your message in the input box
- Press Enter or click the send button
- Messages appear instantly for both participants
- Doctor messages are shown in blue
- Patient messages are shown in gray

### SOAP Notes (Doctor Only)

The SOAP note editor allows doctors to document:
- **S**ubjective: Patient's description of symptoms
- **O**bjective: Clinical observations and measurements
- **A**ssessment: Diagnosis and evaluation
- **P**lan: Treatment plan and follow-up

## Key Components

### VideoBox Component

**Props:**
- `userRole`: "doctor" | "patient"
- `userName`: String - Display name

**Features:**
- Video stream rendering
- Audio/video toggle controls
- Connection status indicator
- Self-view (picture-in-picture)

### ChatBox Component

**Props:**
- `currentUser`: String - Current user's name
- `isDoctor`: Boolean - True if user is a doctor

**Features:**
- Real-time messaging
- Message history
- Auto-scroll to latest message
- Timestamp display

## Troubleshooting

### Video Not Connecting

1. Check Zoom SDK credentials in `.env.local`
2. Verify internet connection
3. Check browser console for errors
4. Ensure camera/microphone permissions are granted

### Chat Not Working

1. Verify both users are in the same session
2. Check browser console for WebSocket errors
3. Ensure proper user roles are set

### Performance Issues

1. Close unnecessary browser tabs
2. Check network bandwidth
3. Reduce video quality in Zoom settings
4. Disable video if only audio is needed

## Security Considerations

### Current Implementation (Testing)
- ⚠️ JWT tokens are generated client-side
- ⚠️ SDK secrets are exposed in environment variables
- ⚠️ No user authentication verification

### Production Requirements
- ✅ Generate tokens on backend server
- ✅ Validate user identity before allowing access
- ✅ Implement rate limiting
- ✅ Use HTTPS for all connections
- ✅ Store SDK secrets securely (environment variables on server)
- ✅ Implement session timeout
- ✅ Log all video call sessions
- ✅ Comply with HIPAA regulations for healthcare data

## Next Steps for Production

1. **Backend Token Generation**: Implement secure JWT token generation on your backend
2. **Database Integration**: Store session metadata in database
3. **Recording**: Implement cloud recording with patient consent
4. **Compliance**: Ensure HIPAA compliance for all video data
5. **Quality of Service**: Monitor video quality and connection stability
6. **Fallback**: Implement audio-only fallback for poor connections
7. **Notifications**: Add call notifications and reminders
8. **Session Management**: Implement proper session creation and joining flows

## Resources

- [Zoom Video SDK Documentation](https://developers.zoom.us/docs/video-sdk/)
- [JWT Token Generation](https://developers.zoom.us/docs/video-sdk/auth/)
- [HIPAA Compliance Guide](https://zoom.us/healthcare)

## Support

For issues or questions:
1. Check Zoom Video SDK documentation
2. Review browser console for errors
3. Verify all environment variables are set correctly
4. Test with a simple Zoom SDK example first

---

**Remember**: This is a testing implementation. Do NOT deploy to production without implementing proper security measures!
