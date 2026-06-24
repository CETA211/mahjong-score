/* 点棒いらず ヘッドレス検証 その7: 同点タイブレーク・東風/半荘・メンバープリセット */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'jsdom'));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
function t(name, cond) { if (cond) { pass++; console.log('  OK  ' + name); } else { fail++; console.log('  NG  ' + name); } }
function boot(seed) {
  return new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
    beforeParse(window) { window.confirm = () => false; if (seed) for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v); },
  }).window;
}
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));

(async () => {

console.log('--- 同点タイブレーク（起家=東家に近い席順が上位）---');
// east と west が同点(30000)。east(起家)が上位、west が下位になるべき。south/north で合計100000に調整
let w = boot({
  mahjong_tutorial_shown: '1',
  mahjong_live_state: JSON.stringify({ scores: { east: 30000, west: 30000, south: 25000, north: 15000 }, dealerId: 'east', kyoku: 7, honbaGame: 0, kyotaku: 0 }),
});
let d = w.document;
d.getElementById('endBtn').click();
await tick();
let rows = [...d.querySelectorAll('#rankingList .rank-row')];
const names = rows.map(r => r.querySelector('.rank-pname').textContent);
console.log('  順位:', names.join(' > '));
// east=プレイヤー1, south=プレイヤー2, west=プレイヤー3, north=プレイヤー4（席順 east<south<west<north）
t('同点: east(プレイヤー1)が west(プレイヤー3)より上位', names.indexOf('プレイヤー1') < names.indexOf('プレイヤー3'));
t('1位は east(プレイヤー1)', names[0] === 'プレイヤー1');
t('2位は west(プレイヤー3)（同点だが席順下）', names[1] === 'プレイヤー3');

console.log('--- 東風戦: 東4(kyoku=4)で精算提案 ---');
w = boot({ mahjong_tutorial_shown: '1', mahjong_game_length: 'tonpu' });
d = w.document;
t('東風セグがactive', d.querySelector('.set-seg-btn[data-length="tonpu"]').classList.contains('active'));
t('半荘セグはoff', !d.querySelector('.set-seg-btn[data-length="hanchan"]').classList.contains('active'));
// 東4(kyoku=3)で親(east以外?) 実際は kyoku進行を直接いじれないので関数挙動を間接確認:
// 半荘ならkyoku=4で精算提案しないが東風ならする → confirmが呼ばれるか。confirmはfalse固定なので結果は出ないが呼び出しを検出
let confirmCalled = false;
w.confirm = () => { confirmCalled = true; return false; };
// appConfirm はカスタムダイアログなので confirmModal の表示で検出する。
// kyoku を東4終了相当(4)にしてから ryuukyoku で advance→kyoku=4, checkEndSuggest
// 直接 live_state で kyoku=3(東4) にし、親ノーテン流局で kyoku=4へ
w = boot({ mahjong_tutorial_shown: '1', mahjong_game_length: 'tonpu',
  mahjong_live_state: JSON.stringify({ scores: { east:25000, south:25000, west:25000, north:25000 }, dealerId:'north', kyoku: 3, honbaGame:0, kyotaku:0 }) });
d = w.document;
d.getElementById('ryuukyokuBtn').click(); // 全員ノーテンで確定→親流れ kyoku=4
d.getElementById('ryuConfirmBtn').click();
await tick(600);
t('東風戦: 東4終了で精算確認ダイアログ', d.getElementById('confirmModal').classList.contains('show'));
d.getElementById('confirmNoBtn').click();

console.log('--- 半荘戦: 東4(kyoku=4)では精算提案しない ---');
w = boot({ mahjong_tutorial_shown: '1', mahjong_game_length: 'hanchan',
  mahjong_live_state: JSON.stringify({ scores: { east:25000, south:25000, west:25000, north:25000 }, dealerId:'north', kyoku: 3, honbaGame:0, kyotaku:0 }) });
d = w.document;
d.getElementById('ryuukyokuBtn').click();
d.getElementById('ryuConfirmBtn').click();
await tick(600);
t('半荘戦: 東4終了では精算提案なし', !d.getElementById('confirmModal').classList.contains('show'));

console.log('--- メンバープリセット: 保存・呼出・削除 ---');
w = boot({ mahjong_tutorial_shown: '1' });
d = w.document;
// 名前を変更
d.getElementById('name-east').value = 'たろう';
d.getElementById('name-south').value = 'じろう';
d.getElementById('name-west').value = 'さぶろう';
d.getElementById('name-north').value = 'しろう';
d.getElementById('settingsBtn').click(); await tick();
d.getElementById('presetSaveBtn').click(); await tick();
let presets = JSON.parse(w.localStorage.getItem('mahjong_member_presets'));
t('プリセットが保存される', Array.isArray(presets) && presets.length === 1);
t('保存内容が正しい（east=たろう）', presets[0].east === 'たろう');
t('プリセット一覧に1件表示', d.querySelectorAll('#presetList .preset-item').length === 1);
// 重複保存は拒否
d.getElementById('presetSaveBtn').click(); await tick();
t('同じメンバーは重複保存されない', JSON.parse(w.localStorage.getItem('mahjong_member_presets')).length === 1);
// 名前を変えてから呼び出し→元に戻る
d.getElementById('name-east').value = 'XXX';
d.querySelector('#presetList .pi-names').click(); await tick();
t('呼び出しで名前が復元（east=たろう）', d.getElementById('name-east').value === 'たろう');
t('呼び出しでLS_NAMESも更新', JSON.parse(w.localStorage.getItem('mahjong_player_names')).east === 'たろう');
// 削除
d.querySelector('#presetList .pi-del').click(); await tick();
t('削除でプリセットが空に', JSON.parse(w.localStorage.getItem('mahjong_member_presets')).length === 0);
t('一覧が空表示に', !!d.querySelector('#presetList .preset-empty'));

console.log('--- サイコロ（3Dキューブ）---');
w = boot({ mahjong_tutorial_shown: '1' });
d = w.document;
d.getElementById('diceBtn').click();
t('サイコロモーダルが開く', d.getElementById('diceModal').classList.contains('show'));
const die1 = d.getElementById('die1');
const cube1 = die1.querySelector('.cube');
t('die1 に3Dキューブが構築される', !!cube1);
t('キューブは6面', die1.querySelectorAll('.face').length === 6);
t('f1面は1ピップ', die1.querySelectorAll('.face.f1 .pip').length === 1);
t('f6面は6ピップ', die1.querySelectorAll('.face.f6 .pip').length === 6);
t('全面のピップ合計21（1+2+..+6）', die1.querySelectorAll('.pip').length === 21);
await tick(1300); // 回転完了待ち（DICE_MS=1150）
const transform = die1.querySelector('.cube').style.transform;
t('回転transformが適用される', /rotateX/.test(transform) && /rotateY/.test(transform));
const sumTxt = d.getElementById('diceSum').textContent;
const shown = parseInt((sumTxt.match(/(\d+)/) || [])[1], 10);
t('合計表示が2〜12', shown >= 2 && shown <= 12);
// 振り直し
const beforeT = die1.querySelector('.cube').style.transform;
d.getElementById('diceRollBtn').click();
await tick(1300);
t('振り直しでtransformが変化', die1.querySelector('.cube').style.transform !== beforeT);
d.getElementById('diceCloseBtn').click();
t('閉じるで非表示', !d.getElementById('diceModal').classList.contains('show'));

console.log('--- 長押し点差表示 ---');
w = boot({ mahjong_tutorial_shown: '1',
  mahjong_live_state: JSON.stringify({ scores: { east: 30000, south: 25000, west: 20000, north: 25000 }, dealerId: 'east', kyoku: 0, honbaGame: 0, kyotaku: 0 }) });
d = w.document;
const eastCard = d.querySelector('[data-player-id="east"]');
eastCard.dispatchEvent(new w.MouseEvent('mousedown', { button: 0, bubbles: true }));
await tick(470); // LP_DELAY=400 を超えて長押し成立
const lpDiffs = [...d.querySelectorAll('.lp-diff')];
t('長押しで4カードに点差バッジ', lpDiffs.length === 4);
const eastDiff = d.querySelector('[data-player-id="east"] .lp-diff');
t('基準カードは「基準」', eastDiff && eastDiff.textContent === '基準' && eastDiff.classList.contains('base'));
const westDiff = d.querySelector('[data-player-id="west"] .lp-diff');
t('西(20000)との差は+10,000', westDiff && westDiff.textContent === '+10,000' && westDiff.classList.contains('plus'));
const southDiff = d.querySelector('[data-player-id="south"] .lp-diff');
t('南(25000)との差は+5,000', southDiff && southDiff.textContent === '+5,000');
// 離すと消える
w.dispatchEvent(new w.MouseEvent('mouseup', { bubbles: true }));
await tick(50);
t('離すと点差バッジが消える', d.querySelectorAll('.lp-diff').length === 0);

console.log('--- 横画面用 立直/流局ボタン ---');
t('landRiichiBtn が存在', !!d.getElementById('landRiichiBtn'));
t('landRyuuBtn が存在', !!d.getElementById('landRyuuBtn'));
d.getElementById('landRiichiBtn').click();
await tick();
t('横用立直ボタンでリーチモーダルが開く', d.getElementById('riichiModal').classList.contains('show'));
d.getElementById('riichiCancelBtn').click();
d.getElementById('landRyuuBtn').click();
await tick();
t('横用流局ボタンで流局モーダルが開く', d.getElementById('ryuukyokuModal').classList.contains('show'));

console.log('');
console.log('RESULT: pass=' + pass + ' fail=' + fail);
process.exit(fail ? 1 : 0);

})();
