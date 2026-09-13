#!/usr/bin/env python3
"""
Check missing and unreferenced images across categories.js and images/ folders.
Writes report to missing-images-report.txt in project root.
"""
import re
import os
import hashlib
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CATS = os.path.join(ROOT, 'categories.js')
IMAGES_DIR = os.path.join(ROOT, 'images')
OUT = os.path.join(ROOT, 'missing-images-report.txt')

with open(CATS, 'r', encoding='utf8') as f:
    data = f.read()

# find all image paths like images/<cat>/<file>
matches = re.findall(r'images/([\w\-\s%]+?)/([\w\-\.]+\w)', data)
# matches are tuples (category, filename)
referenced = {}
for cat, fname in matches:
    referenced.setdefault(cat, set()).add(fname)

# walk images directory
existing = {}
for cat in os.listdir(IMAGES_DIR):
    catpath = os.path.join(IMAGES_DIR, cat)
    if not os.path.isdir(catpath):
        continue
    files = [f for f in os.listdir(catpath) if os.path.isfile(os.path.join(catpath, f))]
    existing[cat] = set(files)

report_lines = []
report_lines.append(f'ReFERENCED_CATEGORIES: {len(referenced)}')
report_lines.append(f'IMAGE_FOLDERS_FOUND: {len(existing)}')
report_lines.append('')

# missing referenced files
report_lines.append('MISSING_REFERENCED_FILES:')
missing_count = 0
for cat, files in referenced.items():
    for fname in sorted(files):
        if cat not in existing or fname not in existing[cat]:
            report_lines.append(f'{cat}/{fname}')
            missing_count += 1
report_lines.append(f'-- total missing: {missing_count}')
report_lines.append('')

# unreferenced non-IMG files (ignore IMG_ prefix)
report_lines.append('UNREFERENCED_NONIMG_FILES:')
unref_count = 0
for cat, files in existing.items():
    for fname in sorted(files):
        if fname.startswith('IMG_'):
            continue
        if cat in referenced and fname in referenced[cat]:
            continue
        report_lines.append(f'{cat}/{fname}')
        unref_count += 1
report_lines.append(f'-- total unreferenced non-IMG: {unref_count}')
report_lines.append('')

# write report and also compute md5+size for unreferenced list
report_lines.append('UNREFERENCED_WITH_MD5_AND_SIZE:')
for cat, files in existing.items():
    for fname in sorted(files):
        if fname.startswith('IMG_'):
            continue
        if cat in referenced and fname in referenced[cat]:
            continue
        path = os.path.join(IMAGES_DIR, cat, fname)
        try:
            sz = os.path.getsize(path)
            md5 = hashlib.md5(open(path,'rb').read()).hexdigest()
            report_lines.append(f'{cat}/{fname}, {sz} bytes, md5:{md5}')
        except Exception as e:
            report_lines.append(f'{cat}/{fname}, ERROR: {e}')

with open(OUT, 'w', encoding='utf8') as f:
    f.write('\n'.join(report_lines))

print('WROTE', OUT)
