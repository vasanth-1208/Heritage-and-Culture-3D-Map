import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
# Set standard ciphers
try:
    ctx.set_ciphers('DEFAULT@SECLEVEL=1')
except Exception:
    pass

url = 'https://www.tamilnadutourism.tn.gov.in/virtualtour-pkg/thanjavur/images/01-03_o_preview_0.jpg'
req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tamilnadutourism.tn.gov.in/virtualtour-pkg/thanjavur/'
    }
)
try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        data = resp.read()
        print('Success! Fetched bytes:', len(data), 'status:', resp.status)
except Exception as e:
    print('Failed with:', e)
