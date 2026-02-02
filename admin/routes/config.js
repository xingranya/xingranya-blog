const express = require('express');
const router = express.Router();
const configService = require('../services/config');
const auth = require('../middleware/auth');

// All routes here require auth
router.use(auth);

// @route   GET api/config
// @desc    Get blog configuration
router.get('/', async (req, res) => {
  try {
    const result = await configService.get();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT api/config
// @desc    Update blog configuration
router.put('/', async (req, res) => {
  try {
    const result = await configService.update(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
