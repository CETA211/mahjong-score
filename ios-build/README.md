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
- `npm ci`（package-lock.json による決定的インストール）→ `npm run build:web`（www生成）
- `npx cap add ios`（毎回ネイティブ雛形を再生成）→ `cap sync`
- **輸出コンプライアンス回答の焼き込み**（ITSAppUsesNonExemptEncryption=false。Missing Compliance で配信が止まるのを防止）
- **バージョン設定**: CFBundleShortVersionString = package.json の version / CFBundleVersion = Codemagic の $BUILD_NUMBER（毎ビルド自動増加）
- 署名証明書・プロファイルを API キーから自動取得（`--create`）
- `.ipa` ビルド → **TestFlight へアップロード**

> 初回アップロード後、App Store Connect から ITMS-91053（プライバシーマニフェスト）警告メールが来ていないか確認すること。
> 来た場合は codemagic.yaml に PrivacyInfo.xcprivacy をコピーするステップを追加する（Capacitor 6 の各Podは自前のマニフェストを同梱済みのため通常は不要）。

---

## 2. アイコン・スプラッシュ反映

`appstore/icon-1024.png` と `appstore/splash-2732.png` を `assets/` に置けば
`npx @capacitor/assets generate` が全サイズを自動生成する。
（再生成は手元で `node tools/render_assets.js`）

---

## 3. TestFlight → 審査 → 公開

1. ビルド完了後 **TestFlight** で実機確認（自分のApple IDで）
2. App Store Connect で掲載情報を入力（**別途用意**）:
   - スクリーンショット: iPhone用（1290×2796 = `appstore/screenshots/6.7/`）と 13インチiPad用（2064×2752 = `appstore/screenshots/13/`）の2セット、いずれも作成済み。6.5"/5.5"は現行仕様では不要
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
2. ユーザーに見せるバージョンを上げる場合のみ `package.json` の `version` を更新
   （ビルド番号は Codemagic の `$BUILD_NUMBER` で毎回自動増加するので手動更新は不要）
3. main へ git push → Codemagic が自動ビルド（codemagic.yaml の `triggering` 設定済み）→ TestFlight/審査

> Web版（GitHub Pages）とアプリは同じ `index.html` から作られるので常に同期。
> ローカルで Capacitor を触るときは素の `npx cap sync` ではなく **必ず `npm run sync`** を使うこと（www/ が古いままネイティブに同梱される事故を防ぐ）。
