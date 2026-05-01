/* global hexo */

if (process.env.HEXO_ADMIN === 'true') {
  await hexo.loadPlugin(require.resolve('admin-local'));
}
