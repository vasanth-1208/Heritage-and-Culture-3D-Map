with open('scratch_skin.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'ggId="controller"' in l.replace(' ', ''):
        for j in range(max(0, i - 10), min(len(lines), i + 25)):
            print(f"{j+1}: {lines[j]}", end='')
        break
