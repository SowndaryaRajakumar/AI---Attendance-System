const { getNotifications } = require('../db/mongo');
const { getStudentAttendanceSummary } = require('./attendanceService');
const { logInfo, logError } = require('../utils/logger');
const crypto = require('crypto');

async function createNotification(userId, message, type) {
    const notificationsColl = getNotifications();
    const record = {
        id: crypto.randomUUID(),
        userId,
        message,
        type, 
        timestamp: new Date()
    };
    await notificationsColl.insertOne(record);
    logInfo(`Notification created for ${userId}: ${message}`);
    return record;
}

async function checkStudentThreshold(studentId) {
    try {
        const summary = await getStudentAttendanceSummary(studentId);
        
        if (summary.total > 0 && summary.percentage < 70) {
            await createNotification(
                studentId, 
                `Warning: Your attendance is ${summary.percentage}%, which is below the 70% threshold. Please attend classes regularly!`, 
                'warning'
            );
        } else if (summary.total >= 5 && summary.percentage === 100) {
            await createNotification(
                studentId,
                `Amazing job! You have 100% perfect attendance so far. Consistency is key!`,
                'motivation'
            );
        }
    } catch (err) {
        logError('Threshold Check Error', err);
    }
}

async function getUserNotifications(userId) {
    const notificationsColl = getNotifications();
    return await notificationsColl.find({ userId }).sort({ timestamp: -1 }).toArray();
}

module.exports = { createNotification, checkStudentThreshold, getUserNotifications };
