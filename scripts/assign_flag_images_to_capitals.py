import os
import re

repo = os.path.dirname(os.path.dirname(__file__))
cat_file = os.path.join(repo, 'categories.js')
flags_dir = os.path.join(repo, 'images', 'country-flags')

with open(cat_file, 'r', encoding='utf-8') as f:
    data = f.read()

start = data.find('capitals: [')
if start == -1:
    print('capitals section not found')
    raise SystemExit(1)

# find end of capitals array by locating the first closing bracket followed by \n\n or similar after start
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

cap_section = data[cap_start:end+1]

pattern = re.compile(r'(image\s*:\s*\")images/capitals/([^\"\n]+)(\")', re.IGNORECASE)

replacements = 0
missing = []

def choose_flag_path(name):
    # try common extensions
    for ext in ('jpg', 'png', 'jpeg'):
        candidate = os.path.join(flags_dir, f"{name}.{ext}")
        if os.path.exists(candidate):
            return f"images/country-flags/{name}.{ext}"
    # try alternatives: replace spaces/underscores/different spellings
    alt = name.replace(' ', '-').replace('_', '-')
    for ext in ('jpg', 'png', 'jpeg'):
        candidate = os.path.join(flags_dir, f"{alt}.{ext}")
        if os.path.exists(candidate):
            return f"images/country-flags/{alt}.{ext}"
    return None

def repl(m):
    global replacements
    orig = m.group(2)
    name_no_ext = os.path.splitext(orig)[0]
    flag_path = choose_flag_path(name_no_ext)
    if flag_path:
        replacements += 1
        return m.group(1) + flag_path + m.group(3)
    else:
        missing.append(orig)
        return m.group(0)

new_cap_section = pattern.sub(repl, cap_section)

if replacements == 0:
    print('No replacements made; flags may not match existing capital image names.')
else:
    # write backup and replace in file
    bak = cat_file + '.capitalsflags.bak'
    with open(bak, 'w', encoding='utf-8') as f:
        f.write(data)
    new_data = data[:cap_start] + new_cap_section + data[end+1:]
    with open(cat_file, 'w', encoding='utf-8') as f:
        f.write(new_data)
    print(f'Replaced {replacements} image paths in capitals. Backup at {bak}')
    if missing:
        print('Missing flag matches for:', ', '.join(sorted(set(missing))))
