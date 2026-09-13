from pathlib import Path
import re
root=Path(r'c:/Users/User/Giannis-main')
unref_file=root/'unreferenced_images.txt'
if not unref_file.exists():
    print('unreferenced_images.txt not found')
    raise SystemExit(1)
unrefs=[l.strip() for l in unref_file.read_text(encoding='utf-8').splitlines() if l.strip()]
# group by category folder
groups={}
for p in unrefs:
    parts=p.split('/')
    if len(parts)>=2:
        cat=parts[1]
    else:
        cat='misc'
    groups.setdefault(cat,[]).append(p)
# load categories.js
catf=root/'categories.js'
text=catf.read_text(encoding='utf-8', errors='ignore')
for cat,paths in groups.items():
    # prepare entries text
    entries=[]
    for p in paths:
        name=Path(p).stem
        human=name.replace('-', ' ').replace('_',' ')
        human = re.sub(r'\bimg_?\d+\b','', human, flags=re.IGNORECASE).strip()
        if not human:
            human=name
        answers_list='["%s"]' % human.replace('"','\"')
        entry='    {\n        "answers": %s,\n        "image": "%s",\n        "difficulty": "medium"\n    },\n' % (answers_list, p)
        entries.append(entry)
    block=''.join(entries)
    # find category array
    m=re.search(r'(^\s*%s\s*:\s*\[)' % re.escape(cat), text, flags=re.MULTILINE)
    if m:
        start=m.end()
        # find the closing '],' after start
        idx=text.find('\n],', start)
        if idx==-1:
            idx=text.find('\n]', start)
        if idx==-1:
            # fallback: append at end
            text = text.rstrip() + '\n\n%s: [\n' % cat + block + '],\n'
        else:
            # insert before idx
            insert_at=idx
            text = text[:insert_at] + '\n' + block + text[insert_at:]
    else:
        # category missing: append before final closing '};'
        m2=re.search(r'\n\s*\}\s*;\s*$', text)
        if m2:
            insert_at=m2.start()
            newcat='\n%s: [\n%s],\n' % (cat, block)
            text = text[:insert_at] + newcat + text[insert_at:]
        else:
            text = text + '\n%s: [\n%s],\n' % (cat, block)
# write back
catf.write_text(text, encoding='utf-8')
print('WROTE', catf)
