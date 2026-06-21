# 点棒いらず — iOS（App Store）ビルド手順

Windows のまま **Mac を使わずに** クラウドCI（Codemagic）で iOS アプリをビルド→TestFlight→App Store 申請するための手順。

## 構成（このリポジトリに同梱済み）

| ファイル | 役割 |
|---------|------|
| `index.html` 他 | アプリ本体（単一ソース） |
| `tools/build_www.js` | Web資産を `www/` に集約（Capacitor の webDir） |
| `capacitor.config.json` | Capacitor 設定（appId・名前・StatusBar/Splash） |
| `package.json` | Capacitor 依存とビルドスクリプト |
| `codemagic.yaml` | 無人iOSビルド（署名・TestFlight）CI定義 |
| `appstore/icon-1024.png` / `splash-2732.png` | ストア用アイコン・起動画面 |

`ios/`（ネイティブ）と `node_modules/` と `www/` は **CIが自動生成**するため git 管理しない。

---

## 0. 事前準備（あなたの作業・1回だけ）

1. **Apple Developer Program 登録**（$99/年）: https://developer.apple.com/programs/
2. **App Store Connect でアプリを作成**
   - Bundle ID: `com.cetacompany.tenboirazu`
   - 名前: 点棒いらず（ストア表示名は世界で一意。重複時は要変更）
3. **App Store Connect API キー発行**（Users and Access → Integrations → App Store Connect API）
   - Issuer ID / Key ID / .p8 ファイルを控える
4. **Codemagic 登録**（GitHub連携）: https://codemagic.io/

---

## 1. Codemagic 側の設定（1回だけ）

1. Codemagic にこの GitHub リポジトリを接続
2. **Teams → Integrations → App Store Connect** に上記APIキーを登録（名前を `CodemagicApiKey` にすると `codemagic.yaml` 無修正で動く。違う名前なら yaml の `integrations: app_store_connect:` を合わせる）
3. ビルド開始 → `ios-release` ワークフローを実行

CI が自動で行うこと:
- `npm install` → `npm run build:web`（www生成）
- `npx cap add ios`（初回のみネイティブ生成）→ `cap sync`
- 署名証明書・プロファイルを API キーから自動取得（`--create`）
- `.ipa` ビルド → **TestFlight へアップロード**

---

## 2. アイコン・スプラッシュ反映

`appstore/icon-1024.png` と `appstore/splash-2732.png` を `assets/` に置けば
`npx @capacitor/assets generate` が全サイズを自動生成する。
（再生成は手元で `node tools/render_assets.js`）

---

## 3. TestFlight → 審査 → 公開

1. ビルド完了後 **TestFlight** で実機確認（自分のApple IDで）
2. App Store Connect で掲載情報を入力（**別途用意**）:
   - スクリーンショット（6.7"/6.5"/5.5"）
   - 説明文・キーワード・カテゴリ
   - **プライバシーポリシーURL**（必須）・App Privacy（データ収集なし）
   - 年齢レーティング・サポートURL・価格（無料）
3. 「審査へ提出」

### ⚠ 審査の主な注意
- **4.2 最低限の機能**: WebView殻は「ただのWebサイト」と見なされ却下されやすい。
  本アプリは **完全オフライン動作・ローカル同梱** なので有利だが、説明文で
  「ネット不要のオフライン点数管理ツール」を強調すると安全。
- **5.2 知的財産**: 第三者の商標・商標的な画面の流用は不可（別紙のブランディング方針を参照）。
- リモートURL読み込みは避け、必ずローカル同梱（本構成は同梱）。

---

## 更新フロー（リリース後）

1. `index.html` 等を編集（＝Web版と共通の単一ソース）
2. `capacitor.config.json` か iOS の version/build を上げる
3. git push → Codemagic が自動ビルド → TestFlight/審査

> Web版（GitHub Pages）とアプリは同じ `index.html` から作られるので常に同期。
