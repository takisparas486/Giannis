from pathlib import Path
import re, json
root=Path(r'c:/Users/User/Giannis-main')
text=(root/'categories.js').read_text(encoding='utf-8', errors='ignore')
refs=[m.group(1) for m in re.finditer(r'"image"\s*:\s*"([^"]+)"', text)]
refs_set=set(refs)
actual=[]
for p in root.glob('images/**/*'):
    if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.gif','.webp','.svg'}:
        actual.append(p.relative_to(root).as_posix())
actual_set=set(actual)
missing=[r for r in refs_set if not (root/r).exists()]
unreferenced=[a for a in actual if a not in refs_set]
# per-category counts based on folder name after images/
from collections import Counter
ref_cat=Counter()
act_cat=Counter()
for r in refs:
    parts=r.split('/')
    if len(parts)>1:
        ref_cat[parts[1]]+=1
    else:
        ref_cat['misc']+=1
for a in actual:
    parts=a.split('/')
    if len(parts)>1:
        act_cat[parts[1]]+=1
    else:
        act_cat['misc']+=1
report=[]
report.append(f'TOTAL_REFERENCES {len(refs)}')
report.append(f'TOTAL_REFERENCED_UNIQUE {len(refs_set)}')
report.append(f'TOTAL_ACTUAL_FILES {len(actual)}')
report.append(f'MISSING_REFERENCES {len(missing)}')
report.append(f'UNREFERENCED_FILES {len(unreferenced)}')
report.append('\nTOP 20 REFERENCED CATEGORIES')
for k,v in ref_cat.most_common(20):
    report.append(f'{k}: {v} refs; actual files: {act_cat.get(k,0)}')
report.append('\nMISSING_REFERENCES_LIST')
for m in missing:
    report.append(m)
report.append('\nUNREFERENCED_FILES_LIST')
for u in unreferenced:
    report.append(u)
out=root/'scan_report.txt'
out.write_text('\n'.join(report), encoding='utf-8')
print('WROTE', out)
