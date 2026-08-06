// functions/auth/logout.js

export function onRequest(context) {
    return Response.redirect('https://akroomenois.com/home', 302, {
        headers: {
            'Set-Cookie': 'patreon_session=; Path=/; Domain=akroomenois.com; Max-Age=0; Secure; HttpOnly; SameSite=Lax',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
