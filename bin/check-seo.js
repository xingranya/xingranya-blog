#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { isIndexable } = require('../lib/seo-policy');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const siteOrigin = 'https://blog.xran.uk';

function read(relativePath) {
  return fs.readFileSync(path.join(publicDir, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(directory, suffix, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target, suffix, output);
    else if (entry.name.endsWith(suffix)) output.push(target);
  }
  return output;
}

const llms = read('llms.txt');
const sitemap = read('sitemap.xml');
const manifest = JSON.parse(read('indexnow-urls.json'));
const markdownFiles = walk(publicDir, 'index.md');
const allArticleFiles = walk(publicDir, 'index.html').filter(file => {
  const html = fs.readFileSync(file, 'utf8');
  return /<meta property="og:type" content="article">/.test(html);
});
const articleFiles = allArticleFiles.filter(file => {
  const html = fs.readFileSync(file, 'utf8');
  return !/<meta name="robots" content="[^"]*noindex/i.test(html);
});

assert(llms.startsWith('# 星苒鸭 · 博客\n'), 'llms.txt 缺少站点标题');
assert(llms.includes('[站点地图](' + siteOrigin + '/sitemap.xml)'), 'llms.txt 缺少站点地图');
assert(!/index\.html|live2dw|\/admin(?:\/|\b)|\/404(?:\/|\b)/i.test(sitemap), 'sitemap 含禁止收录地址');
assert(Array.isArray(manifest.urls) && manifest.urls[0] === siteOrigin + '/', 'IndexNow 清单格式错误');
assert(new Set(manifest.urls).size === manifest.urls.length, 'IndexNow 清单含重复地址');
assert(manifest.urls.every(url => url.startsWith(siteOrigin + '/')), 'IndexNow 清单含站外地址');
assert(markdownFiles.length === articleFiles.length, 'Markdown 导出数量与公开文章数量不一致');
assert(isIndexable({ layout: 'post', path: 'public-post/' }), '公开文章策略错误');
assert(!isIndexable({ layout: 'post', path: 'private/', password: 'secret' }), '加密文章被允许收录');
assert(!isIndexable({ layout: 'post', path: 'draft/', draft: true }), '草稿被允许收录');
assert(!isIndexable({ layout: 'post', path: 'hidden/', indexable: false }), 'indexable:false 未生效');

for (const htmlFile of allArticleFiles.filter(file => !articleFiles.includes(file))) {
  assert(!fs.existsSync(path.join(path.dirname(htmlFile), 'index.md')), path.relative(publicDir, htmlFile) + ' 不应导出 Markdown');
}

for (const htmlFile of articleFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const relativeDir = path.relative(publicDir, path.dirname(htmlFile));
  const markdownFile = path.join(publicDir, relativeDir, 'index.md');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/);
  assert(canonical, relativeDir + ' 缺少 canonical');
  assert(!/<meta name="robots" content="[^"]*noindex/i.test(html), relativeDir + ' 被标记为 noindex');
  assert(fs.existsSync(markdownFile), relativeDir + ' 缺少 Markdown 导出');
  assert(fs.readFileSync(markdownFile, 'utf8').includes('原文：' + canonical[1]), relativeDir + ' 的 Markdown 原文地址错误');
  assert(llms.includes(canonical[1] + 'index.md'), relativeDir + ' 未列入 llms.txt');
  assert(manifest.urls.includes(canonical[1]), relativeDir + ' 未列入 IndexNow 清单');
}

console.log('SEO 生成结果通过：' + articleFiles.length + ' 篇公开文章，' + manifest.urls.length + ' 个 IndexNow URL。');
