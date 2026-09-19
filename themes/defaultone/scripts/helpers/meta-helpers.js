function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

hexo.extend.helper.register('seoKeywords', function (config, page) {
  if (page.keywords) return page.keywords;
  const names = [];
  if (page.tags && typeof page.tags.each === 'function') {
    page.tags.each(function (tag) {
      if (tag && tag.name) names.push(tag.name);
    });
  }
  if (names.length) return names.join(', ');
  return config.keywords || config.title || '星苒鸭博客';
});

hexo.extend.helper.register('seoDescription', function (config, theme, page) {
  return seoDescription(config, theme, page);
});

hexo.extend.helper.register('seoImage', function (config, theme, page) {
  return seoImage(config, theme, page);
});

hexo.extend.helper.register('generateMeta', function (theme, page) {
  const hexo = this;
  let robotsContent = '';

  if (page.robots) {
    robotsContent = page.robots;
  } else if (page.current && page.current > 1) {
    robotsContent = (theme.seo && theme.seo.robots && theme.seo.robots.home_other_pages) || 'noindex,follow';
  } else if (theme.seo && theme.seo.robots) {
    if (hexo.is_home()) {
      robotsContent = theme.seo.robots.home_first_page || 'index,follow';
    } else if (hexo.is_archive()) {
      robotsContent = theme.seo.robots.archive || 'noindex,follow';
    } else if (hexo.is_category()) {
      robotsContent = theme.seo.robots.category || 'index,follow';
    } else if (hexo.is_tag()) {
      robotsContent = theme.seo.robots.tag || 'index,follow';
    }
  }

  if (!robotsContent) {
    robotsContent = 'index,follow';
  }

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
  const hexo = this;
  const origin = siteUrl(config);
  const siteName = (theme.info && theme.info.title) || config.title || '星苒鸭 · 博客';
  const authorName = (theme.info && theme.info.author) || config.author || 'xingranya';
  const description = seoDescription(config, theme, page);
  const image = seoImage(config, theme, page);
  const logo = toAbsoluteUrl(config, (theme.defaults && (theme.defaults.logo || theme.defaults.avatar)) || '/images/avatar-0.png');
  const pageUrl = canonicalUrl(config, page);
  const personId = origin + '/#person';
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
    const keywords = [];
    if (page.tags && typeof page.tags.each === 'function') {
      page.tags.each(function (tag) {
        if (tag && tag.name) keywords.push(tag.name);
      });
    }

    graph.push({
      '@type': 'BlogPosting',
      '@id': pageUrl + '#article',
      headline: page.title,
      description: description,
      image: image,
      datePublished: page.date ? page.date.toISOString() : undefined,
      dateModified: (page.updated || page.date) ? (page.updated || page.date).toISOString() : undefined,
      author: { '@id': personId },
      publisher: { '@id': personId },
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      keywords: keywords,
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

  return '<script type="application/ld+json">' + JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  }) + '</script>';
});
