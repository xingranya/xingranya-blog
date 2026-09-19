/**
 * 清理 sitemap：去掉 Live2D 资源、index.html，并统一到正式域名。
 */

const fs = require('fs');
const path = require('path');

function cleanSitemap(filePath, siteUrl) {
  if (!fs.existsSync(filePath)) return;
  let xml = fs.readFileSync(filePath, 'utf8');
  xml = xml.replace(/<url>\s*<loc>[^<]*live2dw[^<]*<\/loc>[\s\S]*?<\/url>\s*/gi, '');
  xml = xml.replace(/index\.html/gi, '');
  xml = xml.replace(/https?:\/\/xingranya\.cn/gi, siteUrl);
  fs.writeFileSync(filePath, xml);
}

hexo.extend.filter.register('after_generate', function () {
  const siteUrl = String(hexo.config.url || '').replace(/\/+$/, '');
  const publicDir = hexo.public_dir;
  cleanSitemap(path.join(publicDir, 'sitemap.xml'), siteUrl);
  cleanSitemap(path.join(publicDir, 'sitemap.txt'), siteUrl);
});
