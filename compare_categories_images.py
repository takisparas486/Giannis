import os
import re
from collections import OrderedDict

ROOT = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
CATEGORIES_FILE = os.path.join(ROOT, 'categories.js')
IMAGES_DIR = os.path.join(ROOT, 'images')


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


def parse_categories(path=CATEGORIES_FILE):
    text = open(path, encoding='utf-8').read()
    # capture quoted or unquoted keys
    cat_pattern = re.compile(r'^\s*(?:"([^\"]+)"|([A-Za-z0-9_\-]+))\s*:\s*\[', re.MULTILINE)
    res = OrderedDict()
    for m in cat_pattern.finditer(text):
        name = m.group(1) or m.group(2)
        # find position of '[' starting from match end
        bracket_pos = text.find('[', m.end()-1)
        if bracket_pos == -1:
            continue
        block = find_array_block(text, bracket_pos)
        # extract image values within this block
        images = re.findall(r'image\s*:\s*["\']([^"\']+)["\']', block)
        # fallback: sometimes key is "image":
        if not images:
            images = re.findall(r'\"image\"\s*:\s*\"([^\"]+)\"', block)
        res[name] = list(images)
    return res


def fs_counts(images_root=IMAGES_DIR):
    res = {}
    if not os.path.isdir(images_root):
        return res
    for name in sorted(os.listdir(images_root)):
        p = os.path.join(images_root, name)
        if os.path.isdir(p):
            files = [f for f in os.listdir(p) if os.path.isfile(os.path.join(p, f))]
            res[name] = files
    return res


if __name__ == '__main__':
    cats = parse_categories()
    fs = fs_counts()

    total_cat_refs = 0
    total_fs = 0
    mismatches = []

    print('category,refs_in_categories,unique_refs,files_in_fs,only_in_fs,only_in_categories')
    for c, imgs in cats.items():
        refs = imgs
        unique_refs = sorted(set(refs))
        refs_count = len(refs)
        unique_count = len(unique_refs)
        fs_files = fs.get(c, [])
        fs_count = len(fs_files)
        total_cat_refs += refs_count
        total_fs += fs_count
        # normalize filenames for comparison
        fs_set = set(['images/%s/%s' % (c, f) for f in fs_files])
        ref_set = set(unique_refs)
        only_in_fs = sorted(list(fs_set - ref_set))
        only_in_categories = sorted(list(ref_set - fs_set))
        if only_in_fs or only_in_categories:
            mismatches.append((c, refs_count, unique_count, fs_count, only_in_fs, only_in_categories))
        print('{}, {}, {}, {}, {}, {}'.format(c, refs_count, unique_count, fs_count, len(only_in_fs), len(only_in_categories)))

    print('\nTOTAL_CATEGORY_REFERENCES:', total_cat_refs)
    print('TOTAL_FILES_IN_IMAGE_DIRS:', total_fs)
    print('\nMISMATCHED CATEGORIES: %d' % len(mismatches))
    for c, refs_count, unique_count, fs_count, only_in_fs, only_in_categories in mismatches:
        print('\n--', c)
        if only_in_fs:
            print(' + files only in fs (%d):' % len(only_in_fs))
            for f in only_in_fs[:20]:
                print('   ', f)
        if only_in_categories:
            print(' - refs only in categories (%d):' % len(only_in_categories))
            for f in only_in_categories[:20]:
                print('   ', f)
    
    # write CSV for external inspection
    out_csv = os.path.join(ROOT, 'category_image_counts.csv')
    with open(out_csv, 'w', encoding='utf-8') as fh:
        fh.write('category,refs_in_categories,unique_refs,files_in_fs,only_in_fs,only_in_categories\n')
        for c, imgs in cats.items():
            refs_count = len(imgs)
            unique_count = len(set(imgs))
            fs_count = len(fs.get(c, []))
            fs_set = set(['images/%s/%s' % (c, f) for f in fs.get(c, [])])
            ref_set = set(imgs)
            only_in_fs = len(fs_set - ref_set)
            only_in_categories = len(ref_set - fs_set)
            fh.write('"%s",%d,%d,%d,%d,%d\n' % (c, refs_count, unique_count, fs_count, only_in_fs, only_in_categories))
    print('\nWrote', out_csv)
