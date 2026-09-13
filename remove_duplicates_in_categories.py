import os
import re
import shutil
from collections import OrderedDict

ROOT = os.path.dirname(os.path.abspath(__file__)) if '__file__ in globals()' else os.getcwd()
# fix __file__ detection for exec
ROOT = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
CATEGORIES = os.path.join(ROOT, 'categories.js')


def read_text():
    return open(CATEGORIES, encoding='utf-8').read()


def find_array_block(text, start_idx):
    i = start_idx
    depth = 1
    in_str = False
    str_char = None
    esc = False
    while i < len(text):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == '\\':
                esc = True
            elif ch == str_char:
                in_str = False
        else:
            if ch == '"' or ch == "'":
                in_str = True
                str_char = ch
            elif ch == '[':
                depth += 1
            elif ch == ']':
                depth -= 1
                if depth == 0:
                    return text[start_idx:i+1]
        i += 1
    return text[start_idx:i]


def parse_categories(text):
    pattern = re.compile(r'^\s*(?:"([^\"]+)"|([A-Za-z0-9_\-]+))\s*:\s*\[', re.MULTILINE)
    res = OrderedDict()
    for m in pattern.finditer(text):
        name = m.group(1) or m.group(2)
        bracket_pos = text.find('[', m.end()-1)
        if bracket_pos == -1:
            continue
        block = find_array_block(text, bracket_pos)
        # find objects including nested braces naive approach
        objs = re.findall(r'\{[^\{\}]*\}', block)
        res[name] = objs
    return res


def image_from_obj(obj):
    m = re.search(r'image\s*:\s*["\']([^"\']+)["\']', obj)
    if m:
        return m.group(1).strip()
    return None


def answers_key(obj):
    m = re.search(r'answers\s*:\s*\[([^\]]*)\]', obj)
    if not m:
        m = re.search(r'"answers"\s*:\s*\[([^\]]*)\]', obj)
    if not m:
        return None
    ans_block = m.group(1)
    parts = re.findall(r'\"([^\"]+)\"|\'([^']+)\'', ans_block)
    cleaned = []
    for p in parts:
        if p[0]:
            cleaned.append(p[0].strip().lower())
        elif p[1]:
            cleaned.append(p[1].strip().lower())
    if not cleaned:
        # fallback: split by commas
        items = [s.strip().strip('"\'') for s in ans_block.split(',') if s.strip()]
        cleaned = [s.lower() for s in items]
    # canonical key
    return '|'.join(sorted(set(cleaned)))


def render_array(objs, indent='    '):
    if not objs:
        return '[]'
    parts = []
    for o in objs:
        parts.append(indent + o + ',')
    parts[-1] = parts[-1].rstrip(',')
    return '[\n' + '\n'.join(parts) + '\n]'


def remove_duplicates():
    text = read_text()
    cats = parse_categories(text)
    changed = False
    new_map = OrderedDict()
    for name, objs in cats.items():
        seen_images = set()
        seen_answers = set()
        keep = []
        for o in objs:
            img = image_from_obj(o) or ''
            akey = answers_key(o) or ''
            dup = False
            if img:
                if img in seen_images:
                    dup = True
                else:
                    seen_images.add(img)
            if akey:
                if akey in seen_answers:
                    dup = True
                else:
                    seen_answers.add(akey)
            if not dup:
                keep.append(o)
            else:
                changed = True
        new_map[name] = keep
    if not changed:
        print('No duplicates found')
        return False
    # replace arrays in text
    def repl(m):
        name = m.group(1) or m.group(2)
        arr = new_map.get(name)
        if arr is None:
            return m.group(0) + '['
        return m.group(0) + '\n' + render_array(arr, indent='    ')

    cat_pattern = re.compile(r'(^\s*(?:"([^\"]+)"|([A-Za-z0-9_\-]+))\s*:\s*)\[', re.MULTILINE)
    new_text = cat_pattern.sub(repl, text)
    # backup and write
    bak = CATEGORIES + '.bak2'
    shutil.copyfile(CATEGORIES, bak)
    with open(CATEGORIES, 'w', encoding='utf-8') as fh:
        fh.write(new_text)
    print('Removed duplicates and wrote', CATEGORIES, 'backup at', bak)
    return True

if __name__ == '__main__':
    ok = remove_duplicates()
    if ok:
        try:
            exec(open(os.path.join(ROOT, 'compare_categories_images.py')).read(), globals())
        except Exception as e:
            print('Compare failed:', e)
