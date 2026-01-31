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

        const iat = Math.round(new Date().getTime() / 1000) - 30;
        const exp = iat + 60 * 60 * 2; // 2 hours

        const payload = {
            app_key: sdkKey,
            tpc: sessionName,
            role_type: role,
            version: 1,
            user_identity: userIdentity,
            iat,
            exp
        };

        const token = jwt.sign(payload, sdkSecret, { algorithm: 'HS256' });

        return NextResponse.json({
            token,
            sdkKey,
            sessionName,
            role,
            userIdentity,
            sessionPassword: process.env.NEXT_PUBLIC_ZOOM_SESSION_PASSWORD || '',
        });
    } catch (error) {
        console.error('API Zoom Token Error:', error);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}
