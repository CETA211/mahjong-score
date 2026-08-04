/* App Review 提出用の証拠スクリーンショット一式を生成
 * node tools/make_review_evidence.js
 * 出力: appstore/evidence/*.png（英語ファイル名。Resolution Center にそのまま添付する）
 *
 * 目的: アプリに金銭・レート・賭け金に関する機能が一切存在しないことを、
 *       全画面のスクリーンショットで示す（特に Settings 画面）。
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const APP = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');
const OUT = path.join(ROOT, 'appstore', 'evidence');
const TMP = path.join(ROOT, 'test_output', 'tmp');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const NAMES = { east: 'Player 1', south: 'Player 2', west: 'Player 3', north: 'Player 4' };
const LIVE = { scores: { east: 41000, south: 27000, west: 18000, north: 14000 },
               dealerId: 'east', kiichaId: 'east', kyoku: 7, honbaGame: 0, kyotaku: 0, riichiIds: [] };

async function newPage(browser, { w = 390, h = 844, live = null } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument((names, live) => {
    localStorage.clear();
    localStorage.setItem('mahjong_tutorial_shown', '1');
    localStorage.setItem('mahjong_theme', 'green');
    localStorage.setItem('mahjong_player_names', JSON.stringify(names));
    if (live) localStorage.setItem('mahjong_live_state', JSON.stringify(live));
  }, NAMES, live);
  await page.goto(APP, { waitUntil: 'networkidle0' });
  await sleep(450);
  return page;
}

const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
/* モーダルは余白を除いてシート部分だけを切り出す（添付時に読みやすくするため） */
async function shotSheet(page, sel, name) {
  const el = await page.$(sel);
  if (!el) return shot(page, name);
  await el.screenshot({ path: path.join(OUT, name + '.png') });
}
const click = (page, id) => page.evaluate(i => document.getElementById(i).click(), id);
const center = async (page, sel) => page.evaluate(s => {
  const r = document.querySelector(s).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, sel);

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: ['--allow-file-access-from-files', '--no-first-run', '--force-color-profile=srgb',
           `--user-data-dir=${path.join(TMP, 'pf-evidence')}`] });

  /* 01 メイン画面 */
  let p = await newPage(browser);
  await shot(p, '01_main_scoreboard');
  await p.close();

  /* 02 設定画面（最重要）— 全項目が1枚に収まるよう縦長ビューポートで撮る */
  p = await newPage(browser, { h: 1700 });
  await click(p, 'settingsBtn');
  await sleep(600);
  await shotSheet(p, '#settingsModal .modal-sheet', '02_settings_ALL_no_money_or_rate_option');
  await p.close();

  /* 03 ヘルプ（金銭機能が無い旨の注記を含む）*/
  p = await newPage(browser, { h: 3000 });
  await click(p, 'helpBtn');
  await sleep(600);
  await shotSheet(p, '#helpModal .modal-sheet', '03_help_full_with_disclaimer');
  await p.close();

  /* 04 点数移動（ロン）入力 */
  p = await newPage(browser);
  {
    const a = await center(p, '[data-player-id="south"]');
    const b = await center(p, '[data-player-id="east"]');
    await p.mouse.move(a.x, a.y); await p.mouse.down();
    for (let i = 1; i <= 12; i++) { await p.mouse.move(a.x + (b.x - a.x) * i / 12, a.y + (b.y - a.y) * i / 12); await sleep(18); }
    await p.mouse.up(); await sleep(500);
    await shot(p, '04_point_transfer_input');
  }
  await p.close();

  /* 05 ツモ入力 */
  p = await newPage(browser);
  {
    const c = await center(p, '[data-player-id="east"]');
    await p.mouse.click(c.x, c.y); await sleep(100); await p.mouse.click(c.x, c.y);
    await sleep(600);
    await shot(p, '05_self_draw_input');
  }
  await p.close();

  /* 06 点数調整（チョンボボタンを含む）*/
  p = await newPage(browser);
  {
    const c = await center(p, '[data-player-id="east"]');
    await p.mouse.click(c.x, c.y);
    await sleep(700);
    await shot(p, '06_manual_point_adjust');
  }
  await p.close();

  /* 07 立直 / 08 流局 / 09 履歴 / 10 サイコロ / 11 局・本場・供託の修正 */
  for (const [id, sel, name] of [['riichiBtn', '#riichiModal', '07_riichi_declaration'],
                                 ['ryuukyokuBtn', '#ryuukyokuModal', '08_exhaustive_draw'],
                                 ['histBtn', '#histModal', '09_history_log'],
                                 ['diceBtn', '#diceModal', '10_dice_roll']]) {
    p = await newPage(browser, { h: 1400 });
    await click(p, id);
    await sleep(700);
    await shotSheet(p, sel + ' .modal-sheet', name);
    await p.close();
  }
  p = await newPage(browser, { h: 1400 });
  await p.evaluate(() => document.getElementById('centerInfo').click());
  await sleep(600);
  await shotSheet(p, '#infoEditModal .modal-sheet', '11_edit_hand_honba_deposit');
  await p.close();

  /* 12 最終スコア集計（pt表示・金額なし）— 要 live state */
  p = await newPage(browser, { h: 1500, live: LIVE });
  await click(p, 'endBtn');
  await sleep(900);
  await shotSheet(p, '#gameEndModal .gameover-sheet', '12_final_score_summary_unitless_pt');
  await p.close();

  /* 13 プレイヤー名編集 */
  p = await newPage(browser, { h: 1200 });
  await p.evaluate(() => document.getElementById('cardname-east').click());
  await sleep(600);
  await shotSheet(p, '#nameModal .modal-sheet', '13_player_names');
  await p.close();

  /* 14 横画面（卓中央表示） */
  p = await newPage(browser, { w: 844, h: 420 });
  await shot(p, '14_landscape_table_mode');
  await p.close();

  await browser.close();
  const files = fs.readdirSync(OUT).sort();
  console.log(`\n${files.length} 枚を ${OUT} に出力:`);
  files.forEach(f => console.log('  ' + f));
})();
