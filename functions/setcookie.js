// functions/setcookie.js
export function onRequest(context) {
    return new Response('Cookie should be set! Check your cookies.', {
        headers: {
            'Set-Cookie': 'test_cookie=hello_world; Path=/; Max-Age=3600'
        }
    });
}
