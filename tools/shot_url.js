/* 任意URLのスクショ: node tools/shot_url.js <url> <outname> [fullpage] */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const url = process.argv[2];
const outname = process.argv[3] || 'shot';
const full = process.argv[4] === 'full';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: [`--user-data-dir=${path.join(TMP, 'pf-' + process.pid)}`, '--no-first-run', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  const out = path.join(TMP, outname + '.png');
  await page.screenshot({ path: out, fullPage: full });
  // also mobile view
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await new Promise(r => setTimeout(r, 1000));
  const outm = path.join(TMP, outname + '_mobile.png');
  await page.screenshot({ path: outm, fullPage: full });
  await browser.close();
  console.log('saved', out, '/', outm);
})();
