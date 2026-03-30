const { signup, login } = require('../controllers/authController');

module.exports = (router) => {
    router.post('/signup', signup);
    router.post('/login', login);
};
