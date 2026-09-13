from pathlib import Path
import re, json
root=Path(r'c:/Users/User/Giannis-main')
text=(root/'categories.js').read_text(encoding='utf-8', errors='ignore')
# naive parse: split by top-level categories using regex to find 'name: [' occurrences
cat_pattern=re.compile(r"^\s*([a-z0-9-]+)\s*:\s*\[", re.I|re.M)
cats=[]
for m in cat_pattern.finditer(text):
    cats.append((m.group(1), m.start()))
cats_positions=[]
for i,(name,pos) in enumerate(cats):
    start=pos
    end = cats[i+1][1] if i+1<len(cats) else len(text)
    cats_positions.append((name, text[start:end]))
# extract items in each category
image_to_refs={}
per_cat_image_dups={}
per_cat_answer_dups={}
for name,block in cats_positions:
    imgs=[]
    answers_map={}
    # find all image paths
    imgs_found=re.findall(r'"image"\s*:\s*"([^"]+)"', block)
    for idx,img in enumerate(imgs_found):
        image_to_refs.setdefault(img,[]).append((name, idx))
        imgs.append(img)
    # per-category image duplicates
    seen=set()
    dups=[]
    for img in imgs:
        if img in seen:
            dups.append(img)
        else:
            seen.add(img)
    if dups:
        per_cat_image_dups[name]=dups
    # answers
    answers_found=re.findall(r'"answers"\s*:\s*\[([^\]]+)\]', block)
    # answers_found is list of inner arrays as strings; split and normalize
    ans_list=[]
    for a in answers_found:
        # split by comma respecting quotes
        parts=re.findall(r'"([^"]+)"', a)
        if parts:
            # take first answer as canonical label
            canonical=parts[0].strip().lower()
            ans_list.append(canonical)
    # detect duplicates in answers
    seen_ans={}
    ans_dups=[]
    for ans in ans_list:
        if ans in seen_ans:
            ans_dups.append(ans)
        else:
            seen_ans[ans]=1
    if ans_dups:
        per_cat_answer_dups[name]=ans_dups
# global duplicate images
dup_images={k:v for k,v in image_to_refs.items() if len(v)>1}
# write report
out=[]
out.append('TOTAL_CATEGORIES %d' % len(cats_positions))
out.append('TOTAL_IMAGE_REFERENCES %d' % sum(len(re.findall(r'"image"\s*:\s*"([^"]+)"', block)) for _,block in cats_positions))
out.append('TOTAL_UNIQUE_IMAGES %d' % len(image_to_refs))
out.append('\nDUPLICATE_IMAGES_ACROSS_CATEGORIES: %d' % len(dup_images))
for img,refs in dup_images.items():
    out.append(img + ' -> ' + ', '.join('%s[%d]'%(c,i) for c,i in refs[:10]))
out.append('\nPER_CATEGORY_IMAGE_DUPLICATES: %d' % len(per_cat_image_dups))
for c,dups in per_cat_image_dups.items():
    out.append(c + ' -> ' + ', '.join(dups))
out.append('\nPER_CATEGORY_ANSWER_DUPLICATES: %d' % len(per_cat_answer_dups))
for c,dups in per_cat_answer_dups.items():
    out.append(c + ' -> ' + ', '.join(dups))
# write file
outfile=root/'duplicates_report.txt'
outfile.write_text('\n'.join(out), encoding='utf-8')
print('WROTE', outfile)
