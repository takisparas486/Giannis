import os
import re

repo = os.path.dirname(os.path.dirname(__file__))
cat_file = os.path.join(repo, 'categories.js')
flags_dir = os.path.join(repo, 'images', 'country-flags')
countries_dir = os.path.join(repo, 'images', 'countries')

with open(cat_file, 'r', encoding='utf-8') as f:
    data = f.read()

def find_section(name):
    m = re.search(r'(^\s*' + re.escape(name) + r'\s*:\s*\[)', data, flags=re.MULTILINE)
    if not m:
        return None, None, None
    start = m.start(1)
    cap_start = data.find('[', start)
    depth = 0
    end = cap_start
    for i in range(cap_start, len(data)):
        if data[i] == '[':
            depth += 1
        elif data[i] == ']':
            depth -= 1
            if depth == 0:
                end = i
                break
    return start, cap_start, end

def pick_best_path(slug):
    # prefer country-flags with common extensions
    for ext in ('jpg','png','jpeg'):
        p = os.path.join(flags_dir, f"{slug}.{ext}")
        if os.path.exists(p):
            return f"images/country-flags/{slug}.{ext}"
    # special mappings
    if slug in ('united-states','united_states','united states'):
        if os.path.exists(os.path.join(flags_dir,'usa.jpg')):
            return 'images/country-flags/usa.jpg'
        if os.path.exists(os.path.join(countries_dir,'usa.png')):
            return 'images/countries/usa.png'
    # fallback to countries folder
    for ext in ('png','jpg','jpeg'):
        p = os.path.join(countries_dir, f"{slug}.{ext}")
        if os.path.exists(p):
            return f"images/countries/{slug}.{ext}"
    return None

def replace_in_section(name):
    pos = find_section(name)
    if pos[0] is None:
        return 0
    start_idx = pos[1]
    end_idx = pos[2]
    section = data[start_idx:end_idx+1]
    changed = 0
    def repl_img(m):
        nonlocal changed
        orig = m.group(1)
        slug = os.path.splitext(os.path.basename(orig))[0]
        best = pick_best_path(slug)
        if best and best != orig:
            changed += 1
            return 'image: "' + best + '"'
        return m.group(0)
    new_section = re.sub(r'image\s*:\s*"([^"]+)"', repl_img, section, flags=re.IGNORECASE)
    return start_idx, end_idx, new_section, changed

# backup
bak = cat_file + '.normalizeflags.bak'
with open(bak, 'w', encoding='utf-8') as f:
    f.write(data)

total_changed = 0

for name in ('countries','country-flags','country_flags','countryFlags'):
    res = replace_in_section(name)
    if res:
        start_idx, end_idx, new_section, changed = res
        if changed:
            data = data[:start_idx] + new_section + data[end_idx+1:]
            total_changed += changed

# also normalize capitals
res = replace_in_section('capitals')
if res:
    start_idx, end_idx, new_section, changed = res
    if changed:
        data = data[:start_idx] + new_section + data[end_idx+1:]
        total_changed += changed

with open(cat_file, 'w', encoding='utf-8') as f:
    f.write(data)

print(f'Normalized {total_changed} image paths. Backup at {bak}')
