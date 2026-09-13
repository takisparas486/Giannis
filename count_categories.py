import re
from collections import OrderedDict

def count_categories(path='categories.js'):
    text = open(path, encoding='utf-8').read()
    cat_pattern = re.compile(r'^\s*(?:"([^\"]+)"|([A-Za-z0-9_\-]+))\s*:\s*\[', re.MULTILINE)
    res = OrderedDict()
    for m in cat_pattern.finditer(text):
        name = m.group(1) or m.group(2)
        start = m.end()
        # bracket matching to find end of this array
        i = start
        depth = 1
        while i < len(text) and depth>0:
            ch = text[i]
            if ch == '[':
                depth += 1
            elif ch == ']':
                depth -= 1
            i += 1
        block = text[start:i]
        # count occurrences of image key (handles both "image": and image:)
        count = len(re.findall(r'["\']?image["\']?\s*:', block))
        res[name] = count
    return res

if __name__ == '__main__':
    counts = count_categories()
    total = 0
    for k,v in counts.items():
        print("%s: %d" % (k, v))
        total += v
    print('\nTOTAL_CATEGORIES: %d' % len(counts))
    print('TOTAL_IMAGES_IN_CATEGORIES: %d' % total)
