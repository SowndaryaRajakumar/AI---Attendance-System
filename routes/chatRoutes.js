const { handleChat } = require('../controllers/chatController');
const { authenticate } = require('../utils/authMiddleware');

module.exports = (router) => {
    router.post('/chat', authenticate, handleChat);
};
