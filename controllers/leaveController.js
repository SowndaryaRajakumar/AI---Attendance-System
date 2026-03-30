const leaveService = require('../services/leaveService');
const { parseBody } = require('../utils/bodyParse');
const { requireFields } = require('../utils/validation');
const { sendJson, sendError } = require('../utils/response');
const { logError } = require('../utils/logger');

async function applyLeave(req, res) {
    try {
        const body = await parseBody(req);
        const missing = requireFields(body, ['date', 'reason']);
        if (missing.length > 0) return sendError(res, 400, `Missing fields: ${missing.join(', ')}`);
        
        const studentId = req.user.id;
        
        const record = await leaveService.applyLeave(studentId, body.date, body.reason);
        sendJson(res, 201, { message: 'Leave request submitted successfully', record });
    } catch (err) {
        logError('Apply Leave Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function respondLeave(req, res) {
    try {
        const body = await parseBody(req);
        const missing = requireFields(body, ['requestId', 'status']);
        if (missing.length > 0) return sendError(res, 400, `Missing fields: ${missing.join(', ')}`);
        
        if (!['approved', 'rejected'].includes(body.status)) {
            return sendError(res, 400, 'Status must be approved or rejected');
        }

        const record = await leaveService.respondLeave(body.requestId, body.status);
        sendJson(res, 200, { message: `Leave ${body.status}`, record });
    } catch (err) {
        logError('Respond Leave Error', err);
        if (err.message === 'Leave request not found') return sendError(res, 404, err.message);
        sendError(res, 500, 'Internal Server Error');
    }
}

module.exports = { applyLeave, respondLeave };
