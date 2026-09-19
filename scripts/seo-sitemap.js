const { isIndexable, canonicalUrl, markdownPath } = require('../lib/seo-policy');

// 复用既有生成器，仅收窄其输入，不改变文章页面和导航本身。
hexo.on('ready', () => {
  for (const name of ['sitemap', 'atom', 'rss2', 'xml', 'json']) {
    const generate = hexo.extend.generator.get(name);
    if (!generate) continue;
    hexo.extend.generator.register(name, function (locals) {
      return generate.call(this, {
        ...locals,
        posts: locals.posts.filter(isIndexable),
        pages: locals.pages.filter(isIndexable)
      });
    });
  }
});

hexo.extend.helper.register('isPublicArticle', page => page.layout === 'post' && isIndexable(page));
hexo.extend.helper.register('markdownPath', markdownPath);

hexo.extend.generator.register('agent-content', function (locals) {
  const base = this.config.url;
  const displayAuthor = this.theme.config.info.author || this.config.author;
  const author = displayAuthor === this.config.author ? displayAuthor : displayAuthor + '（' + this.config.author + '）';
  const posts = locals.posts.filter(isIndexable).sort('-date').toArray();
  const pages = locals.pages.filter(isIndexable).toArray();
  const text = [
    '# 星苒鸭 · 博客',
    '',
    '> 星苒鸭（xingranya）的技术博客，记录前端、运维、AI 和安卓实践。',
    '',
    '本站提供技术文章；个人介绍、手记和动态位于 https://xran.uk/。公开内容允许搜索引擎和 AI 抓取。引用时请保留作者和原文链接。',
    '',
    '## 栏目与订阅',
    '',
    '- [个人主页](https://xran.uk/)',
    '- [博客首页](' + base + '/)',
    '- [关于作者](' + base + '/about/)',
    '- [项目](' + base + '/projects/)',
    '- [文章归档](' + base + '/archives/)',
    '- [站点地图](' + base + '/sitemap.xml)',
    '- [RSS 订阅](' + base + '/atom.xml)',
    '',
    '## 技术文章',
    '',
    ...posts.map(post => '- [' + post.title.replace(/[\[\]\n]/g, '') + '](' + canonicalUrl(base, post) + ') · [Markdown](' + new URL(markdownPath(post), base).href + ')'),
    ''
  ].join('\n');
  const routes = [{ path: 'llms.txt', data: text }];
  for (const post of posts) {
    const body = String(post.raw || '').replace(/^---[^\S\n]*\r?\n[\s\S]*?\r?\n---[^\S\n]*\r?\n/, '');
    routes.push({
      path: markdownPath(post),
      data: '# ' + post.title + '\n\n作者：' + author + '\n发布日期：' + post.date.format('YYYY-MM-DD') +
        '\n更新时间：' + (post.updated || post.date).format('YYYY-MM-DD') + '\n原文：' + canonicalUrl(base, post) + '\n\n' + body.trim() + '\n'
    });
  }
  routes.push({
    path: 'indexnow-urls.json',
    data: JSON.stringify({ urls: [...new Set([base + '/', ...posts.concat(pages).map(page => canonicalUrl(base, page))])] }, null, 2) + '\n'
  });
  return routes;
});
