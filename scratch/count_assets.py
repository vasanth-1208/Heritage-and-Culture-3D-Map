import re

with open('scratch_pano.xml', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# All image tiles and previews
images = set(re.findall(r'(?:tile[0-9]|prev[0-9]|tilevr)url="([^"]+)"', text))
# Hotspot images
customimages = set(re.findall(r'customimage="([^"]+)"', text))
# Sound urls
sounds = set(re.findall(r'<source\s+url="([^"]+)"', text))

print(f"Total tile images: {len(images)}")
print(f"Total customimages: {len(customimages)} -> {customimages}")
print(f"Total sound files: {len(sounds)} -> {sounds}")
