/* global hexo */

if (process.env.HEXO_ADMIN === 'true') {
  const bodyParser = require('body-parser');
  const fs = require('fs');
  const path = require('path');
  const util = require('util');
  const yaml = require('js-yaml');
  const { slugize } = require('hexo-util');

  if (typeof util.isDate !== 'function') {
    util.isDate = util.types.isDate;
  }

  const adminPackageDir = path.dirname(require.resolve('admin-local/package.json'));
  const updateAdminContent = require(path.join(adminPackageDir, 'update'));
  const adminWwwDir = path.join(adminPackageDir, 'www');
  const adminUiDir = path.join(hexo.base_dir, 'admin-ui');
  const tucangConfigPath = path.join(hexo.base_dir, '.admin-tucang.yml');
  const masonryDataPath = path.join(hexo.source_dir, '_data', 'masonry.yml');
  const linksDataPath = path.join(hexo.source_dir, '_data', 'links.yml');
  const hasAdminPassword = Boolean(hexo.config.admin && hexo.config.admin.username);
  const maxImageBytes = 5 * 1024 * 1024;
  const tucangUploadUrl = 'https://api.tucang.cc/api/v1/upload';

  const adminAssets = {
    '/admin/admin-custom.css': {
      path: path.join(adminUiDir, 'admin-custom.css'),
      type: 'text/css; charset=utf-8'
    },
    '/admin/admin-custom.js': {
      path: path.join(adminUiDir, 'admin-custom.js'),
      type: 'application/javascript; charset=utf-8'
    }
  };

  function sendFile(res, filePath, contentType) {
    res.setHeader('Content-Type', contentType);
    res.end(fs.readFileSync(filePath));
  }

  function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload, function (key, value) {
      if (key === 'tags' || key === 'categories') {
        return value && value.toArray ? value.toArray().map(function (item) {
          return item.name;
        }) : value;
      }
      return value;
    }));
  }

  function sendOk(res, payload) {
    sendJson(res, 200, Object.assign({ success: true }, payload || {}));
  }

  function sendError(res, statusCode, message) {
    const text = message && message.message ? message.message : message;
    sendJson(res, statusCode, { success: false, error: String(text || '请求失败。') });
  }

  function readYamlFile(filePath, fallback) {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return yaml.load(raw) || fallback;
  }

  function writeYamlFile(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: 120, noRefs: true }), 'utf8');
  }

  function readTucangConfig() {
    const config = readYamlFile(tucangConfigPath, {});
    const token = String(config.token || '').trim();
    const folders = config.folders || {};

    if (!token) {
      throw new Error('缺少图仓 token，请检查 .admin-tucang.yml。');
    }

    return {
      token,
      folders: {
        post: Number(folders.post || 0),
        cover: Number(folders.cover || 0),
        wallpaper: Number(folders.wallpaper || 0)
      }
    };
  }

  function dataUrlToImage(dataUrl, filename) {
    const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('只支持上传图片文件。');
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const fallbackExt = mimeType.split('/')[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    const safeFilename = String(filename || `image.${fallbackExt}`)
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/^\.+/, '')
      .trim() || `image.${fallbackExt}`;
    const ext = (path.extname(safeFilename).replace('.', '') || fallbackExt).toLowerCase();

    if (!buffer.length) {
      throw new Error('图片内容为空。');
    }

    if (buffer.length > maxImageBytes) {
      throw new Error('图片仍超过 5MB，请重新选择或手动压缩。');
    }

    return { buffer, mimeType, filename: safeFilename, ext };
  }

  function normalizePurpose(purpose) {
    if (purpose === 'cover' || purpose === 'wallpaper') return purpose;
    return 'post';
  }

  function normalizeMasonryItem(item) {
    return {
      image: String((item && item.image) || '').trim(),
      title: String((item && item.title) || '').trim(),
      description: String((item && item.description) || '').trim()
    };
  }

  function validateMasonryItem(item) {
    if (!/^https?:\/\//.test(item.image)) throw new Error('壁纸图片链接无效。');
    if (!item.title) throw new Error('请填写壁纸标题。');
    if (!item.description) throw new Error('请填写壁纸描述。');
  }

  function normalizeLinkItem(item) {
    return {
      name: String((item && item.name) || '').trim(),
      link: String((item && item.link) || '').trim(),
      description: String((item && item.description) || '').trim(),
      avatar: String((item && item.avatar) || '').trim(),
      thumbnail: String((item && item.thumbnail) || '').trim()
    };
  }

  function normalizeLinkGroup(group) {
    return {
      links_category: String((group && group.links_category) || '').trim(),
      has_thumbnail: Boolean(group && group.has_thumbnail),
      list: Array.isArray(group && group.list) ? group.list.map(normalizeLinkItem) : []
    };
  }

  function validateLinkGroup(group) {
    if (!group.links_category) throw new Error('请填写分组名称。');
  }

  function validateLinkItem(item) {
    if (!item.name) throw new Error('请填写站点名称。');
    if (!/^https?:\/\//.test(item.link)) throw new Error('站点链接必须是 http(s) URL。');
    if (!item.description) throw new Error('请填写站点描述。');
    if (!item.avatar) throw new Error('请填写头像链接。');
  }

  function readMasonryItems() {
    const items = readYamlFile(masonryDataPath, []);
    return Array.isArray(items) ? items.map(normalizeMasonryItem) : [];
  }

  function writeMasonryItems(items) {
    writeYamlFile(masonryDataPath, items);
    return hexo.source.process(['_data/masonry.yml']).then(function () {
      return items;
    });
  }

  function readLinkGroups() {
    const groups = readYamlFile(linksDataPath, []);
    return Array.isArray(groups) ? groups.map(normalizeLinkGroup) : [];
  }

  function writeLinkGroups(groups) {
    writeYamlFile(linksDataPath, groups);
    return hexo.source.process(['_data/links.yml']).then(function () {
      hexo.theme.config.links = groups;
      return groups;
    });
  }

  function addIsDraft(post) {
    post.isDraft = post.source.indexOf('_draft') === 0;
    post.isDiscarded = post.source.indexOf('_discarded') === 0;
    return post;
  }

  function tagsCategoriesAndMetadata() {
    const categories = {};
    const tags = {};

    hexo.model('Category').forEach(function (category) {
      categories[category._id] = category.name;
    });

    hexo.model('Tag').forEach(function (tag) {
      tags[tag._id] = tag.name;
    });

    return {
      categories,
      tags,
      metadata: Object.keys(hexo.config.metadata || {})
    };
  }

  function uniqueDraftSlug(title) {
    const baseSlug = slugize(String(title || 'untitled'), { transform: hexo.config.filename_case }) || 'untitled';
    let slug = baseSlug;
    let index = 2;

    while (fs.existsSync(path.join(hexo.source_dir, '_drafts', `${slug}.md`))) {
      slug = `${baseSlug}-${index}`;
      index += 1;
    }

    return slug;
  }

  function ensureSourcePath(filePath) {
    const resolvedSourceDir = path.resolve(hexo.source_dir);
    const resolvedFile = path.resolve(filePath);
    if (!resolvedFile.startsWith(resolvedSourceDir + path.sep)) {
      throw new Error('拒绝删除 source 目录之外的文件。');
    }
    return resolvedFile;
  }

  async function uploadToTucang(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    try {
      const body = req.body || {};
      const purpose = normalizePurpose(body.purpose);
      const config = readTucangConfig();
      const folderId = config.folders[purpose];
      const form = new FormData();
      const url = String(body.url || '').trim();

      form.append('token', config.token);

      if (body.data) {
        const image = dataUrlToImage(body.data, body.filename);
        form.append('file', new Blob([image.buffer], { type: image.mimeType }), image.filename);
        form.append('type', image.ext);
      } else if (/^https?:\/\//.test(url)) {
        form.append('url', url);
        if (body.referer) form.append('referer', String(body.referer));
        if (body.type) form.append('type', String(body.type).replace(/^\./, ''));
      } else {
        throw new Error('请提供图片文件或图片 URL。');
      }

      if (folderId) form.append('folderId', String(folderId));

      const response = await fetch(tucangUploadUrl, {
        method: 'POST',
        body: form
      });
      const responseText = await response.text();
      let payload;

      try {
        payload = JSON.parse(responseText);
      } catch (error) {
        throw new Error(`图仓返回内容无法解析：${responseText.slice(0, 160)}`);
      }

      if (!response.ok || !payload.success || !payload.data || !payload.data.url) {
        throw new Error(payload.msg || payload.error || '图仓上传失败。');
      }

      sendOk(res, {
        url: payload.data.url,
        md5: payload.data.md5 || '',
        filename: body.filename || path.basename(url) || 'image',
        purpose
      });
    } catch (error) {
      sendError(res, 400, error.message || '上传失败。');
    }
  }

  function listMasonry(res) {
    sendOk(res, { items: readMasonryItems() });
  }

  function addMasonry(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    let item;
    try {
      item = normalizeMasonryItem(req.body || {});
      validateMasonryItem(item);
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    const nextItems = readMasonryItems();
    nextItems.unshift(item);
    writeMasonryItems(nextItems).then(function () {
      sendOk(res, { items: nextItems });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新壁纸数据失败。');
    });
  }

  function removeMasonry(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const body = req.body || {};
    const image = String(body.image || '').trim();
    const index = Number(body.index);
    const list = readMasonryItems();
    const removeIndex = Number.isInteger(index) && index >= 0
      ? index
      : list.findIndex(function (item) { return item && item.image === image; });

    if (removeIndex < 0 || removeIndex >= list.length) {
      return sendError(res, 404, '没有找到要删除的壁纸。');
    }

    const nextItems = list.slice();
    nextItems.splice(removeIndex, 1);
    writeMasonryItems(nextItems).then(function () {
      sendOk(res, { items: nextItems });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新壁纸数据失败。');
    });
  }

  function updateMasonry(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const index = Number((req.body || {}).index);
    const items = readMasonryItems();
    if (!Number.isInteger(index) || index < 0 || index >= items.length) {
      return sendError(res, 404, '没有找到要更新的壁纸。');
    }

    let item;
    try {
      item = normalizeMasonryItem((req.body || {}).item || req.body || {});
      validateMasonryItem(item);
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    const nextItems = items.slice();
    nextItems[index] = item;
    writeMasonryItems(nextItems).then(function () {
      sendOk(res, { items: nextItems });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新壁纸数据失败。');
    });
  }

  function reorderMasonry(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const from = Number((req.body || {}).from);
    const to = Number((req.body || {}).to);
    const items = readMasonryItems();

    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length) {
      return sendError(res, 400, '壁纸排序位置无效。');
    }

    const nextItems = items.slice();
    const moved = nextItems.splice(from, 1)[0];
    nextItems.splice(to, 0, moved);
    writeMasonryItems(nextItems).then(function () {
      sendOk(res, { items: nextItems });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新壁纸数据失败。');
    });
  }

  function bulkAddMasonry(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const rawItems = Array.isArray((req.body || {}).items) ? req.body.items : [];
    let newItems;

    try {
      newItems = rawItems.map(normalizeMasonryItem);
      if (!newItems.length) throw new Error('没有可添加的壁纸。');
      newItems.forEach(validateMasonryItem);
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    const nextItems = newItems.concat(readMasonryItems());
    writeMasonryItems(nextItems).then(function () {
      sendOk(res, { items: nextItems });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新壁纸数据失败。');
    });
  }

  function listLinks(res) {
    sendOk(res, { groups: readLinkGroups() });
  }

  function addLinkGroup(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    let group;
    try {
      group = normalizeLinkGroup(req.body || {});
      validateLinkGroup(group);
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    const groups = readLinkGroups();
    groups.push(group);
    writeLinkGroups(groups).then(function () {
      sendOk(res, { groups });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新友情链接失败。');
    });
  }

  function updateLinkGroup(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const index = Number((req.body || {}).index);
    const groups = readLinkGroups();
    if (!Number.isInteger(index) || index < 0 || index >= groups.length) {
      return sendError(res, 404, '没有找到要编辑的分组。');
    }

    let group;
    try {
      group = normalizeLinkGroup((req.body || {}).group || req.body || {});
      validateLinkGroup(group);
      group.list.forEach(validateLinkItem);
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    groups[index] = group;
    writeLinkGroups(groups).then(function () {
      sendOk(res, { groups });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新友情链接失败。');
    });
  }

  function removeLinkGroup(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const index = Number((req.body || {}).index);
    const groups = readLinkGroups();
    if (!Number.isInteger(index) || index < 0 || index >= groups.length) {
      return sendError(res, 404, '没有找到要删除的分组。');
    }

    groups.splice(index, 1);
    writeLinkGroups(groups).then(function () {
      sendOk(res, { groups });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新友情链接失败。');
    });
  }

  function reorderLinkGroup(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const from = Number((req.body || {}).from);
    const to = Number((req.body || {}).to);
    const groups = readLinkGroups();
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= groups.length || to >= groups.length) {
      return sendError(res, 400, '分组排序位置无效。');
    }

    const moved = groups.splice(from, 1)[0];
    groups.splice(to, 0, moved);
    writeLinkGroups(groups).then(function () {
      sendOk(res, { groups });
    }).catch(function (error) {
      sendError(res, 500, error.message || '刷新友情链接失败。');
    });
  }

  function termSummary(res) {
    const postCountByName = function (collection) {
      return collection.toArray().map(function (item) {
        return {
          name: item.name,
          count: item.length || (item.posts && item.posts.length) || 0
        };
      }).sort(function (a, b) {
        return b.count - a.count || a.name.localeCompare(b.name, 'zh-CN');
      });
    };

    sendOk(res, {
      tags: postCountByName(hexo.model('Tag')),
      categories: postCountByName(hexo.model('Category'))
    });
  }

  function createPost(req, res) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const title = String((req.body || {}).title || '').trim();
    if (!title) return sendError(res, 400, '请填写文章标题。');

    const postParameters = {
      title,
      slug: uniqueDraftSlug(title),
      layout: 'draft',
      date: new Date(),
      author: hexo.config.author
    };
    Object.assign(postParameters, hexo.config.metadata || {});

    hexo.post.create(postParameters).then(function (file) {
      const source = file.path.slice(hexo.source_dir.length).replace(/\\/g, '/');
      return hexo.source.process([source]).then(function () {
        const post = hexo.model('Post').findOne({ source });
        if (!post) throw new Error('草稿已创建，但后台暂时无法读取。');
        sendJson(res, 200, addIsDraft(post));
      });
    }).catch(function (error) {
      sendError(res, 500, error.message || '创建草稿失败。');
    });
  }

  function removePost(req, res, id) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');

    const post = hexo.model('Post').get(id);
    if (!post) return sendError(res, 404, '没有找到要删除的文章。');

    let sourcePath;
    try {
      sourcePath = ensureSourcePath(post.full_source);
    } catch (error) {
      return sendError(res, 400, error.message);
    }

    if (!/\.md$/i.test(sourcePath)) {
      return sendError(res, 400, '只允许删除 Markdown 文章文件。');
    }

    if (!fs.existsSync(sourcePath)) {
      return sendError(res, 404, '文章源文件不存在。');
    }

    try {
      fs.unlinkSync(sourcePath);
      const assetDir = sourcePath.slice(0, -path.extname(sourcePath).length);
      if (fs.existsSync(assetDir) && fs.statSync(assetDir).isDirectory()) {
        fs.rmSync(assetDir, { recursive: true, force: true });
      }
      Promise.resolve(post.remove()).then(function () {
        return hexo.source.process();
      }).then(function () {
        sendOk(res, { deleted: post.source });
      }).catch(function (error) {
        sendError(res, 500, error.message || '刷新文章列表失败。');
      });
    } catch (error) {
      sendError(res, 500, error.message || '删除文章失败。');
    }
  }

  function updateContent(req, res, id, model) {
    if (req.method !== 'POST') return sendError(res, 405, '请求方法不支持。');
    if (!req.body) return sendError(res, 400, '没有收到要保存的内容。');

    updateAdminContent(model, id, req.body, function (error, item) {
      if (error) return sendError(res, 400, error);
      if (!item) return sendError(res, 404, '没有找到要保存的内容。');

      const key = model === 'Page' ? 'page' : 'post';
      sendJson(res, 200, {
        [key]: addIsDraft(item),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      });
    }, hexo);
  }

  function isReservedAdminRoute(value) {
    return ['list', 'new', 'publish', 'unpublish', 'remove', 'rename'].includes(value);
  }

  function sendAdminIndex(res) {
    const html = fs.readFileSync(path.join(adminWwwDir, 'index.html'), 'utf8')
      .replace('<html lang="en">', '<html lang="zh-CN">')
      .replace('<title>Hexo Admin</title>', '<title>博客写作后台</title>')
      .replace(
        '<link rel="stylesheet" href="bundle.css">',
        '<link rel="stylesheet" href="bundle.css">\n<link rel="stylesheet" href="admin-custom.css">'
      )
      .replace(
        '<script src="bundle.js"></script>',
        '<script src="bundle.js"></script>\n<script defer src="admin-custom.js"></script>'
      );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  }

  function sendAdminLogin(res) {
    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>登录博客写作后台</title>
  <link rel="stylesheet" href="/admin/admin-custom.css">
</head>
<body class="admin-login">
  <main class="admin-login_card">
    <div class="admin-page-kicker">本地写作后台</div>
    <h1>登录</h1>
    <p>输入后台账号后继续管理文章、页面和发布流程。</p>
    <form method="post">
      <label for="username">用户名</label>
      <input id="username" name="username" type="text" autocomplete="username" autofocus>
      <label for="password">密码</label>
      <input id="password" name="password" type="password" autocomplete="current-password">
      <button type="submit">进入后台</button>
    </form>
  </main>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  }

  hexo.extend.filter.register('server_middleware', function (app) {
    const apiPrefix = `${hexo.config.root}admin/api/`;

    app.use(apiPrefix, bodyParser.json({ limit: '60mb' }));

    app.use(`${apiPrefix}tucang/upload`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return uploadToTucang(req, res);
    });

    app.use(`${apiPrefix}masonry/list`, function (req, res, next) {
      if (req.method !== 'GET') return next();
      return listMasonry(res);
    });

    app.use(`${apiPrefix}masonry/add`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return addMasonry(req, res);
    });

    app.use(`${apiPrefix}masonry/remove`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return removeMasonry(req, res);
    });

    app.use(`${apiPrefix}masonry/update`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return updateMasonry(req, res);
    });

    app.use(`${apiPrefix}masonry/reorder`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return reorderMasonry(req, res);
    });

    app.use(`${apiPrefix}masonry/bulk-add`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return bulkAddMasonry(req, res);
    });

    app.use(`${apiPrefix}links/list`, function (req, res, next) {
      if (req.method !== 'GET') return next();
      return listLinks(res);
    });

    app.use(`${apiPrefix}links/group/add`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return addLinkGroup(req, res);
    });

    app.use(`${apiPrefix}links/group/update`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return updateLinkGroup(req, res);
    });

    app.use(`${apiPrefix}links/group/remove`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return removeLinkGroup(req, res);
    });

    app.use(`${apiPrefix}links/group/reorder`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return reorderLinkGroup(req, res);
    });

    app.use(`${apiPrefix}terms/summary`, function (req, res, next) {
      if (req.method !== 'GET') return next();
      return termSummary(res);
    });

    app.use(`${apiPrefix}posts/new`, function (req, res, next) {
      if (req.method !== 'POST') return next();
      return createPost(req, res);
    });

    app.use(`${apiPrefix}posts/`, function (req, res, next) {
      const pathname = (req.url || '').split('?')[0].replace(/\/+$/, '');
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length === 2 && parts[1] === 'remove') {
        return removePost(req, res, decodeURIComponent(parts[0]));
      }
      if (parts.length === 1 && req.method === 'POST' && !isReservedAdminRoute(parts[0])) {
        const id = decodeURIComponent(parts[0]);
        if (!hexo.model('Post').get(id)) return sendError(res, 404, '没有找到这篇文章。');
        return updateContent(req, res, id, 'Post');
      }
      return next();
    });

    app.use(`${apiPrefix}pages/`, function (req, res, next) {
      const pathname = (req.url || '').split('?')[0].replace(/\/+$/, '');
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length === 1 && req.method === 'POST' && !isReservedAdminRoute(parts[0])) {
        const id = decodeURIComponent(parts[0]);
        if (!hexo.model('Page').get(id)) return sendError(res, 404, '没有找到这个页面。');
        return updateContent(req, res, id, 'Page');
      }
      return next();
    });

    app.use(function (req, res, next) {
      const pathname = (req.url || '').split('?')[0].replace(/\/+$/, '/') || '/';

      if (req.method !== 'GET' && req.method !== 'HEAD') return next();

      if (!hasAdminPassword && pathname === '/admin') {
        res.writeHead(302, { Location: '/admin/' });
        return res.end();
      }

      if (!hasAdminPassword && pathname === '/admin/') {
        return sendAdminIndex(res);
      }

      if (!hasAdminPassword && (pathname === '/admin/login' || pathname === '/admin/login/')) {
        return sendAdminLogin(res);
      }

      const asset = adminAssets[pathname];
      if (asset) {
        return sendFile(res, asset.path, asset.type);
      }

      return next();
    });
  });

  await hexo.loadPlugin(require.resolve('admin-local'));
}
