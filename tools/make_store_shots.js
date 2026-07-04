/* App Store スクショ生成（キャプション付き）
 * iPhone 6.7" (1290x2796):  node tools/make_store_shots.js
 * iPad 13"   (2064x2752):  node tools/make_store_shots.js ipad
 * 出力: appstore/screenshots/<6.7|13>/01..05.png
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 出力サイズプリセット（App Store Connect の必須枠に対応） */
const PRESETS = {
  '6.7':  { w: 1290, h: 2796, dir: '6.7', app: { w: 390, h: 844,  dsf: 3 }, shotW: 1010, capSize: 90,  capTop: 150, shotTop: 600, radius: 62 },
  'ipad': { w: 2064, h: 2752, dir: '13',  app: { w: 780, h: 1040, dsf: 2 }, shotW: 1560, capSize: 110, capTop: 170, shotTop: 640, radius: 48 },
};
const P = PRESETS[process.argv[2] || '6.7'];
if (!P) { console.error('usage: node tools/make_store_shots.js [ipad]'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'appstore', 'screenshots', P.dir);

const NAMES = { east: 'あきら', south: 'はるか', west: 'けんた', north: 'みさき' };
const SCENES = [
  { id: 'home',      caption: 'スワイプで<br>点棒いらず' },
  { id: 'ron',       caption: '点数表から<br>選ぶだけ' },
  { id: 'gameend',   caption: 'ウマ・オカ込みで<br>自動精算' },
  { id: 'picker',    caption: '3つのテーマ' },
  { id: 'ryuukyoku', caption: 'リーチ・流局・本場も<br>自動で進行' },
];

async function appShot(scene) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP, 'pf-store-' + scene)}`, '--no-first-run', '--force-color-profile=srgb'] });
  const page = await browser.newPage();
  await page.setViewport({ width: P.app.w, height: P.app.h, deviceScaleFactor: P.app.dsf });
  const live = scene === 'gameend'
    ? { scores: { east: 41000, south: 27000, west: 18000, north: 14000 }, dealerId: 'east', kyoku: 7, honbaGame: 0, kyotaku: 0 }
    : null;
  await page.evaluateOnNewDocument((names, live) => {
    localStorage.clear();
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', 'dark');
    localStorage.setItem('mahjong_player_names', JSON.stringify(names));
    if (live) localStorage.setItem('mahjong_live_state', JSON.stringify(live));
  }, NAMES, live);
  await page.goto(APP, { waitUntil: 'networkidle0' });
  await sleep(450);
  const rect = async sel => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  const shown = sel => page.evaluate(s => document.querySelector(s).classList.contains('show'), sel);

  if (scene === 'ron') {
    const a = await rect('[data-player-id="west"]'), b = await rect('[data-player-id="east"]');
    await page.mouse.move(a.x, a.y); await page.mouse.down();
    for (let i = 1; i <= 12; i++) { await page.mouse.move(a.x + (b.x - a.x) * i / 12, a.y); await sleep(15); }
    await page.mouse.up(); await sleep(400);
    await page.evaluate(() => { const c = [...document.querySelectorAll('#ronScoreRail .score-chip')].find(x => x.textContent.includes('満貫')); if (c) c.click(); });
    await sleep(200);
    if (!await shown('#modal')) console.warn('  !! ron modal not shown');
  } else if (scene === 'gameend') {
    await page.evaluate(() => document.getElementById('endBtn').click());
    await sleep(500);
    if (!await shown('#gameEndModal')) console.warn('  !! gameEnd modal not shown');
  } else if (scene === 'picker') {
    await page.evaluate(() => document.getElementById('themeToggle').click());
    await sleep(350);
    if (!await shown('#themePopover')) console.warn('  !! picker not shown');
  } else if (scene === 'ryuukyoku') {
    await page.evaluate(() => document.getElementById('ryuukyokuBtn').click());
    await sleep(350);
    if (!await shown('#ryuukyokuModal')) console.warn('  !! ryuukyoku modal not shown');
  }
  const b64 = await page.screenshot({ encoding: 'base64' });
  await browser.close();
  return b64;
}

async function frameShot(browser, sc, b64, outPath) {
  const page = await browser.newPage();
  const frame = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${P.w}px;height:${P.h}px;overflow:hidden}
    .bg{width:${P.w}px;height:${P.h}px;position:relative;
      background:linear-gradient(160deg,#0e3a20 0%,#0a2614 45%,#06160c 100%);
      font-family:'Hiragino Mincho ProN','Yu Mincho','MS Mincho',serif;}
    .cap{position:absolute;top:${P.capTop}px;left:0;right:0;text-align:center;padding:0 80px;}
    .cap h1{color:#f2ead2;font-size:${P.capSize}px;font-weight:700;letter-spacing:5px;line-height:1.32;
      text-shadow:0 2px 18px rgba(0,0,0,.5);}
    .cap .rule{width:120px;height:5px;margin:44px auto 0;border-radius:3px;
      background:linear-gradient(90deg,transparent,#c8a840,transparent);}
    .shot{position:absolute;left:50%;top:${P.shotTop}px;transform:translateX(-50%);
      width:${P.shotW}px;border-radius:${P.radius}px;overflow:hidden;
      box-shadow:0 40px 90px rgba(0,0,0,.55), 0 0 0 2px rgba(200,168,64,.25);}
    .shot img{display:block;width:${P.shotW}px;}
  </style></head><body>
    <div class="bg">
      <div class="cap"><h1>${sc.caption}</h1><div class="rule"></div></div>
      <div class="shot"><img src="data:image/png;base64,${b64}"></div>
    </div>
  </body></html>`;
  await page.setViewport({ width: P.w, height: P.h, deviceScaleFactor: 1 });
  await page.setContent(frame, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await sleep(300);
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: P.w, height: P.h } });
  await page.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  const fb = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: [`--user-data-dir=${path.join(TMP, 'pf-frame')}`, '--no-first-run', '--force-color-profile=srgb'] });
  let n = 0;
  for (const sc of SCENES) {
    const b64 = await appShot(sc.id);
    const out = path.join(OUT, String(++n).padStart(2, '0') + '_' + sc.id + '.png');
    await frameShot(fb, sc, b64, out);
    console.log('saved', path.basename(out));
  }
  await fb.close();
})();
