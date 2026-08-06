export function onRequest(context) {
  return Response.redirect('https://akroomenois.com/home', 302, {
    headers: {
      'Set-Cookie': [
        'patreon_session=; Path=/; Max-Age=0; Secure; SameSite=Lax',
        'patreon_session=; Domain=akroomenois.com; Path=/; Max-Age=0; Secure; SameSite=Lax',
        'patreon_session=; Domain=.akroomenois.com; Path=/; Max-Age=0; Secure; SameSite=Lax'
      ],
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
