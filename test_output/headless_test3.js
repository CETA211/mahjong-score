/* 点棒いらず ヘッドレス検証 その3: UI/UX改善（コーチ・矢印・中央モーダル・席順名） */
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
      window.confirm = () => true;
      if (seed) for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  }).window;
}

console.log('--- ③ デフォルト名: 東=プレイヤー1 ---');
let w = boot();
let d = w.document;
t('東 = プレイヤー1', d.getElementById('name-east').value === 'プレイヤー1');
t('南 = プレイヤー2', d.getElementById('name-south').value === 'プレイヤー2');
t('西 = プレイヤー3', d.getElementById('name-west').value === 'プレイヤー3');
t('北 = プレイヤー4', d.getElementById('name-north').value === 'プレイヤー4');

console.log('--- ⑤ 初回コーチマーク ---');
setTimeout(() => {
  t('初回起動でコーチ表示', d.getElementById('coachOverlay').classList.contains('show'));
  t('ステップ1はスワイプデモ', d.getElementById('coachDemo').className.includes('anim-swipe'));
  t('ドット3個', d.querySelectorAll('.coach-dot').length === 3);
  d.getElementById('coachNextBtn').click();
  t('ステップ2は2タップデモ', d.getElementById('coachDemo').className.includes('anim-dtap'));
  d.getElementById('coachNextBtn').click();
  t('最終ステップのボタンは「はじめる」', d.getElementById('coachNextBtn').textContent === 'はじめる');
  d.getElementById('coachNextBtn').click();
  t('閉じるとLS_TUTORIALが立つ', w.localStorage.getItem('mahjong_tutorial_shown') === '1');
  t('コーチ非表示', !d.getElementById('coachOverlay').classList.contains('show'));

  console.log('--- ⑤ 2回目以降は表示されない ---');
  const w2 = boot({ mahjong_tutorial_shown: '1' });
  setTimeout(() => {
    t('2回目はコーチ非表示', !w2.document.getElementById('coachOverlay').classList.contains('show'));

    console.log('--- ヘルプ→操作デモ再生導線 ---');
    w2.document.getElementById('helpBtn').click();
    w2.document.getElementById('helpDemoBtn').click();
    t('ヘルプからコーチ再生', w2.document.getElementById('coachOverlay').classList.contains('show'));

    console.log('--- ④ 矢印SVG構造（シェブロンストリーム） ---');
    t('ガイド基準線あり', !!w2.document.getElementById('swipeArrowBase'));
    t('シェブロンが生成されている', w2.document.getElementById('swipeArrowChevrons').children.length === 14);
    t('先端ダブルシェブロンあり', w2.document.querySelectorAll('#swipeArrowTipG .arrow-tip').length === 2);
    t('旧markerは削除済み', !w2.document.getElementById('swipeArrowHead'));

    console.log('--- ② モーダル中央化CSS ---');
    const css = html.match(/\n    \.modal-overlay \{[^}]*\}/)[0];
    t('align-items: center', css.includes('align-items: center'));
    const sheetCss = html.match(/\.modal-sheet\s*\{[^}]*\}/)[0];
    t('border-radius が全周 22px', sheetCss.includes('border-radius: 22px'));

    console.log('--- ① ドラッグスクロール ---');
    t('score-rail に cursor:grab', /\.score-rail\s*\{[^}]*cursor:\s*grab/.test(html));
    // wheel イベントで横スクロールに変換されるか（jsdomはscrollLeft書込可）
    const rail = w2.document.getElementById('ronScoreRail');
    const ev = new w2.WheelEvent('wheel', { deltaY: 120, cancelable: true, bubbles: true });
    rail.dispatchEvent(ev);
    t('wheel→横スクロール変換(scrollLeft>0)', rail.scrollLeft === 120);

    console.log('');
    console.log('RESULT: pass=' + pass + ' fail=' + fail);
    process.exit(fail ? 1 : 0);
  }, 700);
}, 700);
