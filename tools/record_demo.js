/* 操作デモGIF収録スクリプト
 * 使い方: node tools/record_demo.js
 * 前提: %TEMP%/mahjong-test に puppeteer-core がインストール済み・Edgeあり・ffmpegあり
 * 出力: docs/demo.gif（フレームは %TEMP%/mahjong-demo-frames に一時保存）
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));

const EDGE = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = path.join(__dirname, '..', 'index.html');
/* 日本語ユーザー名のTEMPはブラウザ起動と相性が悪いためASCIIパスを使う */
const TMP_DIR = path.join(__dirname, '..', 'test_output', 'tmp');
const FRAME_DIR = path.join(TMP_DIR, 'frames-' + process.pid);
const OUT_DIR = path.join(__dirname, '..', 'docs');
const FPS = 14;

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const profileDir = path.join(TMP_DIR, 'profile-' + process.pid);
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: [
      '--allow-file-access-from-files',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 760, deviceScaleFactor: 1.5 });

  /* チュートリアル抑止 + 名前設定 */
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_player_names', JSON.stringify({
      east: 'あきら', south: 'はるか', west: 'けんた', north: 'みさき',
    }));
    localStorage.removeItem('mahjong_live_state');
  });
  await page.goto('file:///' + APP.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await sleep(400);

  /* スクリーンキャスト開始 */
  const client = await page.target().createCDPSession();
  const frames = [];
  client.on('Page.screencastFrame', ev => {
    frames.push({ data: ev.data, ts: ev.metadata.timestamp });
    client.send('Page.screencastFrameAck', { sessionId: ev.sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 600, maxHeight: 1140 });

  const rect = async sel => page.evaluate(s => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel);

  /* シーン1: スワイプ（けんた→あきら にロン支払い） */
  await sleep(900);
  const west = await rect('[data-player-id="west"]');
  const east = await rect('[data-player-id="east"]');
  await page.mouse.move(west.x, west.y);
  await page.mouse.down();
  const steps = 22;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    /* ease-in-out で east カードへ */
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    await page.mouse.move(west.x + (east.x - west.x) * e, west.y + (east.y - west.y) * e);
    await sleep(55);
  }
  await sleep(450);
  await page.mouse.up();
  await sleep(900);

  /* シーン2: 満貫チップを選択 → 決定（親ロンなら12,000・子ロンなら8,000） */
  const chip = await page.evaluate(() => {
    const c = [...document.querySelectorAll('#ronScoreRail .score-chip')]
      .find(x => x.textContent.includes('満貫'));
    c.scrollIntoView({ inline: 'center', behavior: 'instant' });
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await sleep(700);
  await page.mouse.click(chip.x, chip.y);
  await sleep(800);
  const ok = await rect('#confirmBtn');
  await page.mouse.click(ok.x, ok.y);
  await sleep(1500);   /* フロート表示・順位バッジ更新・トースト */

  /* シーン3: 2タップでツモ */
  const north = await rect('[data-player-id="north"]');
  await page.mouse.click(north.x, north.y);
  await sleep(120);
  await page.mouse.click(north.x, north.y);
  await sleep(1300);
  const cancel = await rect('#cancelBtn');
  await page.mouse.click(cancel.x, cancel.y);
  await sleep(600);

  /* シーン4: リーチ宣言（はるか） */
  const riichiBtn = await rect('#riichiBtn');
  await page.mouse.click(riichiBtn.x, riichiBtn.y);
  await sleep(800);
  const pick = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('#riichiPlayerList .pick-btn')];
    const b = btns.find(x => x.textContent.includes('はるか'));
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(pick.x, pick.y);
  await sleep(1500);   /* リーチバッジ + 供託表示 */

  await client.send('Page.stopScreencast');
  await browser.close();

  /* フレームを一定FPSにリサンプリングして書き出し */
  if (frames.length < 2) { console.error('frames not captured'); process.exit(1); }
  const t0 = frames[0].ts, t1 = frames[frames.length - 1].ts;
  let n = 0, fi = 0;
  for (let t = t0; t <= t1; t += 1 / FPS) {
    while (fi + 1 < frames.length && frames[fi + 1].ts <= t) fi++;
    fs.writeFileSync(path.join(FRAME_DIR, `f_${String(n++).padStart(4, '0')}.png`),
      Buffer.from(frames[fi].data, 'base64'));
  }
  console.log(`captured ${frames.length} frames -> resampled ${n} @ ${FPS}fps (${((t1 - t0)).toFixed(1)}s)`);

  /* GIF生成（パレット最適化） */
  const gif = path.join(OUT_DIR, 'demo.gif');
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${path.join(FRAME_DIR, 'f_%04d.png')}" ` +
    `-vf "scale=340:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4" ` +
    `"${gif}"`, { stdio: 'inherit' });
  const kb = Math.round(fs.statSync(gif).size / 1024);
  console.log(`done: ${gif} (${kb} KB)`);
})();
