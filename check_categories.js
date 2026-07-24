import re
from pathlib import Path
text = Path('categories.js').read_text(encoding='utf-8')
for cat in ['pokemon', 'football-players']:
    m = re.search(rf"{re.escape(cat)}\s*:\s*\[(.*?)(?=\n\s*\w+\s*:\s*\[|\n\s*\}|\Z)", text, re.S)
    if not m:
        print('CATEGORY', cat, 'NOT FOUND')
        continue
    body = m.group(1)
    items = re.split(r'\},\s*\n\s*\{', body)
    errors = []
    for i, item in enumerate(items, 1):
        item = item.strip()
        if not item:
            continue
        if not item.startswith('{'):
            item = '{' + item
        if not item.endswith('}'):
            item = item + '}'
        img = re.search(r'image\s*:\s*"([^"]+)"', item)
        ans = re.search(r'answers\s*:\s*\[([^\]]*)\]', item)
        if not img or not ans:
            errors.append((i, 'missing image or answers'))
            continue
        imgfile = Path(img.group(1)).name.lower()
        name0 = re.sub(r'[^a-z0-9]+','-', ans.group(1).split(',')[0].strip().strip('"\'\'').lower()).strip('-')
        base = Path(imgfile).stem.lower()
        if name0 != base and base not in name0 and name0 not in base:
            errors.append((i, base, name0, imgfile, ans.group(1).split(',')[:3]))
    print('CATEGORY', cat, 'count', len(items), 'errors', len(errors))
    for e in errors[:20]:
        print(' ', e)
