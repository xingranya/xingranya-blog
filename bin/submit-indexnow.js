#!/usr/bin/env node
// 独立发布步骤：构建永远不向搜索引擎发送网络请求。
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const args = process.argv.slice(2);
const value = name => args[args.indexOf(name) + 1];
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const receiptPath = args.includes('--receipt') ? path.resolve(value('--receipt')) : null;
const hash = body => createHash('sha256').update(body).digest('hex');

async function main() {
  const manifest = JSON.parse(await fs.readFile(path.join(publicDir, 'indexnow-urls.json'), 'utf8'));
  let previous = {};
  if (args.includes('--previous')) previous = JSON.parse(await fs.readFile(path.resolve(value('--previous')), 'utf8')).urlHashes || {};
  const urlHashes = {};
  for (const url of manifest.urls) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const file = path.join(publicDir, pathname, pathname.endsWith('/') ? 'index.html' : '');
    urlHashes[url] = hash(await fs.readFile(file));
  }
  const changed = manifest.urls.filter(url => urlHashes[url] !== previous[url]);
  const removed = Object.keys(previous).filter(url => !Object.hasOwn(urlHashes, url));
  const urls = [...changed, ...removed];
  console.log('本次公开 URL：' + manifest.urls.length + '，待提交变更：' + urls.length);
  if (!args.includes('--submit')) {
    console.log('仅预检。正式发布后使用 --submit；--previous 可指定上次提交回执。');
    return;
  }
  if (!receiptPath) throw new Error('提交时须用 --receipt 指定本次回执路径。');
  const site = new URL(manifest.urls[0]);
  const keyFile = (await fs.readdir(publicDir)).find(name => /^[a-f0-9]{16,64}\.txt$/i.test(name));
  if (!keyFile) throw new Error('缺少公开的 IndexNow 验证文件。');
  const key = (await fs.readFile(path.join(publicDir, keyFile), 'utf8')).trim();
  for (const url of changed) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (response.status !== 200 || hash(Buffer.from(await response.arrayBuffer())) !== urlHashes[url]) {
      throw new Error('线上内容尚未与本次构建一致：' + url);
    }
  }
  for (const url of removed) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const body = await response.text();
    if (![301, 308, 404, 410].includes(response.status) && !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(body)) {
      throw new Error('已移出索引的页面仍可被收录：' + url);
    }
  }
  if (urls.length) {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({ host: site.host, key, keyLocation: new URL(keyFile, site).href, urlList: urls })
    });
    if (![200, 202].includes(response.status)) throw new Error('IndexNow 返回 ' + response.status);
  }
  await fs.writeFile(receiptPath, JSON.stringify({ submittedAt: new Date().toISOString(), submittedUrls: urls, urlHashes }, null, 2) + '\n');
  console.log('线上内容已核对，已提交 ' + urls.length + ' 个 URL；回执：' + receiptPath);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
