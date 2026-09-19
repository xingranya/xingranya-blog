hexo.extend.filter.register('after_post_render', function (data) {
  if (!hexo.theme.config.articles.lazyload) return data;
  data.content = data.content.replace(/<img\b[^>]*>/gi, tag => {
    if (!/\bloading=/.test(tag)) tag = tag.replace('<img', '<img loading="lazy"');
    if (!/\bdecoding=/.test(tag)) tag = tag.replace('<img', '<img decoding="async"');
    return tag;
  });
  return data;
}, 1);
