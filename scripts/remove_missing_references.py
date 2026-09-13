import re
import os

repo_root = os.path.dirname(os.path.dirname(__file__))
# prefer the PowerShell report, fall back to the Python report if present
ps_report = os.path.join(repo_root, 'missing-images-report-powershell.txt')
py_report = os.path.join(repo_root, 'missing-images-report.txt')
if os.path.exists(ps_report):
    report_path = ps_report
elif os.path.exists(py_report):
    report_path = py_report
else:
    report_path = os.path.join(repo_root, 'missing-images-report-powershell.txt')

cat_path = os.path.join(repo_root, 'categories.js')
out_path = os.path.join(repo_root, 'categories.js.cleaned')

with open(report_path, 'r', encoding='utf-8') as f:
    lines = f.read().splitlines()

# extract MISSING_REFERENCED_FILES section
start = None
for i, line in enumerate(lines):
    if line.strip() == 'MISSING_REFERENCED_FILES:':
        start = i+1
        break
if start is None:
    print('No MISSING_REFERENCED_FILES: section found in report')
    raise SystemExit(1)

missing = []
for ln in lines[start:]:
    ln = ln.strip()
    if not ln:
        break
    if ln.startswith('--'):
        break
    missing.append(ln)

if not missing:
    print('No missing referenced files to remove.')
    raise SystemExit(0)

with open(cat_path, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)
removed_count = 0

for rel in missing:
    img_path = 'images/' + rel.replace('\\\\', '/').lstrip('/')
    # regex to remove the enclosing object that contains the image property
    # matches from the nearest preceding '{' to the next '},' or '}' including trailing comma
    # match either "image" or image as the key, allow varying whitespace and case
    key_pattern = r'(?:\"image\"|image)\s*:\s*\"'
    pat = re.compile(r"\{[^\{\}]*?" + key_pattern + re.escape(img_path) + r"\"[^\{\}]*?\},?\n?", re.DOTALL | re.IGNORECASE)
    new_content, n = pat.subn('', content)
    if n > 0:
        removed_count += n
        content = new_content

# cleanup: remove possible sequences of commas like ',\n\s*,\n' -> ',\n'
content = re.sub(r',\s*\n\s*,', ',\n', content)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Removed {removed_count} objects referencing missing images. Wrote {out_path}')
