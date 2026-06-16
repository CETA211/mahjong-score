/* 履歴ログ入り & ツモ内訳のスクショ: node tools/shot_final.js <historylog|tsumobreak> */
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
const TMP = path.join(__dirname, '..', 'test_output', 'tmp');
const scene = process.argv[2] || 'historylog';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', `--user-data-dir=${path.join(TMP,'pf-'+process.pid)}`, '--no-first-run'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 820, deviceScaleFactor: 1.5 });
  await page.evaluateOnNewDocument((scene) => {
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', 'mleague');
    localStorage.setItem('mahjong_player_names', JSON.stringify({ east:'あきら', south:'はるか', west:'けんた', north:'みさき' }));
    if (scene === 'historylog') {
      const now = Date.now();
      localStorage.setItem('mahjong_transfer_log', JSON.stringify([
        { timestamp: now-300000, from:'west', to:'east', fromName:'けんた', toName:'あきら', amount:8000, type:'ron' },
        { timestamp: now-240000, pid:'south', playerName:'はるか', amount:1000, type:'riichi' },
        { timestamp: now-180000, to:'south', toName:'はるか', amount:3900, type:'tsumo' },
        { timestamp: now-120000, type:'ryuukyoku', tenpaiNames:['あきら','けんた'] },
        { timestamp: now-60000, pid:'north', playerName:'みさき', amount:8000, type:'chombo', moved:true },
      ]));
    }
  }, scene);
  await page.goto('file:///' + APP.replace(/\\/g,'/'), { waitUntil: 'networkidle0' });
  await sleep(450);
  const rect = async sel => page.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}},sel);
  if (scene === 'historylog') { await page.evaluate(()=>document.querySelector('#histBtn').click()); await sleep(350); }
  else if (scene === 'tsumobreak') {
    const n = await rect('[data-player-id="west"]'); await page.mouse.click(n.x,n.y); await sleep(90); await page.mouse.click(n.x,n.y); await sleep(350);
    // 子ツモのまま満貫チップをクリック
    await page.evaluate(()=>{ const c=[...document.querySelectorAll('#tsumoScoreRail .score-chip')].find(x=>x.textContent.includes('満貫')); if(c)c.click(); });
    await sleep(300);
  }
  const out = path.join(TMP, `fin_${scene}.png`);
  await page.screenshot({ path: out });
  await browser.close();
  console.log('saved', out);
})();
