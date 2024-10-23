const express = require('express');
const config = require('config');
const logMiddleware = require('./middlewares/logMiddleware');
const routes = require('./routes');

const app = express();

// Middleware
app.use(express.json());
app.use(logMiddleware);

// Load Configuration
const port = config.get('port');

// Feature Flags
const featureFlag = config.get('featureFlag');

// Feature-Specific Middleware or Routes
if (featureFlag.featureA) {
  const featureA = require('./features/featureA');
  app.use('/featureA', featureA);
}

if (featureFlag.featureB) {
  const featureB = require('./features/featureB');
  app.use('/featureB', featureB);
}

// Routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'default'} mode`);
});

