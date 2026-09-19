/**
 * 旧域名 301 到正式博客。只处理进 Cloudflare 的镜像域名，
 * 不托管博客内容，正式站仍是 EdgeOne 上的 blog.xran.uk。
 */

const CANONICAL_HOST = 'blog.xran.uk';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }
};
