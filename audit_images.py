import re
from pathlib import Path

root = Path(r'c:/Users/User/Giannis-main')
text = (root / 'categories.js').read_text(encoding='utf-8', errors='ignore')
refs = sorted(set(re.findall(r'"image"\s*:\s*"([^"]+)"', text)))
actual = []
for p in root.glob('images/**/*'):
    if p.is_file() and p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}:
        actual.append(p.relative_to(root).as_posix())

actset = set(actual)
missing = [r for r in refs if not (root / r).exists()]
unref = [p for p in actset if p not in refs]


def norm(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', s.lower())

similar = []
for r in missing:
    base = Path(r).name
    candidates = [a for a in actset if Path(a).name == base]
    if not candidates:
        candidates = [a for a in actset if norm(Path(a).name) == norm(base)]
        if candidates:
            similar.append((r, candidates))

print('TOTAL_REFERENCED_UNIQUE', len(refs))
print('TOTAL_ACTUAL_FILES', len(actset))
print('MISSING_REFERENCES', len(missing))
print('UNREFERENCED_FILES', len(unref))
print('POSSIBLE_RENAMES_OR_MISPLACED', len(similar))
print('MISSING_REFERENCES_LIST')
for item in missing:
    print(item)
print('UNREFERENCED_FILES_LIST')
for item in unref:
    print(item)
print('SIMILAR_NAME_MATCHES')
for ref, cands in similar:
    print(ref, '->', cands)
