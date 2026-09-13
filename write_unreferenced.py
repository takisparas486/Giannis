from pathlib import Path
import re
root=Path(r'c:/Users/User/Giannis-main')
text=(root/'categories.js').read_text(encoding='utf-8', errors='ignore')
refs=set(re.findall(r'"image"\s*:\s*"([^"]+)"', text))
actual=[]
for p in root.glob('images/**/*'):
    if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.gif','.webp','.svg'}:
        actual.append(p.relative_to(root).as_posix())
unref=[p for p in actual if p not in refs]
out=root/'unreferenced_images.txt'
out.write_text('\n'.join(unref), encoding='utf-8')
print('WROTE', out, 'COUNT', len(unref))
