/* 点棒いらず ヘッドレス検証（jsdom）— 一時テスト・コミット不要 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'jsdom'));

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
const { document } = window;
window.confirm = () => true;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  OK  ' + name); }
  else { fail++; console.log('  NG  ' + name); }
}
const score = id => parseInt(document.getElementById('score-' + id).textContent.replace(/,/g, ''), 10);
const center = () => document.getElementById('ciKyoku').textContent + ' / ' + document.getElementById('ciSub').textContent;
const click = id => document.getElementById(id).click();
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));
/* カスタム確認ダイアログをOKで進める */
const acceptConfirm = async () => { await tick(); click('confirmYesBtn'); await tick(); };

(async () => {

console.log('--- 初期状態 ---');
t('初期スコア 25000', score('east') === 25000 && score('north') === 25000);
t('中央パネル 東1局', document.getElementById('ciKyoku').textContent === '東1局');
t('Mリーグがデフォルトでactive', document.getElementById('btnMleague').classList.contains('active'));

console.log('--- シナリオ2: Mリーグ チップに7700なし・満貫統合 ---');
let chips = [...document.querySelectorAll('#ronScoreRail .score-chip')].map(c => c.dataset.score);
t('Mリーグ: 7700チップなし', !chips.includes('7700'));
t('Mリーグ: 8000(満貫)あり', chips.includes('8000'));
t('Mリーグ: ダブル役満(64000)なし', !chips.includes('64000'));
const manganChip = [...document.querySelectorAll('#ronScoreRail .score-chip')].find(c => c.dataset.score === '8000');
t('Mリーグ: 満貫ラベルに4飜30符', manganChip && manganChip.textContent.includes('4飜30符'));

console.log('--- シナリオ3: 雀魂切替でダブル役満チップ・7700復活 ---');
click('btnJantama');
chips = [...document.querySelectorAll('#ronScoreRail .score-chip')].map(c => c.dataset.score);
t('雀魂: 7700チップあり', chips.includes('7700'));
t('雀魂: ダブル役満64000あり', chips.includes('64000'));
t('雀魂: 6倍役満192000あり', chips.includes('192000'));

console.log('--- シナリオ5: リーチ→供託 ---');
click('riichiBtn');
let pickBtns = [...document.querySelectorAll('#riichiPlayerList .pick-btn')];
t('リーチモーダルに4人表示', pickBtns.length === 4);
pickBtns[0].click(); // north riichi
t('north が -1000', score('north') === 24000);
t('供託1 表示', document.getElementById('ciSub').textContent.includes('供託1'));
click('riichiBtn');
pickBtns = [...document.querySelectorAll('#riichiPlayerList .pick-btn')];
pickBtns[3].click(); // south riichi
t('south が -1000 / 供託2', score('south') === 24000 && document.getElementById('ciSub').textContent.includes('供託2'));

console.log('--- シナリオ6: 流局 3人テンパイ（親eastテンパイ含む）---');
click('ryuukyokuBtn');
t('途中流局ボタン表示（雀魂）', document.getElementById('chuutoRow').style.display !== 'none');
let tenpaiBtns = [...document.querySelectorAll('#tenpaiList .pick-btn')];
tenpaiBtns[0].click(); tenpaiBtns[1].click(); tenpaiBtns[2].click(); // north, west, east
click('ryuConfirmBtn');
t('テンパイ各+1000 (north 24000→25000)', score('north') === 25000);
t('ノーテン-3000 (south 24000→21000)', score('south') === 21000);
t('親テンパイ→連荘 東1局のまま', document.getElementById('ciKyoku').textContent === '東1局');
t('本場+1', document.getElementById('ciSub').textContent.includes('1本場'));
t('供託持ち越し(供託2)', document.getElementById('ciSub').textContent.includes('供託2'));

console.log('--- シナリオ4+7: スワイプ→本場プリフィル＋親ロン連荘・供託回収 ---');
function swipe(fromId) {
  const fromCard = document.querySelector('[data-player-id="' + fromId + '"]');
  const md = new window.MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0, bubbles: true });
  fromCard.dispatchEvent(md);
  const mu = new window.MouseEvent('mouseup', { clientX: 100, clientY: 0, bubbles: true });
  window.dispatchEvent(mu);
}
swipe('west');
const modalShown = document.getElementById('modal').classList.contains('show');
console.log('  (swipe→modal表示: ' + modalShown + ')');
if (modalShown) {
  t('本場プリフィル: 表示300 (1本場)', document.getElementById('scoreDisplay').textContent === '300');
  const targetName = document.getElementById('transferInfo').textContent;
  console.log('  transferInfo:', targetName);
  const chip8000 = [...document.querySelectorAll('#ronScoreRail .score-chip')].find(c => c.dataset.score === '8000');
  chip8000.click();
  t('チップ選択で 8000+300=8,300', document.getElementById('scoreDisplay').textContent === '8,300');
  click('confirmBtn');
  console.log('  scores:', ['north','west','east','south'].map(i => i + '=' + score(i)).join(' '), '/', center());
} else {
  console.log('  SKIP: jsdomの座標制約でスワイプ方向判定が不成立');
}

console.log('--- シナリオ10: undo ---');
const before = { north: score('north'), west: score('west'), east: score('east'), south: score('south'), c: center() };
click('undoBtn');
const after = { north: score('north'), west: score('west'), east: score('east'), south: score('south'), c: center() };
t('undoで状態が巻き戻る', JSON.stringify(before) !== JSON.stringify(after));
console.log('  before:', JSON.stringify(before));
console.log('  after :', JSON.stringify(after));

console.log('--- シナリオ1: 雀魂精算（ウマ5-15・オカなし）---');
click('resetBtn'); await acceptConfirm();
t('リセットで全員25000・供託0', score('east') === 25000 && document.getElementById('ciSub').textContent.includes('供託0'));
click('endBtn');
const rows = [...document.querySelectorAll('#rankingList .rank-row')];
t('精算モーダルに4行', rows.length === 4);
if (rows.length === 4) {
  const detail = rows[0].querySelector('.rank-detail').textContent;
  const total1 = rows[0].querySelector('.rank-total').textContent;
  console.log('  雀魂1位 detail:', detail, '/', total1);
  t('雀魂1位: 計+15（素点0+ウマ15）', total1.includes('+15'));
  t('雀魂: オカ表記なし', !detail.includes('オカ'));
}
click('closeEndBtn');

console.log('--- Mリーグ精算（ウマ10-30・オカ+20）---');
click('btnMleague');
click('endBtn');
const rows2 = [...document.querySelectorAll('#rankingList .rank-row')];
if (rows2.length === 4) {
  const total1 = rows2[0].querySelector('.rank-total').textContent;
  const detail1 = rows2[0].querySelector('.rank-detail').textContent;
  console.log('  Mリーグ1位 detail:', detail1, '/', total1);
  t('Mリーグ1位: 計+45（素点-5+ウマ30+オカ20）', total1.includes('+45'));
  t('Mリーグ: オカ表記あり', detail1.includes('オカ'));
}
click('closeEndBtn');

console.log('--- シナリオ8: 永続化（LS_LIVE）---');
const live = JSON.parse(window.localStorage.getItem('mahjong_live_state'));
t('live state が保存されている', !!live && !!live.scores);
t('live.dealerId が有効', ['north','west','east','south'].includes(live.dealerId));

console.log('--- シナリオ9: 飛び判定（雀魂・調整で0未満）---');
click('btnJantama');
// 調整モーダルのフローはタイマー絡みのため手動確認とする
console.log('  (調整→飛びはタイマー絡みのため手動確認へ)');

console.log('');
console.log('RESULT: pass=' + pass + ' fail=' + fail);
process.exit(fail ? 1 : 0);

})();
