// functions/auth/callback.js - WITH DEBUGGING

async function getPatreonTokens(code, env) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', env.CLIENT_ID);
    params.append('client_secret', env.CLIENT_SECRET);
    params.append('redirect_uri', env.REDIRECT_URI);

    const response = await fetch('https://www.patreon.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Patreon token error: ${response.status} - ${text}`);
    }

    return response.json();
}

async function getPatreonIdentity(accessToken) {
    const response = await fetch(
        'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[user]=email,full_name&fields[member]=patron_status,currently_entitled_amount_cents',
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Patreon identity error: ${response.status} - ${text}`);
    }

    return response.json();
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
        return Response.redirect('https://akroomenois.com/home.html?login=error&message=missing_code', 302);
    }

    try {
        const tokenData = await getPatreonTokens(code, env);
        const accessToken = tokenData.access_token;

        const identityData = await getPatreonIdentity(accessToken);

        // =========================================================
        // DEBUG: Log the entire response to see what's happening
        // =========================================================
        console.log('📝 Full Patreon response:', JSON.stringify(identityData, null, 2));

        let isActivePatron = false;
        let tiers = [];
        
        const memberships = identityData.included?.filter(item => item.type === 'member') || [];
        const tierObjects = identityData.included?.filter(item => item.type === 'tier') || [];

        console.log('📝 Memberships found:', memberships.length);
        console.log('📝 Tiers found:', tierObjects.length);

        for (const membership of memberships) {
            console.log('📝 Membership:', JSON.stringify(membership, null, 2));
            console.log('📝 patron_status:', membership.attributes?.patron_status);
            
            if (membership.attributes.patron_status === 'active_patron') {
                isActivePatron = true;
                const tierRelations = membership.relationships?.currently_entitled_tiers?.data || [];
                for (const tierRel of tierRelations) {
                    const tier = tierObjects.find(t => t.id === tierRel.id);
                    if (tier) {
                        tiers.push({
                            id: tier.id,
                            title: tier.attributes.title
                        });
                    }
                }
                break;
            }
        }

        // =========================================================
        // TEMPORARY: Force isActivePatron to true for your email
        // =========================================================
        const userEmail = identityData.data.attributes.email;
        console.log('📝 User email:', userEmail);
        
        // If the email matches YOUR email, force patron status for testing
        // Replace 'your-email@example.com' with your actual email
        // if (userEmail === 'your-email@example.com') {
        //     isActivePatron = true;
        //     console.log('🔓 Forced isActivePatron to true for testing');
        // }

        const cookieValue = JSON.stringify({
            email: userEmail,
            name: identityData.data.attributes.full_name,
            isActivePatron,
            tiers,
        });

        console.log('📝 Final cookie value:', cookieValue);

        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8f5f0; }
        .loader { text-align: center; }
        .spinner { width: 40px; height: 40px; border: 4px solid #ddd; border-top-color: #e06e04; border-radius: 50%; margin: 0 auto 20px; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        p { color: #555; font-family: sans-serif; }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <p>Logging you in...</p>
    </div>
    <script>
        document.cookie = "patreon_session=${encodeURIComponent(cookieValue)}; path=/; secure; samesite=lax; max-age=86400";
        console.log('🍪 Cookie set via JavaScript');
        console.log('🍪 Cookie value:', document.cookie);
        setTimeout(function() {
            window.location.href = "https://akroomenois.com/home.html?login=success";
        }, 500);
    </script>
</body>
</html>`;

        return new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        return Response.redirect(
            `https://akroomenois.com/home.html?login=error&message=${encodeURIComponent(error.message)}`,
            302
        );
    }
}
