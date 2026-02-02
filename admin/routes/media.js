const express = require('express');
const router = express.Router();
const mediaService = require('../services/media');
const auth = require('../middleware/auth');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

// @route   GET api/media
// @desc    Get all media files
router.get('/', async (req, res) => {
  try {
    const files = await mediaService.list();
    res.json(files); // Fixed: return array directly or wrapped? Frontend expects array or {files: []}?
                     // Frontend media.js: renderGrid(res). If res is array.
                     // Previous media.js: res.json({ files });
                     // Frontend media.js: const res = await API.get('/media'); if (!res || res.length === 0)...
                     // Let's check frontend media.js again.
                     // It says: renderGrid(res).
                     // So backend should return array.
                     // But previous backend returned {files}.
                     // Let's check frontend media.js logic I wrote.
                     // "renderGrid(res)" -> implies res is the array.
                     // "if (!res || res.length === 0)" -> implies res is the array.
                     // So I should return array here or fix frontend.
                     // I will return array here.
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/media/upload
// @desc    Upload media file to 图仓
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const result = await mediaService.upload(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
    );
    res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

// @route   DELETE api/media/:filename
// @desc    Delete media record
router.delete('/:filename', async (req, res) => {
  try {
    await mediaService.delete(req.params.filename);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
