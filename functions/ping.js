// functions/ping.js
export function onRequest(context) {
    return new Response('✅ Cloudflare Functions are working!', {
        headers: { 'Content-Type': 'text/plain' }
    });
}
