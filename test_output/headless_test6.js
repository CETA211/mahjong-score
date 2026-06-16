/* 点棒いらず ヘッドレス検証 その6: テーマ選択（標準/Mリーグ/ライト） */
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

console.log('--- デフォルトは標準(和/dark) ---');
let w = boot({ mahjong_tutorial_shown: '1' });
let d = w.document;
t('html data-theme=dark', d.documentElement.getAttribute('data-theme') === 'dark');
t('スウォッチ: 標準がon', d.querySelector('.theme-sw[data-theme-val="dark"]').classList.contains('on'));
t('Mリーグテーマ変数がCSSに定義', /\[data-skin="mleague"\] \{/.test(html));
t('Mリーグ: M.LEAGUEグリーン #1c7622 使用', html.includes('#1c7622'));
t('Mリーグ: 緑フレーム #0f8043 使用', html.includes('#0f8043'));
t('Mリーグ: 赤アクセント #cd0000 使用', html.includes('#cd0000'));
// 背景は純白ではない淡色（白カードを影で浮かせるコントラスト確保）
const mlVars = (html.match(/\[data-skin="mleague"\] \{[^}]*\}/) || [''])[0];
const bgm = mlVars.match(/--bg:\s*(#[0-9a-fA-F]{6})/);
t('Mリーグ: 背景は純白ではない淡色', !!bgm && bgm[1].toLowerCase() !== '#ffffff');
t('Mリーグ: カード白(--card #ffffff)', /--card:\s*#ffffff/.test(mlVars));

console.log('--- 設定でMリーグに切替 ---');
d.getElementById('settingsBtn').click();
t('設定モーダルが開く', d.getElementById('settingsModal').classList.contains('show'));
d.querySelector('.theme-sw[data-theme-val="mleague"]').click();
t('論理テーマ=mleague (data-theme-name)', d.documentElement.getAttribute('data-theme-name') === 'mleague');
t('描画土台=light (data-theme)', d.documentElement.getAttribute('data-theme') === 'light');
t('skin=mleague (data-skin)', d.documentElement.getAttribute('data-skin') === 'mleague');
t('スウォッチ: Mリーグがon', d.querySelector('.theme-sw[data-theme-val="mleague"]').classList.contains('on'));
t('標準スウォッチはoff', !d.querySelector('.theme-sw[data-theme-val="dark"]').classList.contains('on'));
t('LS_THEMEにmleague保存', w.localStorage.getItem('mahjong_theme') === 'mleague');
t('Mリーグ時は月アイコン表示（太陽非表示）', d.getElementById('iconSun').style.display === 'none');

console.log('--- ヘッダーボタン: Mリーグ⇄ライト ---');
d.getElementById('themeToggle').click();
t('Mリーグ→ライト', d.documentElement.getAttribute('data-theme') === 'light');
t('ライト時は太陽アイコン', d.getElementById('iconSun').style.display === '');
d.getElementById('themeToggle').click();
t('ライト→Mリーグに戻る（lastDarkTheme記憶）', d.documentElement.getAttribute('data-theme-name') === 'mleague');

console.log('--- 再起動でテーマ復元 ---');
const w2 = boot({ mahjong_tutorial_shown: '1', mahjong_theme: 'mleague' });
t('mleague復元', w2.document.documentElement.getAttribute('data-theme-name') === 'mleague');
t('スウォッチも復元', w2.document.querySelector('.theme-sw[data-theme-val="mleague"]').classList.contains('on'));

console.log('--- 不正値はdarkにフォールバック ---');
const w3 = boot({ mahjong_tutorial_shown: '1', mahjong_theme: 'bogus' });
t('不正テーマ→dark', w3.document.documentElement.getAttribute('data-theme-name') === 'dark');

console.log('');
console.log('RESULT: pass=' + pass + ' fail=' + fail);
process.exit(fail ? 1 : 0);
