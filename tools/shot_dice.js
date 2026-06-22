/* サイコロのスクショ: node tools/shot_dice.js [theme] */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const theme = process.argv[2] || 'dark';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP,'pf-dice')}`, '--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 820, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((th) => {
    localStorage.clear();
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', th);
  }, theme);
  await page.goto(APP, { waitUntil: 'networkidle0' });
  await sleep(400);
  await page.evaluate(() => document.getElementById('diceBtn').click());
  await sleep(900); // ロール完了後（settle）
  // 出目を固定確認のため値を読む
  const sum = await page.evaluate(() => document.getElementById('diceSum').textContent);
  console.log('sum:', sum);
  await page.screenshot({ path: path.join(TMP, `dice_${theme}.png`) });
  await browser.close();
  console.log('saved dice_' + theme + '.png');
})();
