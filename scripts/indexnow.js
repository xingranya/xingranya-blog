/**
 * IndexNow 自动提交脚本
 * 在 hexo generate 后自动将所有文章 URL 提交到 Bing
 */

const https = require('https');

function joinUrl(base, path) {
  const prefix = String(base || '').replace(/\/+$/, '');
  const suffix = String(path || '').replace(/^\/+/, '').replace(/index\.html$/i, '');
  if (!suffix) return prefix + '/';
  return prefix + '/' + suffix;
}

hexo.on('generateAfter', function() {
  const config = hexo.config;
  const siteUrl = String(config.url || '').replace(/\/+$/, '');
  const host = new URL(siteUrl).host;
  const key = 'a880405d3f67849b04790589843a2b32';

  const urls = [];
  urls.push(siteUrl + '/');

  hexo.locals.get('posts').forEach(post => {
    if (post.permalink) {
      urls.push(String(post.permalink).replace(/index\.html$/i, ''));
    } else if (post.path) {
      urls.push(joinUrl(siteUrl, post.path));
    }
  });

  hexo.locals.get('pages').forEach(page => {
    if (!page.path || /live2dw\//.test(page.path)) return;
    if (page.permalink) {
      urls.push(String(page.permalink).replace(/index\.html$/i, ''));
    } else {
      urls.push(joinUrl(siteUrl, page.path));
    }
  });

  const uniqueUrls = Array.from(new Set(urls));

  if (process.env.INDEXNOW !== 'true') {
    hexo.log.info('IndexNow: 跳过提交 (设置 INDEXNOW=true 环境变量来启用)');
    hexo.log.info(`IndexNow: 共有 ${uniqueUrls.length} 个 URL 可提交`);
    return;
  }

  const data = JSON.stringify({
    host: host,
    key: key,
    keyLocation: siteUrl + '/' + key + '.txt',
    urlList: uniqueUrls.slice(0, 10000)
  });

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  let responded = false;

  const req = https.request(options, (res) => {
    responded = true;
    if (res.statusCode === 200 || res.statusCode === 202) {
      hexo.log.info(`IndexNow: 成功提交 ${uniqueUrls.length} 个 URL`);
    } else {
      hexo.log.warn(`IndexNow: 提交失败，状态码 ${res.statusCode}`);
    }
    res.resume();
  });

  req.on('error', (e) => {
    if (responded && (e.code === 'ECONNRESET' || e.code === 'EPIPE')) {
      return;
    }
    hexo.log.error(`IndexNow: 提交出错 - ${e.message}`);
  });

  req.write(data);
  req.end();
});
