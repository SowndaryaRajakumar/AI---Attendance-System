const crypto = require('crypto');

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function sign(payload, secret = process.env.JWT_SECRET) {
    if (!secret) throw new Error("JWT_SECRET is missing");
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const signature = crypto.createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
        
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verify(token, secret = process.env.JWT_SECRET) {
    if (!token || !secret) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    
    if (signature !== expectedSignature) return null;
    
    try {
        const payloadString = Buffer.from(encodedPayload, 'base64').toString('utf8');
        return JSON.parse(payloadString);
    } catch (e) {
        return null;
    }
}

module.exports = { sign, verify };
