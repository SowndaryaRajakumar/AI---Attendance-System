const { getNotifications, getLeaderboard, getInsights } = require('../controllers/insightController');
const { authenticate } = require('../utils/authMiddleware');

module.exports = (router) => {
    router.get('/notifications', authenticate, getNotifications);
    router.get('/leaderboard', authenticate, getLeaderboard);
    router.get('/insights', authenticate, getInsights);
};
