# App Store 掲載情報 — 点棒いらず

App Store Connect に入力する内容のまとめ。日本語（プライマリ）。

## 基本

| 項目 | 内容 |
|------|------|
| App名（30字以内） | 点棒いらず |
| サブタイトル（30字以内） | 麻雀の点数をスワイプで管理 |
| バンドルID | com.cetacompany.tenboirazu |
| プライマリカテゴリ | ユーティリティ |
| セカンダリカテゴリ | **設定しない**（ユーティリティ単独。※「ゲーム」にするとCasino/賭博系の審査基準が引かれやすいため 2026-07-28 に外した） |
| 価格 | 無料 |
| 年齢レーティング | 4+（Gambling=No / Simulated Gambling=NONE / Loot Boxes=No。実マネー・換金可能なゲーム内通貨とも非搭載のためAppleの定義に非該当） |
| 対応言語 | 日本語 |
| 対応デバイス | iPhone / iPad（縦・横対応。横画面は卓中央表示モード） |
| Copyright | 2026 CETAcompany |

## キーワード（100字以内・カンマ区切り）

```
麻雀,点数,点数計算,点棒,スコア,得点,計算機,順位点,半荘,東風,符,役満,リーチ,ツモ,ロン
```

## プロモーションテキスト（170字以内・審査不要で随時更新可）

```
点棒の受け渡しはもう不要。プレイヤーをスワイプするだけで点数が移動。ロン・ツモ・リーチ・流局・本場・親の進行まで自動。ウマ・オカ込みの最終スコア集計もワンタップ。ネット不要・完全オフラインで動作します。
```

## 説明文（Description）

```
■ 点棒の受け渡し、もうやめませんか？

「点棒いらず」は、麻雀の点数管理に特化したシンプルなツールです。
点棒を数えたり受け渡したりする手間をなくし、対局のテンポを止めません。

■ 直感操作
・支払う人 → 相手へスワイプするだけで点数移動（ロン）
・カードを2回タップでツモ入力
・点数表から飜・符を選ぶだけ。手入力もOK

■ 対局進行まで自動
・親の連荘／流れ、局（東1〜南4）、本場を自動でカウント
・立直で供託を管理、和了時に自動回収
・流局はテンパイ者を選ぶだけでノーテン罰符を自動分配

■ 最終スコア集計もワンタップ
・素点・ウマ・オカ（日本式の順位点ルール）を自動計算し、順位と pt（単位なしのポイント）を表示
・対局結果（順位・pt）はコピー／共有できます
・四人麻雀／三人麻雀、東風戦／半荘戦に対応
・ルールは「標準」「競技」から選択（ウマ・オカ・切り上げ満貫・飛び・途中流局の扱いが変化）

■ うれしい工夫
・横画面にすると卓の中央に置いて4人で使える「卓中央モード」
・3つのテーマ（和／グリーン／ライト）
・対局の途中で閉じても点数・局・本場を自動保存
・操作の取り消し／やり直し、対局履歴

■ 安心
・ネット接続不要、完全オフラインで動作
・広告なし／アカウント登録なし／個人情報の収集なし

※本アプリは点数の記録・計算のみを行うツールです。金銭のやり取り、レート・賭け金の設定、換金、勝敗予想の機能は一切ありません。特定の麻雀ゲーム・大会・団体とも関係ありません。
```

## サポートURL / マーケティングURL

- サポートURL: https://ceta211.github.io/mahjong-score/support.html  （使い方・問い合わせ先を掲載）
- プライバシーポリシーURL: https://ceta211.github.io/mahjong-score/privacy-policy.html

## App Privacy（プライバシー栄養ラベル）

**回答: Data Not Collected（データを収集していません）**

- トラッキングなし／広告なし／解析(SDK)なし
- 入力データ（プレイヤー名・点数・設定）は端末内の localStorage に保存し、外部送信なし
- ネットワーク通信を行わない（完全オフライン）

## 審査メモ（App Review Information の「メモ」欄に貼る・英語）

> 2026-07-28 更新: Guideline 2.3.6（Gambling）の指摘を受け、「何であるか」を先に述べる構成へ全面改訂。
> 否定文の中で gambling を連呼しない構成にしてある（自動フラグ対策）。

```
Tenbo Irazu is a fully offline scoreboard for the tabletop game mahjong.
It replaces the physical point sticks (tenbo) used at the table.

What it does:
- Swipe between two player cards to move points from one player to another.
- Double-tap a card to enter a self-draw.
- Automatically tracks the dealer, hand number, honba counter and riichi deposits.
- At the end of a game, converts raw points into unitless ranking points
  (Uma/Oka) to display the finishing order.

What it does NOT contain:
- No real money, price, currency, exchange rate or stake setting of any kind.
- No betting, wagering, odds, predictions or tips.
- No purchase, redemption or conversion of points into anything of value.
- No in-app purchase, no advertising, no account, no analytics.
- No network connection at all: the app works entirely in airplane mode
  and never sends or receives any data.

About Uma and Oka:
These are the standard ranking-point rules of Japanese mahjong. At the end of a
game each player's raw score is converted into unitless ranking points according
to finishing position (e.g. +15/+5/-5/-15). They are not money and cannot be
exchanged for anything. The same rules are used in officially sanctioned,
non-wagering professional competition such as the M.LEAGUE.

How to verify:
1. Launch the app in airplane mode.
2. Swipe from one player card to another to move points.
3. Tap "Final score summary" to see the finishing order and pt values.
The Settings screen contains no rate, money or stake option of any kind.
```

## バージョン情報

- バージョン: 1.0.0
- このバージョンの新機能（What's New）: 「初回リリース」
