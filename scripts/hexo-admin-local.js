/* global hexo */

if (process.env.HEXO_ADMIN === 'true') {
  const fs = require('fs');
  const path = require('path');

  const adminPackageDir = path.dirname(require.resolve('admin-local/package.json'));
  const adminWwwDir = path.join(adminPackageDir, 'www');
  const adminUiDir = path.join(hexo.base_dir, 'admin-ui');
  const hasAdminPassword = Boolean(hexo.config.admin && hexo.config.admin.username);

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
