const express = require('express');
const config = require('config');
const routes = require('./routes');
const logMiddleware = require('./middlewares/logMiddleware');
const promClient = require('prom-client'); // For Prometheus metrics

const app = express();
app.use(express.json());
app.use(logMiddleware);

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register }); // Collect default Node.js metrics

// Custom HTTP request counter
const httpRequestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
});

// Middleware to increment request counter
app.use((req, res, next) => {
    httpRequestCounter.inc();
    next();
});

// Expose Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Load configurations
const port = config.get('port');
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
if (featureFlag.featureC) {  // New feature flag check
    const featureC = require('./features/featureC');
    app.use('/featureC', featureC);
}

// Routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
