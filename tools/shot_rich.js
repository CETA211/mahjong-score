/* 実戦に近い状態のスクショ: node tools/shot_rich.js [theme] */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const theme = process.argv[2] || 'mleague';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP,'pf-'+process.pid)}`, '--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 820, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((th) => {
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', th);
    localStorage.setItem('mahjong_player_names', JSON.stringify({ east:'あきら', south:'はるか', west:'けんた', north:'みさき' }));
    localStorage.setItem('mahjong_settings', JSON.stringify({ showRank:true, showDiff:true }));
    localStorage.setItem('mahjong_live_state', JSON.stringify({
      scores: { east: 52300, south: 28100, west: 22600, north: -3000 },
      dealerId: 'south', kyoku: 5, honbaGame: 2, kyotaku: 1, riichiIds: ['east']
    }));
  }, theme);
  await page.goto('file:///' + APP.replace(/\\/g,'/'), { waitUntil: 'networkidle0' });
  await sleep(500);
  const out = path.join(TMP, `rich_${theme}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
