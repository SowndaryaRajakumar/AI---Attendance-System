const path = require('path');
const fs = require('fs');

const logFilePath = path.resolve(process.cwd(), 'app.log');

function logInfo(message, meta = '') {
    const logMsg = `[INFO] [${new Date().toISOString()}] ${message} ${meta ? JSON.stringify(meta) : ''}`;
    console.log(`\x1b[36m${logMsg}\x1b[0m`); // Cyan
    appendLog(logMsg);
}

function logError(message, error = '') {
    const errorBody = error instanceof Error ? (error.stack || error.message) : error;
    const logMsg = `[ERROR] [${new Date().toISOString()}] ${message} ${errorBody}`;
    console.error(`\x1b[31m${logMsg}\x1b[0m`); // Red
    appendLog(logMsg);
}

function logWarn(message, meta = '') {
    const logMsg = `[WARN] [${new Date().toISOString()}] ${message} ${meta ? JSON.stringify(meta) : ''}`;
    console.warn(`\x1b[33m${logMsg}\x1b[0m`); // Yellow
    appendLog(logMsg);
}

function appendLog(message) {
    fs.appendFile(logFilePath, message + '\n', (err) => {
        if (err) console.error('Failed to write to log file', err);
    });
}

module.exports = { logInfo, logError, logWarn };
