const express = require('express');
const router = express.Router();
const hexoService = require('../services/hexo');
const auth = require('../middleware/auth');

// All routes here require auth
router.use(auth);

// @route   POST api/deploy
// @desc    Deploy blog (hexo deploy)
router.post('/', async (req, res) => {
  try {
    const result = await hexoService.deploy();
    res.json({
      success: true,
      output: result.stdout + (result.stderr ? '\n' + result.stderr : '')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message || 'Deployment failed',
      output: err.message
    });
  }
});

// @route   POST api/deploy/generate
// @desc    Manually trigger generate (npm run build)
router.post('/generate', async (req, res) => {
  try {
    const result = await hexoService.generate();
    res.json({
      success: true,
      output: result.stdout + (result.stderr ? '\n' + result.stderr : '')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message || 'Generation failed',
      output: err.message
    });
  }
});

// @route   POST api/deploy/clean
// @desc    Clean cache (npm run clean)
router.post('/clean', async (req, res) => {
  try {
    const result = await hexoService.clean();
    res.json({
      success: true,
      output: result.stdout + (result.stderr ? '\n' + result.stderr : '')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message || 'Clean failed',
      output: err.message
    });
  }
});

module.exports = router;
