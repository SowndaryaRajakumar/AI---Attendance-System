const { logInfo, logError } = require('./logger');
const { sendError } = require('./response');

class Router {
    constructor() {
        this.routes = [];
        this.middlewares = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    addRoute(method, path, ...handlers) {
        const paramNames = [];
        const regexPath = path.replace(/:([^\/]+)/g, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });
        const regex = new RegExp(`^${regexPath}$`);

        this.routes.push({
            method: method.toUpperCase(),
            path,
            regex,
            paramNames,
            handlers
        });
    }

    get(path, ...handlers) { this.addRoute('GET', path, ...handlers); }
    post(path, ...handlers) { this.addRoute('POST', path, ...handlers); }
    put(path, ...handlers) { this.addRoute('PUT', path, ...handlers); }
    delete(path, ...handlers) { this.addRoute('DELETE', path, ...handlers); }

    async handle(req, res) {
        for (const mw of this.middlewares) {
            const nextContent = await new Promise(resolve => mw(req, res, () => resolve(true)));
            if (!nextContent) return; // Middleware responded, so end chain
        }

        const [urlPath, queryString] = req.url.split('?');
        req.query = {};
        if (queryString) {
            new URLSearchParams(queryString).forEach((value, key) => {
                req.query[key] = value;
            });
        }

        const method = req.method.toUpperCase();
        let matchedRoute = null;
        let params = {};

        for (const route of this.routes) {
            if (route.method === method) {
                const match = urlPath.match(route.regex);
                if (match) {
                    matchedRoute = route;
                    route.paramNames.forEach((name, index) => {
                        params[name] = match[index + 1];
                    });
                    break;
                }
            }
        }

        if (!matchedRoute) {
            logInfo(`Route not found: ${method} ${urlPath}`);
            return sendError(res, 404, 'Route not found');
        }

        req.params = params;

        try {
            let i = 0;
            const next = async () => {
                if (i < matchedRoute.handlers.length) {
                    const handler = matchedRoute.handlers[i++];
                    await handler(req, res, next);
                }
            };
            await next();
        } catch (error) {
            logError(`Unhandled error in route ${method} ${urlPath}`, error);
            if (!res.headersSent) {
                sendError(res, 500, 'Internal Server Error');
            }
        }
    }
}

module.exports = Router;
