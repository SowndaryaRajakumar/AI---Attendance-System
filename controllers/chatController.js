const aiService = require('../services/aiService');
const { parseBody } = require('../utils/bodyParse');
const { requireFields } = require('../utils/validation');
const { sendJson, sendError } = require('../utils/response');
const { logError } = require('../utils/logger');

async function handleChat(req, res) {
    try {
        const body = await parseBody(req);
        const missing = requireFields(body, ['query']);
        if (missing.length > 0) return sendError(res, 400, `Missing fields: ${missing.join(', ')}`);
        
        const userId = req.user.id;
        
        const response = await aiService.generateChatResponse(userId, body.query);
        sendJson(res, 200, { response });
    } catch (err) {
        logError('Chat API Error', err);
        if (err.message.includes('not configured')) {
            return sendError(res, 503, 'AI service is temporarily unavailable (API key missing)');
        }
        sendError(res, 500, 'Internal Server Error');
    }
}

module.exports = { handleChat };
