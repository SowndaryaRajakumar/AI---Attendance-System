const http = require('http');
const { loadEnv } = require('./config/env');
const { logInfo } = require('./utils/logger');
const { connectDB } = require('./db/mongo');

// 1. Load environment variables
loadEnv();

const PORT = process.env.PORT || 3000;

// 2. Connect to Database, then start server
connectDB().then(() => {
    const baseRouter = require('./routes/index');

    const server = http.createServer((req, res) => {
        logInfo(`Req: ${req.method} ${req.url}`);

        // Handle basic CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
        }

        // 3. Delegate to exact route handler
        baseRouter.handle(req, res);
    });

    server.listen(PORT, () => {
        logInfo(`Server is running locally natively on port ${PORT}`);
    });
});
