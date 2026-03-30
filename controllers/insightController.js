const notificationService = require('../services/notificationService');
const gamificationService = require('../services/gamificationService');
const attendanceService = require('../services/attendanceService');
const { sendJson, sendError } = require('../utils/response');
const { logError } = require('../utils/logger');

async function getNotifications(req, res) {
    try {
        const userId = req.user.id;
        const notes = await notificationService.getUserNotifications(userId);
        sendJson(res, 200, notes);
    } catch (err) {
        logError('Get Notifications Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function getLeaderboard(req, res) {
    try {
        const leaderboard = await gamificationService.getLeaderboard();
        sendJson(res, 200, leaderboard);
    } catch (err) {
        logError('Get Leaderboard Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function getInsights(req, res) {
    try {
        const studentId = req.user.role === 'student' ? req.user.id : req.query.studentId;
        if (!studentId) return sendError(res, 400, 'studentId query parameter required for faculty/admin');
        
        const summary = await attendanceService.getStudentAttendanceSummary(studentId);
        
        let insights = [];
        const targetPercent = 75;
        
        if (summary.total > 0 && summary.percentage < targetPercent) {
            const extraClassesRequired = Math.ceil(((targetPercent / 100) * summary.total - summary.present) / (1 - (targetPercent / 100)));
            insights.push(`You must attend the next ${extraClassesRequired} classes to reach ${targetPercent}%.`);
            insights.push('Risk of shortage if absent again!');
        } else if (summary.total > 0) {
            insights.push('You are in a safe zone regarding attendance.');
            if (summary.percentage === 100) insights.push('Perfect attendance streak!');
        } else {
            insights.push('No attendance data available yet.');
        }
        
        sendJson(res, 200, { summary, insights });
    } catch (err) {
        logError('Get Insights Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

module.exports = { getNotifications, getLeaderboard, getInsights };
