import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://www.tamilnadutourism.tn.gov.in/virtualtour-pkg/thanjavur/pano.xml',
    headers={'User-Agent': 'Mozilla/5.0'}
)
with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
    xml = resp.read().decode('utf-8', errors='ignore')

nodes = re.findall(r'<panorama[^>]+id="([^"]+)"', xml)
print('Total nodes:', len(nodes), nodes)

image_urls = re.findall(r'(?:tile[0-9]|prev[0-9]|tilevr)url="([^"]+)"', xml)
print('Total tile URLs:', len(image_urls))
print('Sample images:', image_urls[:5])
