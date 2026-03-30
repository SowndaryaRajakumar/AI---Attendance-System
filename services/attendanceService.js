const { getAttendance } = require('../db/mongo');
const { logInfo, logError } = require('../utils/logger');
const crypto = require('crypto');

async function markAttendance(studentId, date, status) {
    const attendanceColl = getAttendance();

    const existing = await attendanceColl.findOne({ studentId, date });
    if (existing) {
        throw new Error(`Attendance for ${date} is already marked for this student`);
    }

    const record = {
        id: crypto.randomUUID(),
        studentId,
        date,
        status,
        createdAt: new Date()
    };

    await attendanceColl.insertOne(record);
    logInfo(`Marked attendance for ${studentId} on ${date} as ${status}`);
    return record;
}

async function getStudentAttendanceSummary(studentId) {
    const attendanceColl = getAttendance();

    const records = await attendanceColl.find({ studentId }).toArray();

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = total - present;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    return { total, present, absent, percentage, records };
}
async function getClassAttendanceSummary(date) {
    const attendanceColl = getAttendance();
    const filter = date ? { date } : {};
    const records = await attendanceColl.find(filter).toArray();

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = total - present;
    // Calculate global percentage for a class or specific date
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    return { total, present, absent, percentage, date: date || 'all-time' };
}

module.exports = { markAttendance, getStudentAttendanceSummary, getClassAttendanceSummary };
