// functions/auth/logout.js

export function onRequest(context) {
    // Clear the cookie and redirect to /home
    return Response.redirect('https://akroomenois.com/home', 302, {
        headers: {
            'Set-Cookie': 'patreon_session=; Path=/; Domain=akroomenois.com; Max-Age=0; Secure; HttpOnly; SameSite=Lax',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
