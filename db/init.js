const { connectDB, getDb } = require('./mongo');
const { loadEnv } = require('../config/env');
const { logInfo, logError } = require('../utils/logger');

async function initializeDb() {
    loadEnv();
    await connectDB();
    const db = getDb();
    
    try {
        logInfo('Creating indexes...');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        
        // Prevent duplicate attendance per student per date
        await db.collection('attendance').createIndex({ studentId: 1, date: 1 }, { unique: true });
        
        await db.collection('chatlogs').createIndex({ userId: 1 });
        await db.collection('notifications').createIndex({ userId: 1 });
        await db.collection('leaveRequests').createIndex({ studentId: 1 });
        
        logInfo('Database initialization and index creation complete.');
    } catch (error) {
        logError('Failed to initialize database indices', error);
    } finally {
        process.exit();
    }
}

if (require.main === module) {
    initializeDb();
}

module.exports = { initializeDb };
