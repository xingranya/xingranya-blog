const express = require('express');
const router = express.Router();
const postsService = require('../services/posts');
const auth = require('../middleware/auth');

// All routes here require auth
router.use(auth);

// @route   GET api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await postsService.list(page, limit, search);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/posts/:filename
// @desc    Get single post
router.get('/:filename', async (req, res) => {
  try {
    const result = await postsService.get(req.params.filename);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: 'Post not found' });
  }
});

// @route   POST api/posts
// @desc    Create post
router.post('/', async (req, res) => {
  try {
    const result = await postsService.create(req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT api/posts/:filename
// @desc    Update post
router.put('/:filename', async (req, res) => {
  try {
    const result = await postsService.update(req.params.filename, req.body);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE api/posts/:filename
// @desc    Delete post
router.delete('/:filename', async (req, res) => {
  try {
    await postsService.delete(req.params.filename);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
