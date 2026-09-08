import re

with open('scratch_skin.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

gg_ids = sorted(list(set(re.findall(r'\.ggId=[\'"]([^\'"]+)[\'"]', text))))
print('Found ggId elements (%d):' % len(gg_ids))
for gid in gg_ids:
    print(' -', gid)
