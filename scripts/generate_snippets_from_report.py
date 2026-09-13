import os

repo_root = os.path.dirname(os.path.dirname(__file__))
report_path = os.path.join(repo_root, 'missing-images-report-powershell.txt')
out_path = os.path.join(repo_root, 'scripts', 'snippets_for_review.js')

with open(report_path, 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

start = None
end = None
for i, line in enumerate(lines):
    if line.strip() == 'UNREFERENCED_NONIMG_FILES:':
        start = i+1
        break
for j in range(start, len(lines)):
    if lines[j].startswith('UNREFERENCED_WITH_MD5_AND_SIZE:'):
        end = j
        break
if start is None:
    print('UNREFERENCED_NONIMG_FILES: section not found')
    raise SystemExit(1)
if end is None:
    end = len(lines)

entries = [ln.strip() for ln in lines[start:end] if ln.strip() and not ln.strip().startswith('--')]
# group by category
groups = {}
for entry in entries:
    parts = entry.split('/')
    if len(parts) < 2:
        continue
    category = parts[0]
    filename = '/'.join(parts[1:])
    groups.setdefault(category, []).append(filename)

# build JS content
js_lines = []
js_lines.append('// Auto-generated snippets for review')
js_lines.append('window.snippetsForReview = {')
for cat, files in sorted(groups.items()):
    js_lines.append(f"  '{cat}': [")
    for fn in sorted(files):
        name, ext = os.path.splitext(fn)
        english = name.replace('-', ' ').replace('_', ' ')
        english_cap = ' '.join([w.capitalize() for w in english.split()])
        answers = [english.lower(), english_cap]
        answers_js = '[' + ', '.join([f'"{a}"' for a in answers]) + ']'
        image_path = f"images/{cat}/{fn}"
        js_lines.append('    {')
        js_lines.append(f'      "answers": {answers_js},')
        js_lines.append(f'      "image": "{image_path}",')
        js_lines.append(f'      "difficulty": "easy"')
        js_lines.append('    },')
    js_lines.append('  ],')
js_lines.append('};\n')

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(js_lines))

print(f'Wrote {out_path} with {sum(len(v) for v in groups.values())} snippets')
