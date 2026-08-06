export function onRequest(context) {
  return Response.redirect('https://akroomenois.com/home', 302, {
    headers: {
      'Set-Cookie': 'patreon_session=; Path=/; Domain=akroomenois.com; Max-Age=0; Secure;',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
