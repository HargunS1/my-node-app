const express = require('express');
const router = express.Router();

// Feature B specific route
router.get('/', (req, res) => {
  res.send('Feature B is enabled');
});

module.exports = router;

