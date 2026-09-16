/**
 * Netlify Function: tour-proxy
 * Reverse-proxies 360° virtual tour assets (KRPano tiles, scripts, XML)
 * with CloudFront signed cookies, clean XML sanitization, and CDN caching.
 */

const https = require('https');
const url = require('url');

const REMOTE_ORIGIN = 'https://virtualtourism.in';
const TRANSPARENT_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// In-memory cookie cache per slug across warm Lambda executions
const cookieCache = new Map();

function fetchAuthCookies(slug) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ slug });
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
      const setCookies = res.headers['set-cookie'] || [];
      const cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');
      if (cookieStr) {
        cookieCache.set(slug, cookieStr);
      }
      resolve(cookieStr);
    });

    req.on('error', () => resolve(''));
    req.setTimeout(6000, () => { req.destroy(); resolve(''); });
    req.write(postData);
    req.end();
  });
}

function cleanTourXml(xmlStr) {
  return xmlStr
    .replace(/<layer\s+name=["']skin_intro_blocker["'][\s\S]*?<\/layer>/gi, '')
    .replace(/<layer\s+name=["']skin_introimage["'][^>]*>/gi, '')
    .replace(/<layer\s+name=["']logo["'][^>]*>/gi, '')
    .replace(/<layer[^>]*vr_logo[^>]*>/gi, '')
    .replace(/set\(layer\[skin_intro_blocker\][^;]+;/gi, '')
    .replace(/removelayer\(skin_intro_blocker\);?/gi, '')
    .replace(/removelayer\(skin_introimage\);?/gi, '')
    .replace(/tween\(layer\[skin_intro_blocker\][^;]+;/gi, 'skin_autotour(true);')
    .replace(/skin_intro_blocker/gi, 'dummy_unused_layer')
    .replace(/skin_introimage/gi, 'dummy_unused_layer');
}

exports.handler = async function (event, context) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range'
      },
      body: ''
    };
  }

  // Extract relative path inside /tours/
  let rawPath = event.path || '';
  if (rawPath.startsWith('/.netlify/functions/tour-proxy')) {
    rawPath = rawPath.replace('/.netlify/functions/tour-proxy', '');
  }
  if (!rawPath.startsWith('/tours/')) {
    rawPath = '/tours' + (rawPath.startsWith('/') ? '' : '/') + rawPath;
  }

  // Suppress splash cards and branding logos with transparent 1x1 PNG
  if (['splash_screen.png', 'vr_logo.png', 'vr_logo_mobile.png', 'logo.png', 'logo_h.png'].some(img => rawPath.endsWith(img))) {
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      },
      body: TRANSPARENT_PNG_BASE64
    };
  }

  // Identify destination slug from path: /tours/<slug>/...
  const pathParts = rawPath.split('/').filter(Boolean);
  const slug = pathParts[1] || '';

  // Retrieve CloudFront cookies from incoming request, or warm memory cache, or fetch on demand
  let clientCookie = event.headers.cookie || event.headers.Cookie || '';
  if (!clientCookie.includes('CloudFront-Policy') && slug) {
    clientCookie = cookieCache.get(slug) || await fetchAuthCookies(slug);
  }

  // Construct target remote URL
  let targetPath = rawPath;
  if (event.rawQuery) {
    targetPath += '?' + event.rawQuery;
  } else if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
    const qs = new URLSearchParams(event.queryStringParameters).toString();
    if (qs) targetPath += '?' + qs;
  }

  const targetUrl = REMOTE_ORIGIN + targetPath;

  // Perform fetch with retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await new Promise((resolve, reject) => {
        const parsedUrl = new URL(targetUrl);
        const req = https.get({
          hostname: parsedUrl.hostname,
          port: 443,
          path: parsedUrl.pathname + parsedUrl.search,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': `${REMOTE_ORIGIN}/`,
            'Cookie': clientCookie || ''
          }
        }, (res) => {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              buffer: Buffer.concat(chunks)
            });
          });
        });

        req.on('error', reject);
        req.setTimeout(12000, () => {
          req.destroy(new Error('Proxy request timed out'));
        });
      });

      // Silent handling of inaccessible remote audio
      if ((response.statusCode === 403 || response.statusCode === 404) && rawPath.endsWith('.mp3')) {
        return {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: ''
        };
      }

      // If CloudFront 403 on tile, re-fetch cookies and retry once
      if (response.statusCode === 403 && attempt === 0 && slug) {
        clientCookie = await fetchAuthCookies(slug);
        continue;
      }

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const isXml = rawPath.endsWith('.xml') || contentType.includes('xml');

      let responseBody;
      let isBase64 = false;

      if (isXml) {
        let xmlText = response.buffer.toString('utf-8');
        xmlText = cleanTourXml(xmlText);
        responseBody = xmlText;
        isBase64 = false;
      } else if (contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json')) {
        responseBody = response.buffer.toString('utf-8');
        isBase64 = false;
      } else {
        responseBody = response.buffer.toString('base64');
        isBase64 = true;
      }

      return {
        statusCode: response.statusCode,
        isBase64Encoded: isBase64,
        headers: {
          'Content-Type': isXml ? 'application/xml; charset=utf-8' : contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Cache-Control': response.statusCode === 200 ? 'public, max-age=604800, immutable' : 'no-cache'
        },
        body: responseBody
      };
    } catch (err) {
      if (attempt === 1) {
        console.error('[tour-proxy] Error fetching:', targetUrl, err.message);
        return {
          statusCode: 502,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
          },
          body: 'Proxy error: ' + err.message
        };
      }
    }
  }
};
