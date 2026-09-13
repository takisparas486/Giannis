const fs = require('fs');
const path = require('path');

const root = process.cwd();
const text = fs.readFileSync(path.join(root, 'categories.js'), 'utf8');
const refs = [...new Set(Array.from(text.matchAll(/"image"\s*:\s*"([^"]+)"/g), m => m[1]))].sort();

const actual = [];
function walk(dir) {
  for (const p of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, p.name);
    if (p.isDirectory()) walk(full);
    else if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(p.name)) {
      actual.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
}
walk(path.join(root, 'images'));

const missing = refs.filter(r => !fs.existsSync(path.join(root, r)));
const unref = actual.filter(p => !refs.includes(p));
const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const similar = [];
for (const r of missing) {
  const base = path.basename(r);
  const sameName = actual.find(a => path.basename(a) === base);
  if (!sameName) {
    const cands = actual.filter(a => norm(path.basename(a)) === norm(base));
    if (cands.length) similar.push([r, cands]);
  }
}

console.log('TOTAL_REFERENCED_UNIQUE', refs.length);
console.log('TOTAL_ACTUAL_FILES', actual.length);
console.log('MISSING_REFERENCES', missing.length);
console.log('UNREFERENCED_FILES', unref.length);
console.log('POSSIBLE_RENAMES_OR_MISPLACED', similar.length);
console.log('MISSING_REFERENCES_LIST');
for (const item of missing) console.log(item);
console.log('UNREFERENCED_FILES_LIST');
for (const item of unref) console.log(item);
console.log('SIMILAR_NAME_MATCHES');
for (const [ref, cands] of similar) console.log(ref, '->', cands.join(','));
