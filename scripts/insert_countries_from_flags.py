import os
import re

repo = os.path.dirname(os.path.dirname(__file__))
cat_file = os.path.join(repo, 'categories.js')
flags_dir = os.path.join(repo, 'images', 'country-flags')

with open(cat_file, 'r', encoding='utf-8') as f:
    data = f.read()

cap_m = re.search(r'(^\s*capitals\s*:\s*\[)', data, flags=re.MULTILINE)
if not cap_m:
    print('capitals section not found; aborting')
    raise SystemExit(1)
cap_pos = cap_m.start(1)

files = sorted([f for f in os.listdir(flags_dir) if os.path.isfile(os.path.join(flags_dir, f))])

def title_name(slug):
    s = slug.replace('-', ' ')
    s = s.replace('usa', 'United States').replace('uk', 'United Kingdom').replace('vatican', 'Vatican City')
    return s.title()

entries = []
for fn in files:
    slug = os.path.splitext(fn)[0]
    country = title_name(slug)
    answers = [slug.replace('-', ' '), country]
    img = f'images/country-flags/{fn}'
    entries.append((answers, img))

def js_list(a):
    return ', '.join([f'"{x}"' for x in a])

objs = []
for answers, img in entries:
    objs.append('{\\n    answers: [' + js_list(answers) + '],\\n    image: "' + img + '",\\n    difficulty: "easy"\\n}')

arr_text = '[\n' + ',\n\n'.join(objs) + '\n]\n'

insert_text = '\n\n    countries: ' + arr_text + '\n'

# backup
bak = cat_file + '.countries.bak'
with open(bak, 'w', encoding='utf-8') as f:
    f.write(data)

new_data = data[:cap_pos] + insert_text + data[cap_pos:]
with open(cat_file, 'w', encoding='utf-8') as f:
    f.write(new_data)

print(f'Inserted countries section with {len(entries)} entries. Backup: {bak}')
