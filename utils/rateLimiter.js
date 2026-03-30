const { sendError } = require('./response');
const { logWarn } = require('./logger');

const requestsMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

function rateLimit(req, res, next) {
    const ip = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (!requestsMap.has(ip)) {
        requestsMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return next();
    }
    
    const record = requestsMap.get(ip);
    
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + WINDOW_MS;
        return next();
    }
    
    record.count++;
    if (record.count > MAX_REQUESTS) {
        logWarn(`Rate limit exceeded for IP: ${ip}`);
        sendError(res, 429, 'Too many requests. Please try again later.');
        return; // Request drops here by avoiding next() call
    }
    
    next();
}

// Memory cleanup interval
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestsMap.entries()) {
        if (now > record.resetTime) {
            requestsMap.delete(ip);
        }
    }
}, 5 * 60 * 1000).unref(); // unref prevents interval from blocking process exit

module.exports = rateLimit;
