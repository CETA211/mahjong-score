/* 横画面（卓中央表示）スクショ: node tools/shot_land.js [theme] [sanma] */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const theme = process.argv[2] || 'dark';
const sanma = process.argv[3] === 'sanma';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP, 'pf-land')}`, '--no-first-run'] });
  const page = await browser.newPage();
  // 横画面 iPhone 相当（高さ<=560）
  await page.setViewport({ width: 852, height: 393, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument((th, sanma) => {
    localStorage.clear();
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', th);
    if (sanma) localStorage.setItem('mahjong_rule_mode', 'sanma');
    localStorage.setItem('mahjong_player_names', JSON.stringify({ east: 'あきら', south: 'はるか', west: 'けんた', north: 'みさき' }));
    localStorage.setItem('mahjong_live_state', JSON.stringify({
      scores: sanma ? { east: 42300, south: 33000, west: 35000, north: 29700 }
                    : { east: 52300, south: 28100, west: 22600, north: -3000 },
      dealerId: 'south', kyoku: 5, honbaGame: 2, kyotaku: 1, riichiIds: []
    }));
  }, theme, sanma);
  await page.goto(APP, { waitUntil: 'networkidle0' });
  await sleep(500);
  const out = path.join(TMP, `land_${theme}${sanma ? '_sanma' : ''}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', path.basename(out));
})();
