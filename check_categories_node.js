const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, 'categories.js'), 'utf8');
const cats = ['pokemon', 'football-players'];
for (const cat of cats) {
  const re = new RegExp(`${cat}\\s*:\\s*\\[(.*?)(?=\\n\\s*\\w+\\s*:\\s*\\[|\\n\\s*\\}|\\Z)`, 's');
  const m = text.match(re);
  if (!m) {
    console.log('CATEGORY', cat, 'NOT FOUND');
    continue;
  }
  const body = m[1];
  const items = body.split(/\},\s*\n\s*\{/);
  const errors = [];
  items.forEach((item, index) => {
    item = item.trim();
    if (!item) return;
    if (!item.startsWith('{')) item = '{' + item;
    if (!item.endsWith('}')) item = item + '}';
    const imgMatch = item.match(/image\s*:\s*"([^"]+)"/);
    const ansMatch = item.match(/answers\s*:\s*\[([^\]]*)\]/);
    if (!imgMatch || !ansMatch) {
      errors.push([index + 1, 'missing image or answers']);
      return;
    }
    const imgfile = imgMatch[1].split('/').pop().toLowerCase();
    const answer0 = ansMatch[1]
      .split(',')[0]
      .trim()
      .replace(/^['\"]|['\"]$/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const base = imgfile.replace(/\.[^/.]+$/, '');
    if (answer0 !== base && !base.includes(answer0) && !answer0.includes(base)) {
      errors.push([index + 1, base, answer0, imgfile, ansMatch[1].split(',').slice(0, 3).map(s => s.trim())]);
    }
  });
  console.log('CATEGORY', cat, 'items', items.length, 'errors', errors.length);
  errors.slice(0, 20).forEach(e => console.log(' ', e));
}
