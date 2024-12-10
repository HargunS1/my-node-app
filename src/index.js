const express = require('express');
const config = require('config');
const routes = require('./routes');
const logMiddleware = require('./middlewares/logMiddleware');

const app = express();
app.use(express.json());
app.use(logMiddleware);

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
