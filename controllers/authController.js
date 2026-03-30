const { getUsers } = require('../db/mongo');
const { hashPassword, verifyPassword } = require('../utils/password');
const { sign } = require('../utils/jwt');
const { sendJson, sendError } = require('../utils/response');
const { parseBody } = require('../utils/bodyParse');
const { validateEmail, requireFields } = require('../utils/validation');
const crypto = require('crypto');
const { logInfo, logError } = require('../utils/logger');

async function signup(req, res) {
    try {
        const body = await parseBody(req);
        const missing = requireFields(body, ['name', 'email', 'password', 'role']);
        if (missing.length > 0) return sendError(res, 400, `Missing fields: ${missing.join(', ')}`);
        
        if (!validateEmail(body.email)) return sendError(res, 400, 'Invalid email format');
        
        if (!['admin', 'faculty', 'student'].includes(body.role)) {
            return sendError(res, 400, 'Invalid role. Must be admin, faculty, or student');
        }

        const usersColl = getUsers();
        const existingUser = await usersColl.findOne({ email: body.email });
        if (existingUser) return sendError(res, 409, 'User already exists with this email');

        const hashedPassword = hashPassword(body.password);
        const userId = crypto.randomUUID();

        const newUser = {
            id: userId,
            name: body.name,
            email: body.email,
            password: hashedPassword,
            role: body.role,
            createdAt: new Date()
        };

        await usersColl.insertOne(newUser);
        logInfo(`New user signed up: ${body.email} (${body.role})`);
        
        const token = sign({ id: userId, role: body.role });
        sendJson(res, 201, { message: 'Signup successful', token, user: { id: userId, name: body.name, role: body.role } });
    } catch (err) {
        logError('Signup Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

async function login(req, res) {
    try {
        const body = await parseBody(req);
        const missing = requireFields(body, ['email', 'password']);
        if (missing.length > 0) return sendError(res, 400, `Missing fields: ${missing.join(', ')}`);
        
        const usersColl = getUsers();
        const user = await usersColl.findOne({ email: body.email });
        if (!user) return sendError(res, 401, 'Invalid credentials');
        
        const isValid = verifyPassword(body.password, user.password);
        if (!isValid) return sendError(res, 401, 'Invalid credentials');
        
        logInfo(`User logged in: ${body.email}`);
        
        const token = sign({ id: user.id, role: user.role });
        sendJson(res, 200, { message: 'Login successful', token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        logError('Login Error', err);
        sendError(res, 500, 'Internal Server Error');
    }
}

module.exports = { signup, login };
