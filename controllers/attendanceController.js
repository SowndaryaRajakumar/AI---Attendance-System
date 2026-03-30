const attendanceService = require('../services/attendanceService');
const { parseBody } = require('../utils/bodyParse');
const { requireFields } = require('../utils/validation');
const { sendJson, sendError } = require('../utils/response');
const { logError } = require('../utils/logger');

async function markAttendance(req, res) {
    try {
        const body = await parseBody(req);
        const missing = requireFields(body, ['studentId', 'date', 'status']);
        if (missing.length > 0) return sendError(res, 400, `Missing fields: ${missing.join(', ')}`);
        
        if (!['present', 'absent'].includes(body.status)) {
            return sendError(res, 400, 'Status must be present or absent');
        }

        const record = await attendanceService.markAttendance(body.studentId, body.date, body.status);
        
        // Will trigger async notification service here later 
        if (body.status === 'absent') {
            // Check threshold natively
            try {
                const ns = require('../services/notificationService');
                ns.checkStudentThreshold(body.studentId).catch(e => logError('Warning: Threshold check failed', e));
            } catch(e) {} // Ignore if not implemented yet
        }
        
        sendJson(res, 201, { message: 'Attendance marked successfully', record });
    } catch (err) {
        if (err.message.includes('already marked')) {
            return sendError(res, 409, err.message);
        }
        logError('Mark Attendance Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function getStudentAttendance(req, res) {
    try {
        const studentId = req.params.studentId;
        if (!studentId) return sendError(res, 400, 'Student ID required');
        
        const summary = await attendanceService.getStudentAttendanceSummary(studentId);
        sendJson(res, 200, summary);
    } catch (err) {
        logError('Get Student Attendance Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function getReport(req, res) {
    try {
        const date = req.query.date;
        const summary = await attendanceService.getClassAttendanceSummary(date);
        sendJson(res, 200, summary);
    } catch (err) {
        logError('Get Report Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

module.exports = { markAttendance, getStudentAttendance, getReport };
