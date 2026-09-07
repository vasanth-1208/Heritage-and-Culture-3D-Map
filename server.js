/**
 * Virtual Tourism - Node.js Local Development Server
 * Zero external dependencies! Uses Node.js built-in 'http', 'https', 'fs', 'path'.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const BASE_DIR = __dirname;
const REMOTE_ORIGIN = 'https://virtualtourism.in';

let savedCookies = [];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function fetchRemoteAuth(slug, callback) {
  const postData = JSON.stringify({ slug });
  const options = {
    hostname: 'virtualtourism.in',
    port: 443,
    path: '/api/tour-access',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  };

  const req = https.request(options, (res) => {
    if (res.headers['set-cookie']) {
      savedCookies = res.headers['set-cookie'].map(c => c.split(';')[0]);
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (callback) callback(null, data);
    });
  });

  req.on('error', err => {
    console.error('[Node Server] Auth error:', err.message);
    if (callback) callback(err);
  });

  req.write(postData);
  req.end();
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const rawPath = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle POST /api/tour-access
  if (req.method === 'POST' && rawPath === '/api/tour-access') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let slug = '';
      try {
        const parsed = JSON.parse(body);
        slug = parsed.slug || '';
      } catch (e) {}

      if (slug) {
        fetchRemoteAuth(slug, () => {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true, message: 'Tour access granted.', cloudFrontSignedCookies: true }));
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, message: 'Tour access granted.' }));
      }
    });
    return;
  }

  // Transparent 1x1 PNG
  const TRANSPARENT_PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');

  // Proxy /tours/* requests
  if (rawPath.startsWith('/tours/')) {
    // 1. Suppress splash images and VR person logos with a transparent PNG
    if (['splash_screen.png', 'vr_logo.png', 'vr_logo_mobile.png', 'logo.png', 'logo_h.png'].some(img => rawPath.endsWith(img))) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': TRANSPARENT_PNG.length });
      res.end(TRANSPARENT_PNG);
      return;
    }

    const targetUrl = REMOTE_ORIGIN + req.url;
    const cookieHeader = savedCookies.join('; ');
    const proxyReq = https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': `${REMOTE_ORIGIN}/`,
        'Cookie': cookieHeader
      }
    }, (proxyRes) => {
      // 2. If tour.xml, clean out splash blocker and logos
      if (rawPath.endsWith('tour.xml')) {
        let xmlChunks = [];
        proxyRes.on('data', chunk => xmlChunks.push(chunk));
        proxyRes.on('end', () => {
          let xmlStr = Buffer.concat(xmlChunks).toString('utf-8');
          xmlStr = xmlStr
            .replace(/<layer\s+name=["']skin_intro_blocker["'][\s\S]*?<\/layer>/gi, '')
            .replace(/<layer\s+name=["']logo["'][^>]*>/gi, '')
            .replace(/<layer[^>]*vr_logo[^>]*>/gi, '')
            .replace(/set\(layer\[skin_intro_blocker\][^;]+;/gi, '')
            .replace(/removelayer\(skin_intro_blocker\);?/gi, '')
            .replace(/tween\(layer\[skin_intro_blocker\][^;]+;/gi, 'skin_autotour(true);')
            .replace(/skin_intro_blocker/gi, 'dummy_unused_layer');
          const cleanedBuf = Buffer.from(xmlStr, 'utf-8');
          res.writeHead(200, {
            'Content-Type': 'application/xml; charset=utf-8',
            'Content-Length': cleanedBuf.length
          });
          res.end(cleanedBuf);
        });
      } else {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy Error: ' + err.message);
    });
    return;
  }

  // Static files & Clean URLs
  let filePath = '';
  if (rawPath === '/' || rawPath === '') {
    filePath = path.join(BASE_DIR, 'index.html');
  } else if (rawPath.startsWith('/virtual-tour/')) {
    const slug = rawPath.replace('/virtual-tour/', '').replace(/\/$/, '').replace('.html', '');
    const cand1 = path.join(BASE_DIR, 'virtual-tour', slug, 'index.html');
    const cand2 = path.join(BASE_DIR, 'virtual-tour', `${slug}.html`);
    if (fs.existsSync(cand1)) filePath = cand1;
    else if (fs.existsSync(cand2)) filePath = cand2;
    else filePath = path.join(BASE_DIR, 'destination.html');
  } else {
    filePath = path.join(BASE_DIR, rawPath.replace(/^\//, ''));
    if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${rawPath}`);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('========================================================');
  console.log(' Virtual Tourism Node.js Server Running');
  console.log(` Web app available at: http://localhost:${PORT}`);
  console.log(` Direct link: http://localhost:${PORT}/virtual-tourism.html`);
  console.log('========================================================');
});
