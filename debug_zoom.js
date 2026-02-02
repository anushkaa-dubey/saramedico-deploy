const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const sdkKey = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY;
const sdkSecret = process.env.NEXT_PUBLIC_ZOOM_SDK_SECRET;

console.log('SDK Key:', sdkKey);
console.log('SDK Secret ends with:', sdkSecret ? sdkSecret.slice(-4) : 'MISSING');

if (!sdkKey || !sdkSecret) {
    console.error('Missing credentials');
    process.exit(1);
}

const iat = Math.round(new Date().getTime() / 1000) - 30;
const exp = iat + 60 * 60 * 2;

const payload = {
    sdk_key: sdkKey,
    app_key: sdkKey,
    tpc: 'SaraMedico_Live_Consult',
    role_type: 1,
    version: 1,
    user_identity: 'doctor_test',
    iat,
    exp
};

try {
    const token = jwt.sign(payload, sdkSecret, { algorithm: 'HS256' });
    console.log('Token successfully generated');
    console.log('Payload:', JSON.stringify(payload, null, 2));
} catch (e) {
    console.error('Generation failed:', e);
}
