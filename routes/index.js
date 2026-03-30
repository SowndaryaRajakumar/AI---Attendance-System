const Router = require('../utils/router');
const rateLimit = require('../utils/rateLimiter');
const { sendJson } = require('../utils/response');

const router = new Router();

// Global middlewares
router.use(rateLimit);

// Base route for testing
router.get('/health', (req, res) => {
    sendJson(res, 200, { status: 'OK', timestamp: new Date().toISOString() });
});

// Register Sub-routes
require('./authRoutes')(router);
require('./userRoutes')(router);
require('./attendanceRoutes')(router);
require('./insightRoutes')(router);
require('./leaveRoutes')(router);
require('./chatRoutes')(router);

module.exports = router;
