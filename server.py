#!/usr/bin/env python3
"""
Virtual Tourism - Local Multi-Threaded Development Server
Serves static assets, handles clean routing (/virtual-tour/<slug>),
and proxies /api/tour-access and /tours/* with CloudFront signed cookies
so that 360° virtual tours work seamlessly on localhost.
"""

import os
import sys
import json
import mimetypes
import urllib.request
import urllib.parse
import http.cookiejar
import re
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REMOTE_ORIGIN = "https://virtualtourism.in"

# 1x1 Transparent PNG to replace any logo or splash image requests
TRANSPARENT_PNG = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'

def clean_tour_xml(xml_bytes):
    """Strip intro blocker splash card, logos, and VR branding from KRPano tour.xml"""
    try:
        text = xml_bytes.decode('utf-8', errors='ignore')
        # Remove skin_intro_blocker container and all nested layers (splash screen, enter fullscreen button)
        text = re.sub(r'<layer\s+name=["\']skin_intro_blocker["\'].*?</layer>', '', text, flags=re.DOTALL)
        # Remove logo layer (VR person logo)
        text = re.sub(r'<layer\s+name=["\']logo["\'][^>]*>', '', text)
        text = re.sub(r'<layer[^>]*vr_logo[^>]*>', '', text)
        # Clean actions referencing skin_intro_blocker
        text = re.sub(r'set\(layer\[skin_intro_blocker\][^;]+;', '', text)
        text = re.sub(r'removelayer\(skin_intro_blocker\);?', '', text)
        text = re.sub(r'tween\(layer\[skin_intro_blocker\][^;]+;', 'skin_autotour(true);', text)
        text = re.sub(r'skin_intro_blocker', 'dummy_unused_layer', text)
        return text.encode('utf-8')
    except Exception as e:
        sys.stderr.write(f"[Server] XML clean error: {e}\n")
        return xml_bytes

# In-memory store for CloudFront signed cookies
cookie_jar = http.cookiejar.CookieJar()
cookie_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

# Additional MIME types
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/xml", ".xml")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/jpeg", ".jpg")
mimetypes.add_type("image/jpeg", ".jpeg")
mimetypes.add_type("audio/mpeg", ".mp3")

def fetch_remote_auth(slug):
    """Obtain CloudFront signed cookies from live virtualtourism.in API"""
    try:
        url = f"{REMOTE_ORIGIN}/api/tour-access"
        payload = json.dumps({"slug": slug}).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        )
        resp = cookie_opener.open(req, timeout=10)
        return resp.read().decode("utf-8")
    except Exception as e:
        sys.stderr.write(f"[Server] Auth fetch failed for {slug}: {e}\n")
        return None

class LocalTourismHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.send_header("Access-Control-Allow-Credentials", "true")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/tour-access":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""
            slug = ""
            try:
                data = json.loads(body)
                slug = data.get("slug", "")
            except Exception:
                pass

            if slug:
                fetch_remote_auth(slug)

            resp_data = json.dumps({
                "ok": True,
                "message": "Tour access granted.",
                "cloudFrontSignedCookies": True
            }).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_cors_headers()
            self.send_header("Content-Length", str(len(resp_data)))
            self.end_headers()
            self.wfile.write(resp_data)
            return

        self.send_error(404, "Not Found")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        raw_path = parsed.path
        query = parsed.query

        # Proxy /tours/* requests
        if raw_path.startswith("/tours/"):
            self.proxy_tour_asset(raw_path, query)
            return

        # Clean URLs mapping
        if raw_path == "/" or raw_path == "":
            file_path = os.path.join(BASE_DIR, "index.html")
        elif raw_path.startswith("/virtual-tour/"):
            slug = raw_path[len("/virtual-tour/"):].strip("/").replace(".html", "")
            cand1 = os.path.join(BASE_DIR, "virtual-tour", slug, "index.html")
            cand2 = os.path.join(BASE_DIR, "virtual-tour", f"{slug}.html")
            if os.path.isfile(cand1):
                file_path = cand1
            elif os.path.isfile(cand2):
                file_path = cand2
            else:
                file_path = os.path.join(BASE_DIR, "destination.html")
        else:
            rel_path = raw_path.lstrip("/")
            file_path = os.path.join(BASE_DIR, rel_path)
            if not os.path.exists(file_path):
                if os.path.isfile(f"{file_path}.html"):
                    file_path = f"{file_path}.html"

        if os.path.isdir(file_path):
            index_path = os.path.join(file_path, "index.html")
            if os.path.isfile(index_path):
                file_path = index_path

        if os.path.isfile(file_path):
            self.serve_file(file_path)
        else:
            self.send_error(404, f"File Not Found: {raw_path}")

    def serve_file(self, file_path):
        mime, _ = mimetypes.guess_type(file_path)
        if not mime:
            mime = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(content)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Internal Error: {e}")

    def proxy_tour_asset(self, path, query):
        """Reverse proxy for KRPano tour assets (tiles, XML, sounds)"""
        # 1. Suppress all intro splash images and VR person logos with a transparent PNG
        if any(path.endswith(img) for img in ['splash_screen.png', 'vr_logo.png', 'vr_logo_mobile.png', 'logo.png', 'logo_h.png']):
            self.send_response(200)
            self.send_header("Content-Type", "image/png")
            self.send_header("Content-Length", str(len(TRANSPARENT_PNG)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(TRANSPARENT_PNG)
            return

        target_url = f"{REMOTE_ORIGIN}{path}"
        if query:
            target_url += f"?{query}"

        parts = path.split("/")
        if len(parts) >= 3:
            slug = parts[2]
            cookies_present = any(c.domain.endswith("virtualtourism.in") for c in cookie_jar)
            if not cookies_present:
                fetch_remote_auth(slug)

        try:
            req = urllib.request.Request(
                target_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": f"{REMOTE_ORIGIN}/"
                }
            )
            resp = cookie_opener.open(req, timeout=20)
            content_type = resp.headers.get("Content-Type", "application/octet-stream")
            body = resp.read()

            # 2. If tour.xml is requested, strip the intro splash card and logo layers
            if path.endswith("tour.xml"):
                body = clean_tour_xml(body)
                content_type = "application/xml; charset=utf-8"

            self.send_response(resp.status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(body)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header("Content-Type", "text/plain")
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(f"Proxy error: {e}".encode("utf-8"))
        except Exception as e:
            self.send_error(502, f"Bad Gateway: {e}")

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]}\n")
        sys.stderr.flush()

def run(port=PORT):
    server_address = ("", port)
    httpd = ThreadingHTTPServer(server_address, LocalTourismHandler)
    print("=" * 64, flush=True)
    print(" Virtual Tourism Multi-Threaded Local Server", flush=True)
    print(f" Web app available at: http://localhost:{port}", flush=True)
    print(f" Direct link: http://localhost:{port}/virtual-tourism.html", flush=True)
    print(" Press Ctrl+C to stop the server.", flush=True)
    print("=" * 64, flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...", flush=True)
        httpd.server_close()

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(p)
