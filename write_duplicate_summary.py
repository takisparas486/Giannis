import re,collections
text=open('categories.js',encoding='utf-8').read()
imgs=re.findall(r'image\s*:\s*["\'](images/[^"\']+)["\']', text)
c=collections.Counter(imgs)
dups=[(p,n) for p,n in c.items() if n>1]
with open('duplicates_summary.txt','w',encoding='utf-8') as fh:
    fh.write('TOTAL_IMAGE_REFERENCES:%d\nUNIQUE_IMAGE_PATHS:%d\nDUPLICATE_PATHS:%d\nDUPLICATE_REFERENCES:%d\n' % (len(imgs), len(c), len(dups), sum(n-1 for p,n in dups)))
    for p,n in sorted(dups,key=lambda x:-x[1])[:200]:
        fh.write('%d,%s\n' % (n,p))
print('WROTE duplicates_summary.txt')
