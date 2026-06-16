/* 指定テーマでアプリのスクショを撮る: node tools/shot_theme.js <theme> */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const theme = process.argv[2] || 'mleague';
const withModal = process.argv[3] === 'modal';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP, 'pf-' + process.pid)}`, '--no-first-run'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 760, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((th, names) => {
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', th);
    localStorage.setItem('mahjong_player_names', JSON.stringify(names));
  }, theme, { east: 'あきら', south: 'はるか', west: 'けんた', north: 'みさき' });
  await page.goto('file:///' + APP.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  if (withModal) {
    const west = await page.evaluate(() => {
      const r = document.querySelector('[data-player-id="west"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const east = await page.evaluate(() => {
      const r = document.querySelector('[data-player-id="east"]').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(west.x, west.y); await page.mouse.down();
    for (let i = 1; i <= 14; i++) { await page.mouse.move(west.x + (east.x - west.x) * i / 14, west.y); await new Promise(r => setTimeout(r, 25)); }
    await page.mouse.up();
    await new Promise(r => setTimeout(r, 500));
  }

  const out = path.join(TMP, `theme_${theme}${withModal ? '_modal' : ''}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
