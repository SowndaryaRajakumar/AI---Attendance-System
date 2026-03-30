const jwt = require('./jwt');
const { sendError } = require('./response');

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, 401, 'Unauthorized: Missing or invalid token');
        return; // Prevents calling next() and effectively drops the request
    }
    
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token);
    
    if (!payload) {
        sendError(res, 401, 'Unauthorized: Invalid token');
        return;
    }
    
    req.user = payload; // Attach payload { id, role } to req
    next();
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return sendError(res, 401, 'Unauthorized: Role missing');
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, 403, 'Forbidden: Insufficient permissions');
        }
        
        next();
    };
}

module.exports = { authenticate, authorizeRoles };
