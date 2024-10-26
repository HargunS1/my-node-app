const express = require('express');
const router = express.Router();
const homeController = require('./controllers/homeController');

// Home route
router.get('/', homeController.getHome);

// Health check route
router.get('/health', (req, res) => {
    res.send({ status: 'Healthy' });
});

module.exports = router;

