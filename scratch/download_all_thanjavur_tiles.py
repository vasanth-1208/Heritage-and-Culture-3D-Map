import os
import re
import ssl
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = r"c:\Projects\heritage-and-cul"
TOUR_DIR = os.path.join(BASE_DIR, "tours", "brihadeeswara-temple-thanjavur")
REMOTE_BASE = "https://www.tamilnadutourism.tn.gov.in/virtualtour-pkg/thanjavur"

with open(os.path.join(TOUR_DIR, "pano.xml"), "r", encoding="utf-8", errors="ignore") as f:
    xml = f.read()

# Collect all tile URLs, preview URLs, hotspot images, and sound URLs
tiles = set(re.findall(r'(?:tile[0-9]|prev[0-9]|tilevr)url="([^"]+)"', xml))
custom_images = set(re.findall(r'customimage="([^"]+)"', xml))
sounds = set(re.findall(r'<source\s+url="([^"]+)"', xml))
hotspot_previews = set(re.findall(r'images/ht_preview_nodeimage_[^"\'\s]+\.jpg', xml))

# Also scan skin.js for any media / image assets
with open(os.path.join(TOUR_DIR, "skin.js"), "r", encoding="utf-8", errors="ignore") as f:
    skin_js = f.read()
skin_images = set(re.findall(r'images/[a-zA-Z0-9_\-\.]+\.(?:png|jpg|svg)', skin_js))

all_assets = sorted(list(tiles | custom_images | sounds | hotspot_previews | skin_images))
print(f"Total unique assets referenced: {len(all_assets)}")

# SSL Context
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
try:
    ctx.set_ciphers('DEFAULT@SECLEVEL=1')
except Exception:
    pass

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": f"{REMOTE_BASE}/"
}

def is_valid_local(rel):
    local_path = os.path.join(TOUR_DIR, rel.replace("/", os.sep))
    if not os.path.isfile(local_path):
        return False
    sz = os.path.getsize(local_path)
    if sz == 0:
        return False
    if rel.lower().endswith('.jpg') or rel.lower().endswith('.jpeg'):
        with open(local_path, 'rb') as f:
            f.seek(max(0, sz - 2))
            end = f.read(2)
        if end != b'\xff\xd9':
            return False
    return True

missing = [rel for rel in all_assets if not is_valid_local(rel)]
print(f"Already valid on disk: {len(all_assets) - len(missing)}")
print(f"To download / repair: {len(missing)}")

def download_one(rel):
    local_path = os.path.join(TOUR_DIR, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    target_url = f"{REMOTE_BASE}/{rel}"
    
    for attempt in range(4):
        try:
            req = urllib.request.Request(target_url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                data = resp.read()
                
                # Check for completeness if Content-Length provided
                cl = resp.headers.get("Content-Length")
                if cl and len(data) != int(cl):
                    time.sleep(1.0)
                    continue
                
                # If JPEG, must end with \xff\xd9
                if rel.lower().endswith(('.jpg', '.jpeg')):
                    if not data.endswith(b'\xff\xd9'):
                        time.sleep(1.0)
                        continue
                
                if len(data) > 0:
                    temp_path = local_path + ".tmp"
                    with open(temp_path, "wb") as f:
                        f.write(data)
                    os.replace(temp_path, local_path)
                    return rel, True, len(data), ""
        except Exception as e:
            time.sleep(1.0 + attempt * 0.5)
            last_err = str(e)
            
    return rel, False, 0, last_err

if missing:
    print(f"\nStarting download of {len(missing)} assets using 4 threads...")
    completed = 0
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(download_one, rel): rel for rel in missing}
        for future in as_completed(futures):
            rel, ok, size, err = future.result()
            completed += 1
            status = f"OK ({size:,} B)" if ok else f"FAILED: {err}"
            print(f"[{completed}/{len(missing)}] {rel} -> {status}", flush=True)

print("\n--- FINAL VERIFICATION ---")
still_missing = [rel for rel in all_assets if not is_valid_local(rel)]
print(f"Total assets: {len(all_assets)}")
print(f"Valid on disk: {len(all_assets) - len(still_missing)}")
print(f"Still missing/invalid: {len(still_missing)}")
if still_missing:
    for sm in still_missing[:10]:
        print("  ", sm)
