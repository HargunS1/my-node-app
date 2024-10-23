const express = require('express');
const router = express.Router();

// Feature A specific route
router.get('/', (req, res) => {
  res.send('Feature A is enabled');
});

module.exports = router;

