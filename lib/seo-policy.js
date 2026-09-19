// 所有公开分发入口共用同一收录条件。
function isIndexable(page) {
  return page.indexable !== false && page.draft !== true && page.published !== false &&
    !page.password && !page.encrypt &&
    !/\bnoindex\b/i.test(page.robots || '') && page.sitemap !== false &&
    !/^(?:live2dw|admin|archives|tags|categories)(?:\/|$)|^404(?:\.|\/|$)/.test(page.path || '');
}

function canonicalUrl(base, page) {
  return new URL(String(page.path || '').replace(/index\.html$/i, ''), base.replace(/\/+$/, '') + '/').href;
}

function markdownPath(page) {
  const route = String(page.path || '').replace(/index\.html$/i, '').replace(/\.html$/i, '');
  return route.replace(/\/?$/, '/') + 'index.md';
}

module.exports = { isIndexable, canonicalUrl, markdownPath };
