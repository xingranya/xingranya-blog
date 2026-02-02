const fs = require('fs');
const path = require('path');
const config = require('../config');
const https = require('https');
const http = require('http');

// Store uploaded media info locally for reference
const mediaDbPath = path.resolve(__dirname, '..', 'media-db.json');

// Initialize media database
const initDb = () => {
  if (!fs.existsSync(mediaDbPath)) {
    fs.writeFileSync(mediaDbPath, JSON.stringify({ files: [] }), 'utf8');
  }
};

const getDb = () => {
  initDb();
  try {
    return JSON.parse(fs.readFileSync(mediaDbPath, 'utf8'));
  } catch (e) {
    return { files: [] };
  }
};

const saveDb = (data) => {
  fs.writeFileSync(mediaDbPath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = {
  // Upload to 图仓
  upload: async (fileBuffer, filename, mimetype) => {
    const FormData = (await import('form-data')).default;
    const fetch = (await import('node-fetch')).default;

    const form = new FormData();
    form.append('token', config.tucang.token);
    form.append('folderId', config.tucang.folderId);
    form.append('file', fileBuffer, {
      filename: filename,
      contentType: mimetype
    });

    // 创建一个忽略 SSL 验证的 agent
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch(config.tucang.apiUrl, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      agent: (_parsedURL) => _parsedURL.protocol === 'https:' ? httpsAgent : undefined
    });

    const result = await response.json();

    if (result.code === 200 || result.code === 0 || result.success) {
      // Save to local database
      const db = getDb();
      const fileInfo = {
        name: filename,
        url: result.data?.url || result.url || result.data,
        uploadedAt: new Date().toISOString(),
        size: fileBuffer.length
      };
      db.files.unshift(fileInfo);
      saveDb(db);

      return fileInfo;
    } else {
      throw new Error(result.msg || result.message || 'Upload failed');
    }
  },

  // Get all uploaded media
  list: async () => {
    const db = getDb();
    return db.files || [];
  },

  // Delete media record (note: cannot delete from 图仓, only local record)
  delete: async (filename) => {
    const db = getDb();
    db.files = db.files.filter(f => f.name !== filename);
    saveDb(db);
    return true;
  }
};
