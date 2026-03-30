const { getUsers } = require('../db/mongo');
const { sendJson, sendError } = require('../utils/response');
const { logError } = require('../utils/logger');

async function listUsers(req, res) {
    try {
        const queryRole = req.query.role;
        const filter = queryRole ? { role: queryRole } : {};
        
        const usersColl = getUsers();
        // Exclude passwords strictly
        const usersList = await usersColl.find(filter, { projection: { password: 0, _id: 0 } }).toArray();
        sendJson(res, 200, usersList);
    } catch (err) {
        logError('List Users Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

module.exports = { listUsers };
