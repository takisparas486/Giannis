from pathlib import Path
import json
root=Path(r'c:/Users/User/Giannis-main')
mapf=root/'repair_map.json'
if not mapf.exists():
    print('repair_map.json not found. Run build_repair_map.py first.')
    raise SystemExit(1)
mapping=json.loads(mapf.read_text(encoding='utf-8'))
catf=root/'categories.js'
text=catf.read_text(encoding='utf-8', errors='ignore')
applied=0
for old, cands in mapping.items():
    if cands:
        new=cands[0]
        new_text='"image": "{}"'.format(new)
        old_text='"image": "{}"'.format(old)
        if old_text in text:
            text=text.replace(old_text, new_text)
            applied+=1
catf.write_text(text, encoding='utf-8')
print('APPLIED', applied)
