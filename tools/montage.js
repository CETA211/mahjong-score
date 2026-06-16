/* 複数シーンを撮って1枚に横並び: node tools/montage.js <theme> <scene1,scene2,...>
 * 出力: test_output/tmp/montage_<theme>.png
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const theme = process.argv[2] || 'mleague';
const scenes = (process.argv[3] || 'home,ron,gameend').split(',');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shoot(page, scene) {
  const rect = async sel => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  const click = sel => page.evaluate(s => document.querySelector(s).click(), sel);
  if (scene === 'ron') {
    const a = await rect('[data-player-id="west"]'); const b = await rect('[data-player-id="east"]');
    await page.mouse.move(a.x, a.y); await page.mouse.down();
    for (let i = 1; i <= 12; i++) { await page.mouse.move(a.x + (b.x - a.x) * i / 12, a.y); await sleep(15); }
    await page.mouse.up(); await sleep(350);
  } else if (scene === 'tsumo') {
    const n = await rect('[data-player-id="north"]'); await page.mouse.click(n.x, n.y); await sleep(90); await page.mouse.click(n.x, n.y); await sleep(350);
  } else if (scene === 'settings') { await click('#settingsBtn'); await sleep(300); }
  else if (scene === 'history')  { await click('#histBtn'); await sleep(300); }
  else if (scene === 'gameend')  { await click('#endBtn'); await sleep(350); }
  else if (scene === 'adjust')   { const n = await rect('[data-player-id="south"]'); await page.mouse.click(n.x, n.y); await sleep(420); }
}

(async () => {
  const files = [];
  for (const scene of scenes) {
    const browser = await puppeteer.launch({
      executablePath: CHROME, headless: true,
      args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP, 'pf-' + process.pid + '-' + scene)}`, '--no-first-run'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 1.4 });
    await page.evaluateOnNewDocument((th, names, live) => {
      localStorage.setItem('mahjong_tutorial_shown', '1');
      localStorage.setItem('mahjong_theme', th);
      localStorage.setItem('mahjong_player_names', JSON.stringify(names));
      if (live) localStorage.setItem('mahjong_live_state', JSON.stringify(live));
    }, theme, { east: 'あきら', south: 'はるか', west: 'けんた', north: 'みさき' },
       scene === 'gameend' ? { scores: { east: 41000, south: 27000, west: 18000, north: 14000 }, dealerId: 'east', kyoku: 7, honbaGame: 0, kyotaku: 0 } : null);
    await page.goto('file:///' + APP.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await sleep(350);
    await shoot(page, scene);
    const f = path.join(TMP, `m_${scene}.png`);
    await page.screenshot({ path: f });
    files.push(f);
    await browser.close();
  }
  // tile horizontally with ffmpeg
  const out = path.join(TMP, `montage_${theme}.png`);
  const inputs = files.flatMap(f => ['-i', f]);
  execFileSync('ffmpeg', ['-y', ...inputs, '-filter_complex', `hstack=inputs=${files.length}`, out], { stdio: 'ignore' });
  console.log('saved', out);
})();
