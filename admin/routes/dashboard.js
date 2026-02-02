const express = require('express');
const router = express.Router();
const postsService = require('../services/posts');
const mediaService = require('../services/media');
const auth = require('../middleware/auth');
const os = require('os');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const stats = await postsService.getStats();

    // Recent posts
    const postsResult = await postsService.list(1, 5);

    const systemInfo = {
      platform: os.platform(),
      uptime: os.uptime(),
      load: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      }
    };

    res.json({
      stats,
      recentPosts: postsResult.posts,
      system: systemInfo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/dashboard/stats
// @desc    Get dashboard stats (posts, categories, tags, media count)
router.get('/stats', async (req, res) => {
  try {
    const stats = await postsService.getStats();
    const mediaList = await mediaService.list();

    res.json({
      postsCount: stats.postsCount,
      categoriesCount: stats.categoriesCount,
      tagsCount: stats.tagsCount,
      mediaCount: mediaList.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/dashboard/monthly
// @desc    Get monthly post statistics for chart
router.get('/monthly', async (req, res) => {
  try {
    const monthlyStats = await postsService.getMonthlyStats();
    res.json(monthlyStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/dashboard/categories
// @desc    Get all categories with count
router.get('/categories', async (req, res) => {
  try {
    const categories = await postsService.getCategories();
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/dashboard/tags
// @desc    Get all tags with count
router.get('/tags', async (req, res) => {
  try {
    const tags = await postsService.getTags();
    res.json({ tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
