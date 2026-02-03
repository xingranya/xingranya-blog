const express = require('express');
const router = express.Router();
const mediaService = require('../services/media');
const auth = require('../middleware/auth');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(auth);

// @route   GET api/media
// @desc    获取所有图片
router.get('/', async (req, res) => {
  try {
    const files = await mediaService.list();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/media/upload
// @desc    上传图片到本地
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择文件' });
    }

    const result = await mediaService.upload(
      req.file.buffer,
      req.file.originalname
    );
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || '上传失败' });
  }
});

// @route   POST api/media/url
// @desc    从URL下载图片到本地
router.post('/url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: '请输入图片URL' });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ message: '请输入有效的URL' });
    }

    const result = await mediaService.downloadFromUrl(url);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || '下载失败' });
  }
});

// @route   DELETE api/media/:filename
// @desc    删除图片
router.delete('/:filename', async (req, res) => {
  try {
    await mediaService.delete(req.params.filename);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
