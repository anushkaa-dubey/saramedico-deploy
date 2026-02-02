import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        const { sessionName, role, userIdentity } = await req.json();

        const sdkKey = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY;
        const sdkSecret = process.env.NEXT_PUBLIC_ZOOM_SDK_SECRET;

        if (!sdkKey || !sdkSecret) {
            return NextResponse.json({ error: 'Zoom SDK credentials missing on server' }, { status: 500 });
        }

        const iat = Math.floor(Date.now() / 1000) - 60;
        const exp = iat + 60 * 60 * 2; // 2 hours

        const payload = {
            app_key: sdkKey,
            tpc: sessionName,
            role_type: parseInt(role, 10),
            version: 1,
            user_identity: userIdentity,
            iat,
            exp
        };

        // Header for JWT
        const header = { alg: 'HS256', typ: 'JWT' };

        console.log('Generating Zoom Token with payload:', {
            app_key: sdkKey,
            tpc: sessionName,
            role_type: parseInt(role, 10),
            userIdentity
        });

        const token = jwt.sign(payload, sdkSecret, { algorithm: 'HS256', header });

        return NextResponse.json({
            token,
            sdkKey,
            sessionName,
            role: parseInt(role, 10),
            userIdentity,
            sessionPassword: process.env.NEXT_PUBLIC_ZOOM_SESSION_PASSWORD || '',
        });
    } catch (error) {
        console.error('API Zoom Token Error:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
