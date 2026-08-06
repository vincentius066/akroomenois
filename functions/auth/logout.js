export function onRequest(context) {
  const headers = new Headers();
  
  // Use append() to create distinct Set-Cookie headers
  headers.append('Set-Cookie', 'patreon_session=; Path=/; Max-Age=0; Secure; SameSite=Lax');
  headers.append('Set-Cookie', 'patreon_session=; Domain=akroomenois.com; Path=/; Max-Age=0; Secure; SameSite=Lax');
  headers.append('Set-Cookie', 'patreon_session=; Domain=.akroomenois.com; Path=/; Max-Age=0; Secure; SameSite=Lax');
  
  // Set your other standard headers
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Location', 'https://akroomenois.com/home');

  // Return the manual 302 response with the properly appended headers
  return new Response(null, {
    status: 302,
    headers: headers
  });
}
