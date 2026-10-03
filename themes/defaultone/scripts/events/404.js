/**
 * Theme Redefine
 * 404 error page
*/

hexo.extend.generator.register('404', function(locals){
  return {
    path: '404.html',
    layout: '404',
    data: {
      title: '页面未找到',
      type: '404',
      page: locals.pages.findOne({path: '404.html'})
    }
  }
});
