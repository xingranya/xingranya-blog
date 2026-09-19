const { isIndexable } = require('../../../../lib/seo-policy');

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sortedTags(collection) {
  const tags = [];
  if (collection && typeof collection.each === 'function') {
    collection.each((tag) => tags.push(tag));
  } else if (collection && typeof collection.forEach === 'function') {
    collection.forEach((tag) => tags.push(tag));
  }
  return tags.sort((a, b) => {
    const left = String((a && a.name) || a || '');
    const right = String((b && b.name) || b || '');
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

function siteUrl(config) {
  return String(config.url || '').replace(/\/+$/, '');
}

function joinUrl(base, path) {
  const prefix = String(base || '').replace(/\/+$/, '');
  const suffix = String(path || '').replace(/^\/+/, '').replace(/index\.html$/i, '');
  if (!suffix) return prefix + '/';
  return prefix + '/' + suffix;
}

function toAbsoluteUrl(config, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return joinUrl(siteUrl(config), raw);
}

function canonicalUrl(config, page) {
  if (page.permalink) {
    return String(page.permalink).replace(/index\.html$/i, '').replace(/\/+$/, '/') || siteUrl(config) + '/';
  }
  return joinUrl(siteUrl(config), page.path || page.canonical_path || '');
}

function seoDescription(config, theme, page) {
  const fallback = (theme.global && theme.global.open_graph && theme.global.open_graph.description) || config.description || '';
  const candidates = [page.og_description, page.description, page.excerpt];
  if (page.layout === 'post') {
    candidates.push(page.content);
  }
  candidates.push(fallback);
  let description = '';
  for (let i = 0; i < candidates.length; i++) {
    const text = stripHtml(candidates[i]);
    if (text.length >= 25) {
      description = text;
      break;
    }
    if (!description && text) {
      description = text;
    }
  }
  if (description.length > 155) {
    description = description.slice(0, 152) + '...';
  }
  if (!description) {
    description = (config.title || '星苒鸭博客') + ' - 个人博客与作品集';
  }
  return description;
}

function seoImage(config, theme, page) {
  const fallback = (theme.global && theme.global.open_graph && theme.global.open_graph.image) || '/images/og.png';
  const image = page.og_image || page.cover || page.banner || fallback;
  return toAbsoluteUrl(config, image);
}

function seoRobots(hexo, theme, page) {
  const seo = (theme.global && theme.global.seo) || theme.seo || {};
  if (!isIndexable(page)) return 'noindex,follow';
  if (page.robots) return page.robots;
  if (page.current && page.current > 1) return (seo.robots && seo.robots.home_other_pages) || 'noindex,follow';
  if (!seo.robots) return 'index,follow';
  if (hexo.is_home()) return seo.robots.home_first_page || 'index,follow';
  if (hexo.is_archive()) return seo.robots.archive || 'noindex,follow';
  if (hexo.is_category()) return seo.robots.category || 'noindex,follow';
  if (hexo.is_tag()) return seo.robots.tag || 'noindex,follow';
  return 'index,follow';
}

function seoTitle(hexo, config, theme, page) {
  let pageTitle = page.title;
  if (hexo.is_archive()) {
    pageTitle = hexo.__('archive');
    if (hexo.is_month()) pageTitle += ': ' + page.year + '/' + page.month;
    else if (hexo.is_year()) pageTitle += ': ' + page.year;
  } else if (hexo.is_category()) {
    pageTitle = hexo.__('category') + ': ' + page.category;
  } else if (hexo.is_tag()) {
    pageTitle = hexo.__('tag') + ': ' + page.tag;
  } else {
    pageTitle = hexo.__(page.title);
  }
  const siteName = (theme.info && theme.info.title) || config.title || '星苒鸭 · 博客';
  const subtitle = (theme.info && theme.info.subtitle) || config.subtitle;
  return pageTitle ? pageTitle + ' | ' + siteName : siteName + (subtitle ? ' - ' + subtitle : '');
}

function seoGraph(hexo, config, theme, page) {
  const origin = siteUrl(config);
  const siteName = (theme.info && theme.info.title) || config.title || '星苒鸭 · 博客';
  const authorName = (theme.info && theme.info.author) || config.author || 'xingranya';
  const description = seoDescription(config, theme, page);
  const image = seoImage(config, theme, page);
  const logo = toAbsoluteUrl(config, (theme.defaults && (theme.defaults.logo || theme.defaults.avatar)) || '/images/avatar-0.webp');
  const pageUrl = canonicalUrl(config, page);
  const personId = 'https://xran.uk/#person';
  const websiteId = origin + '/#website';
  const graph = [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: origin + '/',
      name: siteName,
      description: config.description || description,
      inLanguage: 'zh-CN',
      publisher: { '@id': personId }
    },
    {
      '@type': 'Person',
      '@id': personId,
      name: authorName,
      url: 'https://xran.uk/',
      image: logo,
      sameAs: [
        'https://github.com/xingranya',
        'https://x.com/xingranya',
        'https://t.me/xingranya',
        'https://space.bilibili.com/357220647',
        origin + '/'
      ]
    }
  ];

  if (hexo.is_post && hexo.is_post()) {
    const keywords = sortedTags(page.tags).map((tag) => tag.name).filter(Boolean);
    graph.push({
      '@type': 'BlogPosting',
      '@id': pageUrl + '#article',
      headline: page.title,
      description,
      image,
      datePublished: page.date ? page.date.toISOString() : undefined,
      dateModified: (page.updated || page.date) ? (page.updated || page.date).toISOString() : undefined,
      author: { '@id': personId },
      publisher: { '@id': personId },
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      keywords,
      inLanguage: 'zh-CN'
    });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: page.title, item: pageUrl }
      ]
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

hexo.extend.helper.register('seoKeywords', function (config, page) {
  if (page.keywords) return page.keywords;
  const names = sortedTags(page.tags).map((tag) => tag.name).filter(Boolean);
  if (names.length) return names.join(', ');
  return config.keywords || config.title || '星苒鸭博客';
});

hexo.extend.helper.register('sortedTags', function (collection) {
  return sortedTags(collection);
});

hexo.extend.helper.register('stableOpenGraph', function (markup) {
  const tagPattern = /<meta property="article:tag" content="[^"]*">\n?/g;
  const tags = String(markup || '').match(tagPattern);
  if (!tags || tags.length < 2) return markup;
  let index = 0;
  return String(markup).replace(tagPattern, () => tags.sort()[index++]);
});

hexo.extend.helper.register('seoDescription', function (config, theme, page) {
  return seoDescription(config, theme, page);
});

hexo.extend.helper.register('seoImage', function (config, theme, page) {
  return seoImage(config, theme, page);
});

hexo.extend.helper.register('generateMeta', function (theme, page) {
  const robotsContent = seoRobots(this, theme, page);

  return [
    `<meta name="robots" content="${robotsContent}">`,
    `<meta name="googlebot" content="${robotsContent}">`
  ].join('\n');
});

hexo.extend.helper.register('autoCanonical', function (config, page) {
  const url = canonicalUrl(config, page);
  return [
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="zh-CN" href="${url}">`,
    `<link rel="alternate" hreflang="x-default" href="${url}">`
  ].join('\n');
});

hexo.extend.helper.register('seoJsonLd', function (config, theme, page) {
  return '<script type="application/ld+json">' + JSON.stringify(seoGraph(this, config, theme, page)).replace(/</g, '\\u003c') + '</script>';
});

hexo.extend.helper.register('seoPageData', function (config, theme, page) {
  const canonical = canonicalUrl(config, page);
  return {
    title: seoTitle(this, config, theme, page),
    canonical,
    description: seoDescription(config, theme, page),
    keywords: this.seoKeywords(config, page),
    image: seoImage(config, theme, page),
    robots: seoRobots(this, theme, page),
    type: this.is_post && this.is_post() ? 'article' : 'website',
    markdown: page.layout === 'post' && isIndexable(page) ? canonical + 'index.md' : '',
    jsonLd: seoGraph(this, config, theme, page)
  };
});
