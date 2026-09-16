/**
 * Netlify Function: tour-access
 * Handles POST /api/tour-access
 * Fetches CloudFront signed cookies from virtualtourism.in and passes them to the client.
 */

const https = require('https');

exports.handler = async function (event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: ''
    };
  }

  let slug = '';
  try {
    if (event.body) {
      const parsed = JSON.parse(event.body);
      slug = parsed.slug || '';
    }
  } catch (e) {}

  // Brihadeeswara Temple (Thanjavur) is completely self-contained in the repo
  if (!slug || slug === 'brihadeeswara-temple-thanjavur' || slug === 'thanjavur') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({ ok: true, message: 'Tour access granted.' })
    };
  }

  // Fetch signed cookies from virtualtourism.in
  try {
    const postData = JSON.stringify({ slug });
    const authResult = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'virtualtourism.in',
        port: 443,
        path: '/api/tour-access',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        let setCookies = res.headers['set-cookie'] || [];
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, setCookies, body });
        });
      });

      req.on('error', reject);
      req.setTimeout(8000, () => {
        req.destroy(new Error('Auth request timed out'));
      });
      req.write(postData);
      req.end();
    });

    // Clean cookies for client domain (strip Domain=... attribute so browser saves them for this Netlify site)
    const clientCookies = (authResult.setCookies || []).map(cookieStr => {
      return cookieStr
        .replace(/Domain=[^;]+;?\s*/gi, '')
        .replace(/SameSite=[^;]+;?\s*/gi, 'SameSite=Lax; ')
        + '; Path=/';
    });

    const multiValueHeaders = {
      'Access-Control-Allow-Origin': ['*'],
      'Access-Control-Allow-Credentials': ['true']
    };

    if (clientCookies.length > 0) {
      multiValueHeaders['Set-Cookie'] = clientCookies;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      multiValueHeaders,
      body: JSON.stringify({
        ok: true,
        message: 'Tour access granted.',
        cloudFrontSignedCookies: true
      })
    };
  } catch (err) {
    console.error('[tour-access] Error:', err);
    // Graceful fallback response so client doesn't freeze
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({ ok: true, message: 'Tour access granted (fallback).' })
    };
  }
};
