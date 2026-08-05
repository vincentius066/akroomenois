// functions/auth/callback.js

// A helper function to exchange the authorization code for an access token
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

// A helper function to get the user's identity and membership status
async function getPatreonIdentity(accessToken) {
    const response = await fetch(
        'https://www.patreon.com/api/oauth2/v2/identity?include=memberships.tier&fields[user]=email,full_name&fields[member]=patron_status,currently_entitled_amount_cents&fields[tier]=title,id',
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

// The main function that Cloudflare Pages will call
export async function onRequest(context) {
    const { request, env, redirect } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    // 1. Check if the authorization code is present
    if (!code) {
        return redirect('https://akroomenois.com/home.html?login=error&message=missing_code');
    }

    try {
        // 2. Exchange the code for an access token
        const tokenData = await getPatreonTokens(code, env);
        const accessToken = tokenData.access_token;

        // 3. Get the user's identity and membership status
        const identityData = await getPatreonIdentity(accessToken);

        // 4. Check for active membership
        let isActivePatron = false;
        let tiers = [];
        const memberships = identityData.included?.filter(item => item.type === 'member') || [];
        const tierObjects = identityData.included?.filter(item => item.type === 'tier') || [];

        for (const membership of memberships) {
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

        // 5. Create the session and redirect back to your site
        // This creates a secure, HTTP-only cookie with the user's info.
        // The cookie is encrypted and can only be read by your Cloudflare Functions.
        return redirect('https://akroomenois.com/home.html?login=success', {
            cookies: [{
                name: 'patreon_session',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                value: JSON.stringify({
                    email: identityData.data.attributes.email,
                    name: identityData.data.attributes.full_name,
                    isActivePatron,
                    tiers,
                }),
            }]
        });

    } catch (error) {
        console.error('OAuth Error:', error);
        return redirect('https://akroomenois.com/home.html?login=error&message=' + encodeURIComponent(error.message));
    }
}
