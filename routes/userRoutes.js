const { listUsers } = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../utils/authMiddleware');

module.exports = (router) => {
    // Only admins or faculty can list users
    router.get('/users', authenticate, authorizeRoles('admin', 'faculty'), listUsers);
};
