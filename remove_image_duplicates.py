from pathlib import Path
import re
root=Path(r'c:/Users/User/Giannis-main')
catf=root/'categories.js'
text=catf.read_text(encoding='utf-8')
pattern=re.compile(r'"image"\s*:\s*"([^"]+)"')
seen=set()
removals=[]
for m in pattern.finditer(text):
    img=m.group(1)
    if img in seen:
        # find object start (previous '\n    {')
        start = text.rfind('\n    {', 0, m.start())
        if start==-1:
            start = text.rfind('{', 0, m.start())
        # find object end: try '\n    },' first
        end = text.find('\n    },', m.end())
        if end!=-1:
            end = end + len('\n    },')
        else:
            end = text.find('\n    }', m.end())
            if end!=-1:
                end = end + len('\n    }')
                # consume following comma if exists
                if end < len(text) and text[end]==',':
                    end += 1
        if start!=-1 and end!=-1 and end>start:
            removals.append((start,end))
    else:
        seen.add(img)
# merge removals in reverse order and apply
if removals:
    # sort descending
    removals.sort(reverse=True)
    for s,e in removals:
        # trim any extra commas/newlines around
        # remove the slice
        text = text[:s] + text[e:]
    catf.write_text(text, encoding='utf-8')
    print('REMOVED', len(removals), 'duplicate items')
else:
    print('NO_DUPLICATES_FOUND')
