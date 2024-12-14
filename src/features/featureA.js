const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Feature A is enabled : Develope Branch');
});

module.exports = router;

