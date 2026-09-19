export function middleware({ request, redirect }) {
  const sourceUrl = new URL(request.url);
  const targetUrl = new URL(`${sourceUrl.pathname}${sourceUrl.search}`, 'https://blog.xran.uk');
  return redirect(targetUrl.toString(), 301);
}

export const config = {
  matcher: ['/:path*'],
};
