import os
import re
import json

repo = os.path.dirname(os.path.dirname(__file__))
cat_file = os.path.join(repo, 'categories.js')
flags_dir = os.path.join(repo, 'images', 'country-flags')

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

cap_pos = find_section('capitals')
if cap_pos[0] is None:
    print('capitals section not found')
    raise SystemExit(1)

cap_start_idx = cap_pos[1]
cap_end_idx = cap_pos[2]
cap_section = data[cap_start_idx:cap_end_idx+1]

# extract capital objects
obj_pat = re.compile(r'\{[^\{\}]*?\}', re.DOTALL)
ans_pat = re.compile(r'answers\s*:\s*\[([^\]]*)\]', re.IGNORECASE)
img_pat = re.compile(r'image\s*:\s*"([^"]+)"', re.IGNORECASE)

capital_map = {}  # country_slug -> capital_answers

for m in obj_pat.finditer(cap_section):
    obj = m.group(0)
    ansm = ans_pat.search(obj)
    imgm = img_pat.search(obj)
    if not imgm:
        continue
    img = imgm.group(1)
    if img.startswith('images/country-flags/'):
        slug = os.path.splitext(os.path.basename(img))[0]
        answers = []
        if ansm:
            inner = ansm.group(1)
            # find quoted strings
            answers = re.findall(r'"([^"]+)"|\'([^\']+)\'', inner)
            # re.findall with alternation returns tuples; flatten
            flat = []
            for a in answers:
                flat.append(a[0] or a[1])
            answers = flat
        capital_map[slug] = answers

# prepare country-flags entries
flag_files = [f for f in os.listdir(flags_dir) if os.path.isfile(os.path.join(flags_dir,f))]
entries = []

def title_name(slug):
    s = slug.replace('-', ' ')
    # common replacements
    s = s.replace('usa', 'United States').replace('uk', 'United Kingdom').replace('vatican', 'Vatican City')
    return s.title()

for fn in sorted(flag_files):
    slug = os.path.splitext(fn)[0]
    img_path = f'images/country-flags/{fn}'
    # if capital exists for this country, ensure capital's image already points to flag
    if slug in capital_map:
        # keep capital answers as-is, ensure image used is flag (we won't rewrite capitals here)
        pass
    # build country answers: try to use title of slug
    country_answer = title_name(slug)
    entries.append({
        'answers': [country_answer.lower(), country_answer],
        'image': img_path,
        'difficulty': 'easy'
    })

# build JS array text
def js_string_list(lst):
    return ', '.join(['"%s"' % x.replace('"', '\\"') for x in lst])

entries_js = []
for e in entries:
    entries_js.append('{\n    answers: [' + js_string_list(e['answers']) + '],\n    image: "' + e['image'] + '",\n    difficulty: "' + e['difficulty'] + '"\n}')

country_flags_array = '[\n' + ',\n\n'.join(entries_js) + '\n]\n'

# find existing country-flags or country_flags or countries: try keys
found = None
for name in ('country-flags', 'country_flags', 'countryFlags', 'countries'):
    pos = find_section(name)
    if pos[0] is not None:
        found = (name, pos)
        break

if not found:
    # insert new countries section before capitals
    print('No existing country section found; will insert before capitals')
    start_idx = cap_start_idx
    end_idx = cap_start_idx - 1
else:
    name, pos = found
    start_idx = pos[1]
    end_idx = pos[2]

# backup
bak = cat_file + '.countryflags.bak'
with open(bak, 'w', encoding='utf-8') as f:
    f.write(data)

new_data = data[:start_idx] + country_flags_array + data[end_idx+1:]
with open(cat_file, 'w', encoding='utf-8') as f:
    f.write(new_data)

print(f'Wrote {len(entries)} country-flag entries into section "{name}". Backup at {bak}')
