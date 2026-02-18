/**
 * IndexNow 自动提交脚本
 * 在 hexo generate 后自动将所有文章 URL 提交到 Bing
 */

const https = require('https');

hexo.on('generateAfter', function() {
  const config = hexo.config;
  const siteUrl = config.url.replace(/\/$/, '');
  const host = new URL(siteUrl).host;
  const key = 'a880405d3f67849b04790589843a2b32';

  // 收集所有文章和页面的 URL
  const urls = [];

  // 添加首页
  urls.push(siteUrl + '/');

  // 添加所有文章
  hexo.locals.get('posts').forEach(post => {
    if (post.path) {
      urls.push(siteUrl + '/' + post.path);
    }
  });

  // 添加所有页面
  hexo.locals.get('pages').forEach(page => {
    if (page.path) {
      urls.push(siteUrl + '/' + page.path);
    }
  });

  // 只在生产环境或手动触发时提交
  if (process.env.INDEXNOW !== 'true') {
    hexo.log.info('IndexNow: 跳过提交 (设置 INDEXNOW=true 环境变量来启用)');
    hexo.log.info(`IndexNow: 共有 ${urls.length} 个 URL 可提交`);
    return;
  }

  const data = JSON.stringify({
    host: host,
    key: key,
    urlList: urls.slice(0, 10000)
  });

  const options = {
    hostname: 'www.bing.com',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  let responded = false;

  const req = https.request(options, (res) => {
    responded = true;
    if (res.statusCode === 200 || res.statusCode === 202) {
      hexo.log.info(`IndexNow: 成功提交 ${urls.length} 个 URL 到 Bing`);
    } else {
      hexo.log.warn(`IndexNow: 提交失败，状态码 ${res.statusCode}`);
    }
    // 消费响应数据，防止内存泄漏
    res.resume();
  });

  req.on('error', (e) => {
    // 如果已经收到成功响应，忽略连接关闭错误
    if (responded && (e.code === 'ECONNRESET' || e.code === 'EPIPE')) {
      return;
    }
    hexo.log.error(`IndexNow: 提交出错 - ${e.message}`);
  });

  req.write(data);
  req.end();
});
