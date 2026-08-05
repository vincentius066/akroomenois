// functions/api/me.js

export function onRequest(context) {
    const { request, redirect } = context;
    
    // Check for the session cookie we set in the callback
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return new Response(JSON.stringify({ loggedIn: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Parse the cookie to find our 'patreon_session'
    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
            const [key, ...value] = c.split('=');
            return [key, value.join('=')];
        })
    );

    if (!cookies.patreon_session) {
        return new Response(JSON.stringify({ loggedIn: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const userData = JSON.parse(decodeURIComponent(cookies.patreon_session));
        return new Response(JSON.stringify({
            loggedIn: true,
            isPatron: userData.isActivePatron || false,
            name: userData.name || '',
            email: userData.email || '',
            tiers: userData.tiers || [],
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ loggedIn: false }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
