require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  passwordHash: process.env.PASSWORD_HASH,
  blogRoot: process.env.BLOG_ROOT || path.resolve(__dirname, '..'),

  // 速率限制配置
  rateLimit: {
    loginWindowMs: 15 * 60 * 1000,  // 15 分钟
    loginMaxAttempts: 5,
    apiWindowMs: 15 * 60 * 1000,
    apiMaxRequests: 100
  },

  // 图床配置
  tucang: {
    apiUrl: 'https://api.tucang.cc/api/v1/upload',
    token: process.env.TUCANG_TOKEN,
    folderId: process.env.TUCANG_FOLDER_ID || '3528'
  }
};
