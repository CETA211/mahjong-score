/* 点棒いらず ヘッドレス検証 その6: テーマ選択（標準/Mリーグ/ライト） */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('./_jsdom');

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

console.log('--- デフォルトはグリーン ---');
let w = boot({ mahjong_tutorial_shown: '1' });
let d = w.document;
t('論理テーマ=green (data-theme-name)', d.documentElement.getAttribute('data-theme-name') === 'green');
t('描画土台=light (data-theme)', d.documentElement.getAttribute('data-theme') === 'light');
t('スウォッチ: グリーンがon', d.querySelector('.theme-sw[data-theme-val="green"]').classList.contains('on'));
t('グリーンテーマ変数がCSSに定義', /\[data-skin="green"\] \{/.test(html));
t('グリーン: メイングリーン #1c7622 使用', html.includes('#1c7622'));
t('グリーン: 緑フレーム #0f8043 使用', html.includes('#0f8043'));
t('グリーン: 赤アクセント #cd0000 使用', html.includes('#cd0000'));
// 背景は純白ではない淡色（白カードを影で浮かせるコントラスト確保）
const mlVars = (html.match(/\[data-skin="green"\] \{[^}]*\}/) || [''])[0];
const bgm = mlVars.match(/--bg:\s*(#[0-9a-fA-F]{6})/);
t('グリーン: 背景は純白ではない淡色', !!bgm && bgm[1].toLowerCase() !== '#ffffff');
t('グリーン: カード白(--card #ffffff)', /--card:\s*#ffffff/.test(mlVars));

console.log('--- 設定で和(dark)に切替 → グリーンに戻す ---');
d.getElementById('settingsBtn').click();
t('設定モーダルが開く', d.getElementById('settingsModal').classList.contains('show'));
d.querySelector('.theme-sw[data-theme-val="dark"]').click();
t('和テーマに切替', d.documentElement.getAttribute('data-theme-name') === 'dark');
d.querySelector('.theme-sw[data-theme-val="green"]').click();
t('論理テーマ=green (data-theme-name)', d.documentElement.getAttribute('data-theme-name') === 'green');
t('skin=green (data-skin)', d.documentElement.getAttribute('data-skin') === 'green');
t('スウォッチ: グリーンがon', d.querySelector('.theme-sw[data-theme-val="green"]').classList.contains('on'));
t('和スウォッチはoff', !d.querySelector('.theme-sw[data-theme-val="dark"]').classList.contains('on'));
t('LS_THEMEにgreen保存', w.localStorage.getItem('mahjong_theme') === 'green');
t('設定スウォッチとピッカー両方がon', d.querySelector('.tp-item[data-theme-val="green"]').classList.contains('on'));

console.log('--- ヘッダーのテーマピッカー（ポップオーバー） ---');
d.getElementById('themeToggle').click();
t('ピッカーが開く', d.getElementById('themePopover').classList.contains('show'));
d.querySelector('.tp-item[data-theme-val="light"]').click();
t('ピッカーでライト選択', d.documentElement.getAttribute('data-theme-name') === 'light');
t('選択後ピッカーが閉じる', !d.getElementById('themePopover').classList.contains('show'));
t('ピッカー: ライトがon', d.querySelector('.tp-item[data-theme-val="light"]').classList.contains('on'));
d.getElementById('themeToggle').click();
d.querySelector('.tp-item[data-theme-val="dark"]').click();
t('ピッカーで和テーマに', d.documentElement.getAttribute('data-theme-name') === 'dark');

console.log('--- 再起動でテーマ復元（旧名 mleague は green に移行） ---');
const w2 = boot({ mahjong_tutorial_shown: '1', mahjong_theme: 'mleague' });
t('旧mleague保存値がgreenに移行', w2.document.documentElement.getAttribute('data-theme-name') === 'green');
t('スウォッチも復元', w2.document.querySelector('.theme-sw[data-theme-val="green"]').classList.contains('on'));
const w2b = boot({ mahjong_tutorial_shown: '1', mahjong_theme: 'dark' });
t('dark復元', w2b.document.documentElement.getAttribute('data-theme-name') === 'dark');

console.log('--- 不正値はgreenにフォールバック ---');
const w3 = boot({ mahjong_tutorial_shown: '1', mahjong_theme: 'bogus' });
t('不正テーマ→green', w3.document.documentElement.getAttribute('data-theme-name') === 'green');

console.log('');
console.log('RESULT: pass=' + pass + ' fail=' + fail);
process.exit(fail ? 1 : 0);
