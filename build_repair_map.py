from pathlib import Path
import re, json
root=Path(r'c:/Users/User/Giannis-main')
text=(root/'categories.js').read_text(encoding='utf-8', errors='ignore')
refs=sorted(set(re.findall(r'"image"\s*:\s*"([^"]+)"', text)))
actual=[]
for p in root.glob('images/**/*'):
    if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.gif','.webp','.svg'}:
        actual.append(p.relative_to(root).as_posix())
missing=[r for r in refs if not (root/r).exists()]
def norm(s): return re.sub(r'[^a-z0-9]+','', s.lower())
mapping={}
for r in missing:
    base=Path(r).name
    candidates=[a for a in actual if Path(a).name==base]
    if not candidates:
        candidates=[a for a in actual if norm(Path(a).name)==norm(base)]
    mapping[r]=candidates
out=root/'repair_map.json'
out.write_text(json.dumps(mapping,indent=2),encoding='utf-8')
print('WROTE',out)
print('MISSING',len(missing))
print('MAPPED', sum(1 for v in mapping.values() if v))
