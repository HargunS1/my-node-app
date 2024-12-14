const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Feature B is enabled from develop to staging');
});

module.exports = router;

