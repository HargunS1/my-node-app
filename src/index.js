const express = require('express');
const config = require('config');
const routes = require('./routes');
const logMiddleware = require('./middlewares/logMiddleware');
const client = require('prom-client'); // Import prom-client for Prometheus

const app = express();
app.use(express.json());
app.use(logMiddleware);

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // Collect default system metrics

// Custom metrics
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'], // Labels for analysis
});

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5], // Response time buckets
});

// Middleware to track metrics for each request
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer(); // Start a timer
    res.on('finish', () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status: res.statusCode,
        }); // Increment counter
        end({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status: res.statusCode,
        }); // Record duration
    });
    next();
});

// Expose metrics at /metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Load configurations
const port = config.get('port') || 4000; // Default to 4000 if not set in config
const featureFlag = config.get('featureFlag');

// Enable features based on configuration
if (featureFlag.featureA) {
    const featureA = require('./features/featureA');
    app.use('/featureA', featureA);
}
if (featureFlag.featureB) {
    const featureB = require('./features/featureB');
    app.use('/featureB', featureB);
}
if (featureFlag.featureC) { // Example feature flag check
    const featureC = require('./features/featureC');
    app.use('/featureC', featureC);
}

// Routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Metrics available at http://localhost:${port}/metrics`);
});

