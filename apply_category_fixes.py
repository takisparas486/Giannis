import os
import re
import shutil
from collections import OrderedDict

ROOT = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
CATEGORIES_PATH = os.path.join(ROOT, 'categories.js')
IMAGES_DIR = os.path.join(ROOT, 'images')


def read_text(path):
    return open(path, encoding='utf-8').read()


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
    return text[start_idx:]


def parse_category_objects(text):
    cat_pattern = re.compile(r'^\s*(?:"([^\"]+)"|([A-Za-z0-9_\-]+))\s*:\s*\[', re.MULTILINE)
    res = OrderedDict()
    spans = []
    for m in cat_pattern.finditer(text):
        name = m.group(1) or m.group(2)
        bracket_pos = text.find('[', m.end()-1)
        if bracket_pos == -1:
            continue
        block = find_array_block(text, bracket_pos)
        # find object literals within block
        objs = re.findall(r'\{[^\{\}]*\}', block)
        obj_texts = [o.strip() for o in objs]
        res[name] = obj_texts
        spans.append((name, m.start(), bracket_pos, bracket_pos+len(block)))
    return res, spans


def image_from_obj(obj):
    m = re.search(r'image\s*:\s*["\']([^"\']+)["\']', obj)
    if m:
        return m.group(1)
    m2 = re.search(r'\"image\"\s*:\s*\"([^\"]+)\"', obj)
    if m2:
        return m2.group(1)
    return None


def folder_for_image(img_path):
    parts = img_path.split('/')
    if len(parts) >= 2 and parts[0] == 'images':
        return parts[1]
    return None


def build_new_categories_map(cat_objs):
    # map category -> list of objects that belong there
    new_map = OrderedDict()
    # initialize with existing categories
    for c in cat_objs.keys():
        new_map[c] = []
    # also discover fs folders
    fs_folders = [d for d in sorted(os.listdir(IMAGES_DIR)) if os.path.isdir(os.path.join(IMAGES_DIR, d))]
    for f in fs_folders:
        if f not in new_map:
            new_map[f] = []
    # iterate all objects and place them into the folder derived from their image path
    for c, objs in cat_objs.items():
        for obj in objs:
            img = image_from_obj(obj)
            if not img:
                # keep with original category
                new_map[c].append(obj)
                continue
            folder = folder_for_image(img)
            if folder and folder in new_map:
                new_map[folder].append(obj)
            else:
                # if folder unknown, keep in original category
                new_map[c].append(obj)
    return new_map


def render_array(objs, indent='    '):
    if not objs:
        return '[]'
    parts = []
    for o in objs:
        parts.append(indent + o + ',')
    # remove trailing comma from last
    parts[-1] = parts[-1].rstrip(',')
    return '[\n' + '\n'.join(parts) + '\n]'


def apply_fixes():
    text = read_text(CATEGORIES_PATH)
    cat_objs, spans = parse_category_objects(text)
    new_map = build_new_categories_map(cat_objs)

    # reconstruct the file by replacing each old array block with the new rendered one
    new_text = text
    # to avoid shifting indices, process spans in reverse order by start index
    # build replacement mapping from category name to rendered array
    replacements = {}
    for name, objs in new_map.items():
        replacements[name] = render_array(objs, indent='    ')

    # perform replacements using regex to find the array start for each category
    def repl_func(match):
        name = match.group(1) or match.group(2)
        arr = replacements.get(name)
        if arr is None:
            return match.group(0) + '['  # shouldn't happen
        return match.group(0) + '\n' + arr

    cat_pattern = re.compile(r'(^\s*(?:"([^\"]+)"|([A-Za-z0-9_\-]+))\s*:\s*)\[', re.MULTILINE)
    new_text = cat_pattern.sub(repl_func, new_text)

    # backup original
    bak = CATEGORIES_PATH + '.bak'
    shutil.copyfile(CATEGORIES_PATH, bak)
    with open(CATEGORIES_PATH, 'w', encoding='utf-8') as fh:
        fh.write(new_text)
    print('Wrote fixed', CATEGORIES_PATH, 'backup at', bak)


if __name__ == '__main__':
    apply_fixes()
    # run comparison afterwards
    print('Running compare script...')
    try:
        exec(open(os.path.join(ROOT, 'compare_categories_images.py')).read(), globals())
    except Exception as e:
        print('Compare script failed:', e)
