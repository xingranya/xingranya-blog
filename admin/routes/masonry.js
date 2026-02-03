const express = require('express');
const router = express.Router();
const masonryService = require('../services/masonry');
const mediaService = require('../services/media');
const auth = require('../middleware/auth');
const https = require('https');
const http = require('http');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// @route   GET api/masonry/proxy
// @desc    代理外部图片（绕过SSL限制）- 无需认证
router.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return res.status(400).json({ message: '无效的URL' });
  }

  try {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, {
      rejectUnauthorized: false,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // 重定向
        return res.redirect(`/api/masonry/proxy?url=${encodeURIComponent(response.headers.location)}`);
      }
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).end();
      }
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      response.pipe(res);
    });
    request.on('error', () => res.status(500).end());
    request.setTimeout(10000, () => { request.destroy(); res.status(504).end(); });
  } catch (e) {
    res.status(500).end();
  }
});

// 其他路由需要认证
router.use(auth);

// @route   GET api/masonry
// @desc    获取所有 masonry 图片
router.get('/', async (req, res) => {
  try {
    const images = await masonryService.list();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/masonry
// @desc    添加新图片（支持 URL 或上传文件）
router.post('/', upload.single('file'), async (req, res) => {
  try {
    let imageUrl;

    // 如果上传了文件，先上传到图仓
    if (req.file) {
      const uploadResult = await mediaService.upload(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      imageUrl = uploadResult.url;
    } else if (req.body.url) {
      // 使用提供的 URL
      imageUrl = req.body.url;
    } else {
      return res.status(400).json({ message: '请提供图片文件或 URL' });
    }

    const newImage = await masonryService.add({
      url: imageUrl,
      title: req.body.title || '',
      description: req.body.description || ''
    });
    res.json({ success: true, data: newImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || '添加失败' });
  }
});

// @route   PUT api/masonry/:id
// @desc    更新图片信息
router.put('/:id', async (req, res) => {
  try {
    const updatedImage = await masonryService.update(req.params.id, req.body);
    res.json({ success: true, data: updatedImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || '更新失败' });
  }
});

// @route   DELETE api/masonry/:id
// @desc    删除图片
router.delete('/:id', async (req, res) => {
  try {
    await masonryService.delete(req.params.id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || '删除失败' });
  }
});

module.exports = router;
