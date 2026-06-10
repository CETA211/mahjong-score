/* 点棒いらず ヘッドレス検証 その2: リロード復元・三麻・Mリーグ流局UI */
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
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/',
    beforeParse(window) {
      window.confirm = () => true;
      if (seed) for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  });
  return dom.window;
}

console.log('--- リロード復元（live state を事前注入）---');
let w = boot({
  mahjong_live_state: JSON.stringify({
    scores: { north: 31000, west: 12000, east: 40000, south: 17000 },
    dealerId: 'south', kyoku: 6, honbaGame: 3, kyotaku: 1,
  }),
});
let d = w.document;
const score = id => parseInt(d.getElementById('score-' + id).textContent.replace(/,/g, ''), 10);
t('スコア復元 north=31,000', score('north') === 31000);
t('スコア復元 east=40,000', score('east') === 40000);
t('局復元 南3局 (kyoku=6)', d.getElementById('ciKyoku').textContent === '南3局');
t('本場・供託復元 3本場・供託1', d.getElementById('ciSub').textContent === '3本場・供託1');
t('親復元 south', d.querySelector('[data-dealer-for="south"]').classList.contains('is-dealer'));

console.log('--- Mリーグ: 流局モーダルに途中流局なし ---');
w = boot({ mahjong_ruleset: 'mleague' });
d = w.document;
d.getElementById('ryuukyokuBtn').click();
t('Mリーグ: 途中流局ボタン非表示', d.getElementById('chuutoRow').style.display === 'none');

console.log('--- 雀魂: 親ノーテン流局 → 親流れ・本場+1 ---');
w = boot({ mahjong_ruleset: 'jantama' });
d = w.document;
d.getElementById('ryuukyokuBtn').click();
const btns = [...d.querySelectorAll('#tenpaiList .pick-btn')];
btns[0].click(); // north のみテンパイ（親east はノーテン）
d.getElementById('ryuConfirmBtn').click();
const sc = id => parseInt(d.getElementById('score-' + id).textContent.replace(/,/g, ''), 10);
t('テンパイ1人 +3000 (north 28000)', sc('north') === 28000);
t('ノーテン3人 各-1000 (east 24000)', sc('east') === 24000);
t('親ノーテン→東2局', d.getElementById('ciKyoku').textContent === '東2局');
t('本場+1', d.getElementById('ciSub').textContent.includes('1本場'));
t('親が south に移動', d.querySelector('[data-dealer-for="south"]').classList.contains('is-dealer'));

console.log('--- 三麻: 切替・進行・精算 ---');
w = boot({ mahjong_rule_mode: 'sanma', mahjong_ruleset: 'jantama' });
d = w.document;
const sc3 = id => parseInt(d.getElementById('score-' + id).textContent.replace(/,/g, ''), 10);
t('三麻初期 35,000', sc3('east') === 35000 && sc3('north') === 35000);
t('三麻 東1局', d.getElementById('ciKyoku').textContent === '東1局');
// 流局: 親(east)ノーテン・north テンパイ
d.getElementById('ryuukyokuBtn').click();
const btns3 = [...d.querySelectorAll('#tenpaiList .pick-btn')];
t('三麻 流局モーダルは3人', btns3.length === 3);
btns3[0].click(); // north
d.getElementById('ryuConfirmBtn').click();
t('三麻 テンパイ1人 +3000', sc3('north') === 38000);
t('三麻 ノーテン2人 各-1500', sc3('east') === 33500 && sc3('south') === 33500);
t('三麻 親流れ 東2局', d.getElementById('ciKyoku').textContent === '東2局');
// 精算（合計105000のはず）
d.getElementById('endBtn').click();
const rows = [...d.querySelectorAll('#rankingList .rank-row')];
t('三麻 精算3行', rows.length === 3);
if (rows.length === 3) {
  console.log('  三麻1位:', rows[0].querySelector('.rank-detail').textContent, '/', rows[0].querySelector('.rank-total').textContent);
  t('三麻1位 計+23（素点+3 ウマ+20）', rows[0].querySelector('.rank-total').textContent.includes('+23'));
}

console.log('--- 雀魂: チョンボ（子）の罰符分配 ---');
w = boot({ mahjong_ruleset: 'jantama' });
d = w.document;
// adjustPid を作るため openAdjustModal 経由が必要 → シングルタップはタイマー絡み。
// mousedown→mouseup（移動なし）でhandleTap → DTAP_MS+50後にopenAdjustModal
const sc4 = id => parseInt(d.getElementById('score-' + id).textContent.replace(/,/g, ''), 10);
const card = d.querySelector('[data-player-id="north"]'); // north は子（親=east）
card.dispatchEvent(new w.MouseEvent('mousedown', { button: 0, clientX: 0, clientY: 0, bubbles: true }));
w.dispatchEvent(new w.MouseEvent('mouseup', { clientX: 0, clientY: 0, bubbles: true }));
setTimeout(() => {
  const adjShown = d.getElementById('adjustModal').classList.contains('show');
  console.log('  (タップ→調整モーダル: ' + adjShown + ')');
  if (adjShown) {
    d.getElementById('chomboBtn').click();
    t('チョンボ(子): 本人 -8000', sc4('north') === 17000);
    t('チョンボ(子): 親 +4000', sc4('east') === 29000);
    t('チョンボ(子): 他の子 +2000', sc4('west') === 27000 && sc4('south') === 27000);
    t('チョンボ: 本場据え置き 0本場', d.getElementById('ciSub').textContent.includes('0本場'));
  }
  console.log('');
  console.log('RESULT: pass=' + pass + ' fail=' + fail);
  process.exit(fail ? 1 : 0);
}, 600);
