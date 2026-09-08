import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.tamilnadutourism.tn.gov.in/virtualtour-pkg/thanjavur/skin.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
    js = resp.read().decode('utf-8', errors='ignore')

images = set(re.findall(r'["\']([^"\'\s]+\.(?:png|jpg|svg|gif))["\']', js))
print('Images in skin.js:', images)
