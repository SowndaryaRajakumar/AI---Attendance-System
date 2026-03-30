const { MongoClient } = require('mongodb');
const { logInfo, logError } = require('../utils/logger');

let db = null;

async function connectDB() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance_db';
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db();
        logInfo('Connected to MongoDB successfully');
        return db;
    } catch (err) {
        logError('MongoDB connection error', err);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
}

module.exports = {
    connectDB,
    getDb,
    getUsers: () => getDb().collection('users'),
    getAttendance: () => getDb().collection('attendance'),
    getNotifications: () => getDb().collection('notifications'),
    getChatlogs: () => getDb().collection('chatlogs'),
    getLeaveRequests: () => getDb().collection('leaveRequests'),
    getAchievements: () => getDb().collection('achievements')
};
