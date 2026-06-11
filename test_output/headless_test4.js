/* 点棒いらず ヘッドレス検証 その4: ⑦改善（名前永続化・リーチバッジ・順位/点差・float・カスタムconfirm） */
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
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));

(async () => {

console.log('--- 名前の永続化 ---');
let w = boot({ mahjong_tutorial_shown: '1' });
let d = w.document;
const nameInput = d.getElementById('name-east');
nameInput.value = 'しょうた';
nameInput.dispatchEvent(new w.Event('input', { bubbles: true }));
t('入力でLS_NAMESに保存', JSON.parse(w.localStorage.getItem('mahjong_player_names')).east === 'しょうた');
// 再起動で復元
let w2 = boot({ mahjong_tutorial_shown: '1', mahjong_player_names: JSON.stringify({ east: 'しょうた', north: '' }) });
t('再起動で名前復元', w2.document.getElementById('name-east').value === 'しょうた');
t('空文字はデフォルトのまま', w2.document.getElementById('name-north').value === 'プレイヤー4');

console.log('--- 順位バッジ / TOP点差 ---');
w = boot({
  mahjong_tutorial_shown: '1',
  mahjong_live_state: JSON.stringify({
    scores: { north: 31000, west: 12000, east: 40000, south: 17000 },
    dealerId: 'east', kyoku: 0, honbaGame: 0, kyotaku: 0,
  }),
});
d = w.document;
t('east(40000)が1位バッジ', d.getElementById('rank-east').textContent === '1' && d.getElementById('rank-east').className.includes('rank-1'));
t('west(12000)が4位バッジ', d.getElementById('rank-west').textContent === '4');
t('1位の点差表示はTOP', d.getElementById('diff-east').textContent === 'TOP');
t('north点差 −9,000', d.getElementById('diff-north').textContent === '−9,000');

console.log('--- リーチバッジ：宣言→表示、和了→解除 ---');
w = boot({ mahjong_tutorial_shown: '1' });
d = w.document;
d.getElementById('riichiBtn').click();
[...d.querySelectorAll('#riichiPlayerList .pick-btn')][0].click(); // north
t('northカードにriichiクラス', d.querySelector('[data-player-id="north"]').classList.contains('riichi'));
t('live stateにriichiIds保存', JSON.parse(w.localStorage.getItem('mahjong_live_state')).riichiIds.includes('north'));
// 二重リーチ防止
d.getElementById('riichiBtn').click();
[...d.querySelectorAll('#riichiPlayerList .pick-btn')][0].click();
t('二重リーチは拒否（供託1のまま）', d.getElementById('ciSub').textContent.includes('供託1'));
d.getElementById('riichiCancelBtn').click();
// 流局で解除
d.getElementById('ryuukyokuBtn').click();
[...d.querySelectorAll('#tenpaiList .pick-btn')][0].click();
d.getElementById('ryuConfirmBtn').click();
t('流局でリーチバッジ解除', !d.querySelector('.player-card.riichi'));

console.log('--- リーチ undo でバッジ復活/解除 ---');
d.getElementById('undoBtn').click(); // 流局を取り消し → リーチ中に戻る
t('undoでリーチバッジ復活', d.querySelector('[data-player-id="north"]').classList.contains('riichi'));
d.getElementById('undoBtn').click(); // リーチ自体を取り消し
t('さらにundoでバッジ解除', !d.querySelector('.player-card.riichi'));

console.log('--- リロードでリーチバッジ復元 ---');
w2 = boot({
  mahjong_tutorial_shown: '1',
  mahjong_live_state: JSON.stringify({
    scores: { north: 24000, west: 25000, east: 25000, south: 25000 },
    dealerId: 'east', kyoku: 0, honbaGame: 0, kyotaku: 1, riichiIds: ['north'],
  }),
});
t('リロード後もバッジ表示', w2.document.querySelector('[data-player-id="north"]').classList.contains('riichi'));

console.log('--- カスタム確認ダイアログ ---');
w = boot({ mahjong_tutorial_shown: '1' });
d = w.document;
t('confirmモーダルが存在', !!d.getElementById('confirmModal'));
d.getElementById('resetBtn').click();
await tick();
t('リセットで確認ダイアログ表示', d.getElementById('confirmModal').classList.contains('show'));
t('OKボタン文言カスタム', d.getElementById('confirmYesBtn').textContent === 'リセット');
d.getElementById('confirmNoBtn').click();
await tick();
t('キャンセルで閉じる', !d.getElementById('confirmModal').classList.contains('show'));

console.log('--- フローティング点数表示 ---');
w = boot({ mahjong_tutorial_shown: '1' });
d = w.document;
await tick(); // init完了（suppressFloat解除）待ち
d.getElementById('riichiBtn').click();
[...d.querySelectorAll('#riichiPlayerList .pick-btn')][1].click(); // west riichi -1000
const f = d.querySelector('[data-player-id="west"] .score-float');
t('リーチで -1,000 がフロート表示', !!f && f.textContent.includes('1,000') && f.className.includes('minus'));

console.log('');
console.log('RESULT: pass=' + pass + ' fail=' + fail);
process.exit(fail ? 1 : 0);

})();
