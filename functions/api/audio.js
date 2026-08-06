// functions/api/audio.js

/**
 * Get content type from file extension
 */
function getContentType(fileKey) {
    if (fileKey.endsWith('.mp3')) return 'audio/mpeg';
    if (fileKey.endsWith('.m4a')) return 'audio/mp4';
    if (fileKey.endsWith('.wav')) return 'audio/wav';
    if (fileKey.endsWith('.ogg')) return 'audio/ogg';
    if (fileKey.endsWith('.flac')) return 'audio/flac';
    if (fileKey.endsWith('.aac')) return 'audio/aac';
    return 'audio/mpeg';
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const fileKey = url.searchParams.get('file');

    // 1. Validate file parameter
    if (!fileKey) {
        return new Response(JSON.stringify({ error: 'Missing file parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Check if this file is in the "paid/" folder
    const isPaidFile = fileKey.startsWith('paid/');

    console.log(`📁 File: ${fileKey}, Paid: ${isPaidFile}`);

    // 3. If it's a paid file, check patron status
    if (isPaidFile) {
        const cookieHeader = request.headers.get('Cookie');
        if (!cookieHeader) {
            return new Response(JSON.stringify({ error: 'Not logged in' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse cookies
        const cookies = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            cookies[name] = rest.join('=');
        });

        const sessionCookie = cookies.patreon_session;
        if (!sessionCookie) {
            return new Response(JSON.stringify({ error: 'No session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const userData = JSON.parse(decodeURIComponent(sessionCookie));
            if (!userData.isActivePatron) {
                console.log(`❌ Patron access denied for ${fileKey}`);
                return new Response(JSON.stringify({ error: 'Patron status required' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            console.log(`✅ Patron access granted for ${fileKey}`);
        } catch (error) {
            console.error('❌ Session parse error:', error);
            return new Response(JSON.stringify({ error: 'Invalid session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } else {
        console.log(`📖 Free audio file: ${fileKey}`);
    }

    // 4. Get the file from R2
    try {
        const bucket = env.AUDIO_BUCKET;
        const object = await bucket.get(fileKey);

        if (!object) {
            console.log(`❌ File not found: ${fileKey}`);
            return new Response(JSON.stringify({ error: 'File not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const contentType = getContentType(fileKey);

        // For paid files, cache shorter; for free files, cache longer
        const cacheControl = isPaidFile ? 
            'private, max-age=300' :       // 5 minutes for paid
            'public, max-age=86400';       // 24 hours for free

        return new Response(object.body, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': object.size,
                'Cache-Control': cacheControl,
                'Accept-Ranges': 'bytes',
            }
        });

    } catch (error) {
        console.error('❌ R2 error:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
