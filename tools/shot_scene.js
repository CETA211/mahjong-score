/* シーン別スクショ: node tools/shot_scene.js <theme> <scene>
 * scene: home | ron | tsumo | adjust | settings | history | gameend | help | ryuukyoku
 */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const theme = process.argv[2] || 'mleague';
const scene = process.argv[3] || 'home';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP, 'pf-' + process.pid)}`, '--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 820, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((th, names, live) => {
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', th);
    localStorage.setItem('mahjong_player_names', JSON.stringify(names));
    if (live) localStorage.setItem('mahjong_live_state', JSON.stringify(live));
  }, theme, { east: 'あきら', south: 'はるか', west: 'けんた', north: 'みさき' },
     scene === 'gameend' ? { scores: { east: 41000, south: 27000, west: 18000, north: 14000 }, dealerId: 'east', kyoku: 7, honbaGame: 0, kyotaku: 0 } : null);
  await page.goto('file:///' + APP.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await sleep(400);

  const rect = async sel => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  const swipe = async (from) => {
    const a = await rect(`[data-player-id="${from}"]`); const b = await rect('[data-player-id="east"]');
    await page.mouse.move(a.x, a.y); await page.mouse.down();
    for (let i = 1; i <= 14; i++) { await page.mouse.move(a.x + (b.x - a.x) * i / 14, a.y); await sleep(20); }
    await page.mouse.up(); await sleep(400);
  };

  if (scene === 'ron') await swipe('west');
  else if (scene === 'tsumo') {
    const n = await rect('[data-player-id="north"]'); await page.mouse.click(n.x, n.y); await sleep(100); await page.mouse.click(n.x, n.y); await sleep(400);
  }
  else if (scene === 'settings')  { await page.click('#settingsBtn'); await sleep(350); }
  else if (scene === 'history')   { await page.click('#histBtn'); await sleep(350); }
  else if (scene === 'help')      { await page.click('#helpBtn'); await sleep(350); }
  else if (scene === 'ryuukyoku') { await page.click('#ryuukyokuBtn'); await sleep(350); }
  else if (scene === 'gameend')   { await page.click('#endBtn'); await sleep(400); }
  else if (scene === 'adjust')    { const n = await rect('[data-player-id="south"]'); await page.mouse.click(n.x, n.y); await sleep(450); }

  const out = path.join(TMP, `sc_${theme}_${scene}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
