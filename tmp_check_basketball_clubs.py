import os, re
root = r'C:\Users\User\Giannis-main'
text = open(os.path.join(root, 'categories.js'), encoding='utf-8').read()
match = re.search(r'"basketball-clubs"\s*:\s*\[(.*?)\]\s*,\s*"basketball-players"', text, re.S)
if not match:
    raise SystemExit('basketball-clubs block not found')
images = re.findall(r'"image"\s*:\s*"([^"]+)"', match.group(1))
missing = []
for img in images:
    full = os.path.normpath(os.path.join(root, img))
    if not os.path.exists(full):
        missing.append(img)
print('missing count:', len(missing))
for img in missing:
    print(img)
