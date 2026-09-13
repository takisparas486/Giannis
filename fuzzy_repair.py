from pathlib import Path
import json, difflib, re
root=Path(r'c:/Users/User/Giannis-main')
mapf=root/'repair_map.json'
if not mapf.exists():
    print('repair_map.json missing')
    raise SystemExit(1)
mapping=json.loads(mapf.read_text(encoding='utf-8'))
# build actual basenames map
actual=[]
for p in root.glob('images/**/*'):
    if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.gif','.webp','.svg'}:
        actual.append(p.relative_to(root).as_posix())
base_to_path={Path(a).name: a for a in actual}
basenames=list(base_to_path.keys())
changed=0
for missing, cands in mapping.items():
    if cands:
        continue
    base=Path(missing).name
    # try exact substring match on last name token
    tokens=re.split(r'[^a-z0-9]+', base.lower())
    tokens=[t for t in tokens if t]
    found=None
    for t in reversed(tokens):
        for b in basenames:
            if t in b.lower():
                found=b
                break
        if found: break
    if not found:
        # try difflib
        match=difflib.get_close_matches(base.lower(), [b.lower() for b in basenames], n=1, cutoff=0.78)
        if match:
            # find original case name
            for b in basenames:
                if b.lower()==match[0]:
                    found=b
                    break
    if found:
        mapping[missing]=[base_to_path[found]]
        changed+=1
print('FUZZY_MAPPED', changed)
mapf.write_text(json.dumps(mapping, indent=2), encoding='utf-8')
print('WROTE', mapf)
