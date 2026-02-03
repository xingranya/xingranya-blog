const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../config');

// 本地图片目录
const imagesDir = path.resolve(__dirname, '..', config.blogRoot, 'themes/defaultone/source/images');

// 确保目录存在
const ensureDir = () => {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};

// 生成唯一文件名
const generateFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_')
    .substring(0, 50);
  const timestamp = Date.now();
  return `${base}-${timestamp}${ext}`;
};

// 从URL获取文件扩展名
const getExtFromUrl = (url) => {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
    return ext;
  }
  return '.jpg';
};

module.exports = {
  // 上传文件到本地
  upload: async (fileBuffer, filename) => {
    ensureDir();

    const newFilename = generateFilename(filename);
    const filePath = path.join(imagesDir, newFilename);

    fs.writeFileSync(filePath, fileBuffer);

    return {
      name: newFilename,
      url: `/images/${newFilename}`,
      size: fileBuffer.length,
      uploadedAt: new Date().toISOString()
    };
  },

  // 从URL下载图片到本地
  downloadFromUrl: async (url) => {
    ensureDir();

    return new Promise((resolve, reject) => {
      const ext = getExtFromUrl(url);
      const filename = `download-${Date.now()}${ext}`;
      const filePath = path.join(imagesDir, filename);

      const protocol = url.startsWith('https') ? https : http;

      const request = protocol.get(url, {
        rejectUnauthorized: false,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (response) => {
        // 处理重定向
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          module.exports.downloadFromUrl(response.headers.location)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`下载失败: HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFileSync(filePath, buffer);

          resolve({
            name: filename,
            url: `/images/${filename}`,
            size: buffer.length,
            uploadedAt: new Date().toISOString()
          });
        });
        response.on('error', reject);
      });

      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('下载超时'));
      });
    });
  },

  // 获取所有图片
  list: async () => {
    ensureDir();

    const files = fs.readdirSync(imagesDir)
      .filter(f => /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(f))
      .map(filename => {
        const filePath = path.join(imagesDir, filename);
        const stats = fs.statSync(filePath);
        return {
          name: filename,
          url: `/images/${filename}`,
          size: stats.size,
          uploadedAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return files;
  },

  // 删除图片
  delete: async (filename) => {
    const safeName = path.basename(filename);
    const filePath = path.join(imagesDir, safeName);

    if (!filePath.startsWith(imagesDir)) {
      throw new Error('非法文件路径');
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return true;
  }
};
