const { getLeaveRequests } = require('../db/mongo');
const crypto = require('crypto');
const { getStudentAttendanceSummary } = require('./attendanceService');

async function applyLeave(studentId, date, reason) {
    const leaveColl = getLeaveRequests();
    
    // AI Suggestion logic (based on attendance)
    let aiSuggestion = 'neutral';
    try {
        const summary = await getStudentAttendanceSummary(studentId);
        if (summary.total > 0) {
            if (summary.percentage < 70) {
                aiSuggestion = 'reject: attendance below threshold';
            } else if (summary.percentage >= 85) {
                aiSuggestion = 'approve: good attendance record';
            } else {
                aiSuggestion = 'neutral: acceptable attendance';
            }
        } else {
            aiSuggestion = 'neutral: no attendance data yet';
        }
    } catch (e) {
        // Fallback
    }

    const record = {
        id: crypto.randomUUID(),
        studentId,
        date,
        reason,
        status: 'pending', 
        aiSuggestion,
        createdAt: new Date()
    };

    await leaveColl.insertOne(record);
    return record;
}

async function respondLeave(requestId, status) {
    const leaveColl = getLeaveRequests();
    // Using findOneAndUpdate to atomically update and return the new doc
    const result = await leaveColl.findOneAndUpdate(
        { id: requestId },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    if (!result) throw new Error('Leave request not found');
    return result;
}

module.exports = { applyLeave, respondLeave };
