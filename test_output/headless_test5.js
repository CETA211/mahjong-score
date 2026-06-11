/* 点棒いらず ヘッドレス検証 その5: 設定モーダル（順位/点差のON/OFF） */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'jsdom'));

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  OK  ' + name); }
  else { fail++; console.log('  NG  ' + name); }
}
function boot(seed) {
  return new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
    beforeParse(window) {
      if (seed) for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  }).window;
}

console.log('--- デフォルト: 順位・点差は非表示 ---');
let w = boot({ mahjong_tutorial_shown: '1' });
let d = w.document;
t('body に show-rank なし', !d.body.classList.contains('show-rank'));
t('body に show-diff なし', !d.body.classList.contains('show-diff'));
t('CSSで .card-rank はデフォルト display:none', /\.card-rank \{[^}]*display: none/.test(html));
t('CSSで .top-diff はデフォルト display:none', /\.top-diff \{[^}]*display: none/.test(html));

console.log('--- 設定モーダルでON ---');
d.getElementById('settingsBtn').click();
t('設定モーダルが開く', d.getElementById('settingsModal').classList.contains('show'));
d.getElementById('swRank').click();
t('順位バッジON → body.show-rank', d.body.classList.contains('show-rank'));
t('スイッチがON表示', d.getElementById('swRank').classList.contains('on'));
t('点差はOFFのまま', !d.body.classList.contains('show-diff'));
d.getElementById('swDiff').click();
t('点差ON → body.show-diff', d.body.classList.contains('show-diff'));
const saved = JSON.parse(w.localStorage.getItem('mahjong_settings'));
t('設定がLSに保存される', saved.showRank === true && saved.showDiff === true);
d.getElementById('settingsCloseBtn').click();
t('閉じるボタンで閉じる', !d.getElementById('settingsModal').classList.contains('show'));

console.log('--- 再起動で設定復元 ---');
const w2 = boot({ mahjong_tutorial_shown: '1', mahjong_settings: JSON.stringify({ showRank: true, showDiff: false }) });
t('showRank復元', w2.document.body.classList.contains('show-rank'));
t('showDiffはOFFのまま', !w2.document.body.classList.contains('show-diff'));
t('スイッチ状態も復元', w2.document.getElementById('swRank').classList.contains('on') && !w2.document.getElementById('swDiff').classList.contains('on'));

console.log('');
console.log('RESULT: pass=' + pass + ' fail=' + fail);
process.exit(fail ? 1 : 0);
