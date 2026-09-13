import re
from collections import Counter
text = open('categories.js', encoding='utf-8').read()
imgs = re.findall(r'image\s*:\s*["\'](images/[^"\']+)["\']', text)
c = Counter(imgs)
total_refs = len(imgs)
unique_paths = len(c)
dup_paths = [(p,n) for p,n in c.items() if n>1]
dup_count = len(dup_paths)
dup_refs = sum(n-1 for p,n in dup_paths)
print('TOTAL_IMAGE_REFERENCES:', total_refs)
print('UNIQUE_IMAGE_PATHS:', unique_paths)
print('DUPLICATE_PATHS:', dup_count)
print('DUPLICATE_REFERENCES:', dup_refs)
if dup_count:
    print('\nTop duplicate paths:')
    for p,n in sorted(dup_paths, key=lambda x: -x[1])[:50]:
        print(n, p)
else:
    print('\nNo duplicate image paths found.')
