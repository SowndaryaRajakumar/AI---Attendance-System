function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message, details = null) {
    const errorResponse = { error: message };
    if (details) errorResponse.details = details;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorResponse));
}

module.exports = { sendJson, sendError };
