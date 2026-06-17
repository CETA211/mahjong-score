/* 新機能のスクショ: node tools/shot_feat.js <picker|settings> [theme] */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const scene = process.argv[2] || 'picker';
const theme = process.argv[3] || 'mleague';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP,'pf-'+process.pid)}`, '--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 860, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((th) => {
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', th);
    localStorage.setItem('mahjong_player_names', JSON.stringify({ east:'あきら', south:'はるか', west:'けんた', north:'みさき' }));
    localStorage.setItem('mahjong_member_presets', JSON.stringify([
      { east:'あきら', south:'はるか', west:'けんた', north:'みさき' },
      { east:'田中', south:'佐藤', west:'鈴木', north:'高橋' },
    ]));
  }, theme);
  await page.goto('file:///' + APP.replace(/\\/g,'/'), { waitUntil: 'networkidle0' });
  await sleep(450);
  if (scene === 'picker') { await page.evaluate(()=>document.getElementById('themeToggle').click()); await sleep(300); }
  else if (scene === 'settings') { await page.evaluate(()=>document.getElementById('settingsBtn').click()); await sleep(350); }
  const out = path.join(TMP, `feat_${scene}_${theme}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
