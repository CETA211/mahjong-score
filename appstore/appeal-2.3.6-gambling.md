# Guideline 2.3.6（Gambling）リジェクトへの返信文

- 対象: Submission ID `a2be13a8-4463-4f4b-a0f8-95fd06e034f0` / Version 1.0
- 作成日: 2026-07-28
- 前提: **年齢制限アンケートは変更しない**（Gambling=No / Simulated Gambling=NONE / Loot Boxes=No のまま）

> ⚠️ **Gambling=Yes には絶対にしないこと。**
> 新レーティング体系で 18+ 固定になるうえ、Guideline 5.1.1(ix)（ギャンブル等の高度規制分野は法人が提出すべきで個人開発者は不可）に抵触し、
> 個人名義では公開自体ができなくなる。指示どおり変更して「個人開発者のギャンブルアプリは受け付けない」とより重いリジェクトに悪化した実例がある。

---

## 送信前チェックリスト

- [ ] メタデータ修正を App Store Connect に反映（セカンダリカテゴリ「ゲーム」を外す / キーワード「雀荘」削除 / 説明文の「精算」→「最終スコア集計」・「グループチャットへ」削除）
- [ ] 審査メモを英語詳細版（listing.md 参照）に差し替え
- [ ] アプリ内文言を修正した**新ビルド 1.0(10) を提出**（下の英文は「アプリと説明文の両方で改名した」と書いているため）
- [ ] 添付: 全画面のスクリーンショット（**設定画面を必ず含める**＝レート/金額/賭け金の項目が存在しない証明）
- [ ] 添付または本文: 操作録画（60秒程度）の限定公開URL ※Resolution Center は動画添付非対応なのでURLをテキストで貼る
- [ ] 本文に**競合アプリとの比較は書かない**（Apple は他社比較を嫌い、藪蛇になる）

---

## 返信文（英語・そのまま貼る）

```
Thank you for the additional review. We respectfully ask you to reconsider, as we believe the Gambling descriptor does not apply to this app.

Tenbo Irazu is an offline scoreboard for the tabletop game mahjong. It replaces the physical point sticks used at the table: users swipe between two player cards to move points. Mahjong itself cannot be played in the app.

The app contains no money, price, currency, exchange rate, or stake setting; no betting, wagering, odds, predictions, or tips; no way to purchase, redeem, or convert points into anything of value; and no in-app purchase, advertising, account, or network connection of any kind. We searched the entire source code and every UI string for money, bet, wager, stake, odds, casino, gambling, rate, and their Japanese equivalents: zero occurrences.

"Uma" and "Oka" are the standard ranking-point rules of Japanese mahjong. When a game ends, raw points are converted into unitless ranking points based on finishing order (+15/+5/-5/-15). They are not money and cannot be exchanged for anything. The same rules are used in non-wagering professional competition such as the M.LEAGUE.

To remove any translation ambiguity, we have renamed the Japanese term "seisan" - which can machine-translate as "payment settlement" - to "final score summary" in the app and in the App Store description, and we removed the secondary category "Games."

App Store Connect defines Gambling as "betting or wagering using real money or in-game currency that may be exchanged for real money." Neither exists here, so "No" is the accurate answer that Guideline 2.3.6 requires.

Screenshots of every screen, including Settings, are attached. If any specific screen or string still appears to indicate real-money gambling, please tell us which one and we will change it immediately.
```

## 同内容（日本語版・日本語で返信する場合）

```
再度のご審査ありがとうございます。「ギャンブル」の該当表示について、本アプリには当てはまらないと考えておりますので、恐れ入りますが再検討をお願いいたします。

「点棒いらず」は、卓上ゲームである麻雀のための完全オフラインのスコアボードです。卓上で使う物理的な点棒を置き換えるもので、プレイヤーのカード間をスワイプして点数を移動させるツールです。アプリ内で麻雀をプレイすることはできません。

本アプリには、金銭・価格・通貨・換算レート・賭け金の設定は一切ありません。賭け、ベット、オッズ、勝敗予想、予想情報の機能もありません。点数を購入・換金・価値あるものへ変換する手段もありません。アプリ内課金、広告、アカウント、ネットワーク通信もいずれも存在しません。ソースコード全文とすべてのUI文字列を money / bet / wager / stake / odds / casino / gambling / rate および日本語の該当語で検索しましたが、該当は0件です。

「ウマ」「オカ」は日本の麻雀における標準的な順位点ルールです。対局終了時に素点を順位に応じた単位のない順位点（+15/+5/−5/−15）へ換算するもので、金銭ではなく、何かと交換することもできません。同じルールは賭博性のないプロ競技（Mリーグ等）でも使用されています。

翻訳上の誤解を避けるため、「payment settlement」と機械翻訳されうる「精算」という語を、アプリ内および App Store の説明文において「最終スコア集計」へ変更しました。あわせてセカンダリカテゴリ「ゲーム」も外しております。

App Store Connect における Gambling の定義は「現実の通貨、または現実の通貨に換金可能なゲーム内通貨を使用する賭博または賭け事」です。本アプリにはそのいずれも存在しないため、ガイドライン 2.3.6 が求める正直な回答は「No」であると考えます。

設定画面を含む全画面のスクリーンショットを添付いたします。もし特定の画面または文字列が実マネー賭博に該当するとご判断されている場合は、どの箇所かをお示しいただければ直ちに修正いたします。
```

---

## 第2段: 同じ定型文で再リジェクトされた場合（Board へ行く前に1回だけ）

Apple は今回「どの画面・どの文字列が該当か」を一切示していない。具体箇所の明示を求めるのは正当な要求で、
テンプレ返信を人力回答に切り替えさせる有効な手。**短く1点だけ**聞く。

```
Could you please identify the specific screen or the specific string in the app that is considered a tip, tool, or prediction related to real money gambling? We will change it immediately.
```

## 第3段: App Review Board へのアピール

- 送信先: https://developer.apple.com/contact/app-store/?topic=appeal
- **1リジェクトにつき1回のみ**。証拠（全画面スクショ・操作録画・1ページの機能一覧）が揃ってから撃つ
- 本文に必ず入れる: ①Resolution Center で提出した内容と日付、②同一の定型文が返ってきた事実、
  ③個人開発者のため Gambling=Yes は 5.1.1(ix) と衝突する点

```
App: Tenbo Irazu, Version 1.0, Submission ID a2be13a8-4463-4f4b-a0f8-95fd06e034f0,
rejected under Guideline 2.3.6.

We are appealing because the "Gambling" descriptor was applied to functionality the app
does not have. The app is an offline mahjong scoreboard: it records point transfers
between players with swipes and, at the end of a game, converts raw points into unitless
ranking points (Uma/Oka) to show the finishing order. It contains no real money, no
in-app currency, no purchase, no advertising, no account, no odds, no predictions, and no
network communication of any kind.

App Store Connect defines Gambling as "betting or wagering using real money or in-game
currency that may be exchanged for real money," and none of these elements exist in the app.

In Resolution Center on [DATE] we provided screenshots of every screen and a full screen
recording, and we reworded the Japanese term "seisan" (which can machine-translate as
"payment settlement") to "final score summary" in both the app and its metadata. We
received the same templated response.

We are also an individual developer, so declaring "Yes" for Gambling would describe
content the app does not contain while placing it in conflict with Guideline 5.1.1(ix).

We respectfully ask the Board to re-evaluate the age rating answers as submitted, or to
identify the specific screen or string that is considered real-money gambling so that we
can change it.

Attachments: full screenshot set, screen recording, one-page feature list.
```

---

## 第4段以降（撤退ライン: 往復2回・2週間を目安に判断）

1. **年齢下限の手動引き上げ**: アンケートは No のまま維持し、Apple の「自社ポリシーとしてより高い最低年齢を設定できる」機能で 13+/16+ に自主設定する。
   Gambling=Yes（→18+ ＋ 5.1.1(ix) 発動）を回避しつつ、形式的に指摘へ応える妥協案。※2.3.6 を満たす公式保証はない
2. **機能削減版で通す**: ウマ・オカの順位点換算を外し、素点集計と順位表示だけで提出 → 承認後にアップデートで正規に追加。
   ※「審査を欺いて後で有効化する」書き方は絶対にしない（アカウント停止リスク）

**Web版(PWA)は https://ceta211.github.io/mahjong-score/ で稼働中**。App Store 公開が遅れても機能提供は止まらないので、
焦って Gambling=Yes に折れる必要はない。
