/* 特殊状態のスクショ: node tools/shot_special.js <coach|confirm|swipe|riichi|ie> */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const scene = process.argv[2] || 'coach';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP,'pf-'+process.pid)}`, '--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 820, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((scene) => {
    if (scene !== 'coach') localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', 'mleague');
    localStorage.setItem('mahjong_player_names', JSON.stringify({ east:'あきら', south:'はるか', west:'けんた', north:'みさき' }));
  }, scene);
  await page.goto('file:///' + APP.replace(/\\/g,'/'), { waitUntil: 'networkidle0' });
  await sleep(500);
  const rect = async sel => page.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}},sel);
  if (scene === 'confirm') { await page.evaluate(()=>document.querySelector('#resetBtn').click()); await sleep(300); }
  else if (scene === 'riichi') { await page.evaluate(()=>document.querySelector('#riichiBtn').click()); await sleep(300); }
  else if (scene === 'ie') { await page.evaluate(()=>document.querySelector('#centerInfo').click()); await sleep(300); }
  else if (scene === 'swipe') {
    const a = await rect('[data-player-id="west"]'); const b = await rect('[data-player-id="east"]');
    await page.mouse.move(a.x,a.y); await page.mouse.down();
    for (let i=1;i<=10;i++){ await page.mouse.move(a.x+(b.x-a.x)*i/14, a.y - 6*i/14); await sleep(20); }
    await sleep(250); // hold mid-swipe to capture arrow
  }
  const out = path.join(TMP, `sp_${scene}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
