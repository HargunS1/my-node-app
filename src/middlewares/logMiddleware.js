const config = require('config');

module.exports = (req, res, next) => {
    if (config.get('logLevel') === 'debug') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
};

