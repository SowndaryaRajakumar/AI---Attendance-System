const { applyLeave, respondLeave } = require('../controllers/leaveController');
const { authenticate, authorizeRoles } = require('../utils/authMiddleware');

module.exports = (router) => {
    router.post('/leave/apply', authenticate, authorizeRoles('student'), applyLeave);
    router.put('/leave/respond', authenticate, authorizeRoles('faculty', 'admin'), respondLeave);
};
