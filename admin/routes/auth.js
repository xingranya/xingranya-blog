const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { loginLimiter } = require('../middleware/security');

// @route   POST api/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Please enter password' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, config.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Sign token
  jwt.sign(
    { role: 'admin' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
    (err, token) => {
      if (err) {
        console.error('JWT sign error:', err);
        return res.status(500).json({ message: 'Token generation failed' });
      }
      res.json({
        token,
        user: {
          role: 'admin'
        }
      });
    }
  );
});

// @route   GET api/auth/user
// @desc    Get user data (validate token)
// @access  Private
const auth = require('../middleware/auth');
router.get('/user', auth, (req, res) => {
  res.json({ role: 'admin' });
});

module.exports = router;
