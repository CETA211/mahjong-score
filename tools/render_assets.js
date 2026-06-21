/* SVG→PNG レンダリング（App Store/PWAアイコン生成）
 * node tools/render_assets.js
 * 出力: appstore/icon-1024.png, appstore/splash-2732.png, icons/icon-180/192/512.png
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'puppeteer-core'));
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, 'test_output', 'tmp');

async function renderSvg(page, svgPath, size, outPath) {
  const svg = fs.readFileSync(svgPath, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0} html,body{width:${size}px;height:${size}px;overflow:hidden}
    svg{width:${size}px;height:${size}px;display:block}
  </style></head><body>${svg}</body></html>`;
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: size, height: size }, omitBackground: false });
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
    args: [`--user-data-dir=${path.join(TMP, 'pf-assets')}`, '--no-first-run', '--force-color-profile=srgb'] });
  const page = await browser.newPage();

  const iconSvg = path.join(ROOT, 'appstore', 'icon.svg');
  const splashSvg = path.join(ROOT, 'appstore', 'splash.svg');
  fs.mkdirSync(path.join(ROOT, 'appstore'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'icons'), { recursive: true });

  // App Store マスター（1024, アルファ無しにフラット化）
  const tmpIcon = path.join(TMP, '_icon1024.png');
  await renderSvg(page, iconSvg, 1024, tmpIcon);
  execFileSync('ffmpeg', ['-y', '-i', tmpIcon, '-pix_fmt', 'rgb24', path.join(ROOT, 'appstore', 'icon-1024.png')], { stdio: 'ignore' });

  // スプラッシュ（2732）
  await renderSvg(page, splashSvg, 2732, path.join(ROOT, 'appstore', 'splash-2732.png'));

  // PWA/Apple touch 各サイズ（透過なしでOK）
  for (const s of [180, 192, 512]) {
    await renderSvg(page, iconSvg, s, path.join(ROOT, 'icons', `icon-${s}.png`));
  }

  await browser.close();
  for (const f of ['appstore/icon-1024.png', 'appstore/splash-2732.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png']) {
    const st = fs.statSync(path.join(ROOT, f));
    console.log(f, Math.round(st.size / 1024) + 'KB');
  }
})();
