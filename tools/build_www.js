/* Web資産を www/ に集約（Capacitor webDir）。node tools/build_www.js
 * 単一ソース(index.html等)からネイティブ同梱用の配布フォルダを生成する。
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const FILES = ['index.html', 'sw.js', 'manifest.json'];
const DIRS  = ['icons'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name), d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });
for (const f of FILES) fs.copyFileSync(path.join(ROOT, f), path.join(WWW, f));
for (const dir of DIRS) {
  const src = path.join(ROOT, dir);
  if (fs.existsSync(src)) copyDir(src, path.join(WWW, dir));
}
console.log('www/ を生成しました:', [...FILES, ...DIRS.map(d => d + '/')].join(', '));
