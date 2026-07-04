# tools/ — 開発補助スクリプト

## 現役（他所から参照されている）

| スクリプト | 用途 | 呼び出し元 |
|-----------|------|-----------|
| `build_www.js` | Web資産を `www/` に集約（Capacitor webDir）。sw.js / manifest.json はネイティブ同梱から除外 | `npm run build:web`・codemagic.yaml |
| `record_demo.js` | README用の操作デモGIF収録 | README.md |
| `render_assets.js` | ストア用アイコン・スプラッシュPNG生成 | ios-build/README.md |

## 一回性（ストアスクショ生成に使用・保守対象外）

`make_store_shots.js` / `montage.js` / `shot_*.js` 9本は `appstore/screenshots/` の生成に使ったスクリプト。
再生成が必要になった場合のみ以下の前提を整えて実行する。

```bat
node tools/make_store_shots.js       REM iPhone 6.7インチ (1290x2796) → appstore/screenshots/6.7/
node tools/make_store_shots.js ipad  REM iPad 13インチ (2064x2752)   → appstore/screenshots/13/
```

## 前提環境（puppeteer 系スクリプト共通）

1. **Chrome**: `C:\Program Files\Google\Chrome\Application\chrome.exe` に直書きパスで依存
   （別の場所にある場合は各スクリプト冒頭の定数を書き換える）
2. **puppeteer-core**: `%TEMP%\mahjong-test\node_modules` からロードする。消えていたら再構築:
   ```bat
   mkdir %TEMP%\mahjong-test
   cd /d %TEMP%\mahjong-test
   npm init -y && npm i puppeteer-core
   ```
3. 実行時に `test_output/tmp/` へ使い捨てChromeプロファイルとスクショが溜まる（.gitignore済み）。
   肥大化したら `test_output/tmp/` ごと削除してよい（全て再生成可能）。

※ ヘッドレステスト（`npm test`）はプロジェクトの `node_modules`（`npm install` で導入する jsdom）を使うため、この前提は不要。
