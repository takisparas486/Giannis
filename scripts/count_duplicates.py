import re
from collections import Counter
p = "c:/Users/User/Giannis-main/categories.js"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()
imgs = re.findall(r'"image"\s*:\s*"([^"]+)"', s)
c = Counter(imgs)
dups = [(path, count) for path, count in c.items() if count > 1]
print('TOTAL_IMAGE_REFERENCES', len(imgs))
print('UNIQUE_PATHS', len(c))
print('DUPLICATE_PATHS', len(dups))
if dups:
    print('\nTop duplicates:')
    for path, count in sorted(dups, key=lambda x: -x[1])[:200]:
        print(count, path)
else:
    print('\nNo duplicate image paths found.')
