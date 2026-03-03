

---

# 画面構成（Screen List）

本ドキュメントでは、Security Drillアプリケーションの画面構成と各画面の役割を定義する。

画面は機能ごとに分類され、各画面の目的・要素・遷移先を明確にしている。

---

## 画面一覧（概要） ※adminと一般を分けてリンク

### admin画面（ログイン＋Adminロール必須）

- `/admin/enroll` 登録：訓練対象者のメール登録＋同意取得（→ [Admin1-1](#admin1-1-訓練参加者登録管理者のみ)）
- `/admin` 管理ダッシュボード：管理者ランディング＆Admin配下リンク集（→ [Admin2-1](#admin2-1-ダッシュボード)）
- `/admin/users` 参加者一覧：メール・最新訓練状況・オプトアウト確認/解除（→ [Admin2-2](#admin2-2-参加者一覧)）
- `/admin/users/[id]` 参加者詳細：個別の訓練履歴・クリック/学習/クイズ結果（→ [Admin2-3](#admin2-3-参加者詳細)）
- `/admin/drills` 訓練一覧：送信履歴・クリック有無・合否（→ [Admin2-4](#admin2-4-訓練一覧)）
- `/admin/drills/[id]` 訓練詳細：対象者、送信→クリック→学習のログ、クイズ結果（→ [Admin2-5](#admin2-5-訓練詳細)）
- `/admin/drills/new` 訓練作成：対象選択、シナリオ種別、手動送信（→ [Admin3-1](#admin3-1-訓練作成mvpは手動)）
- `/admin/templates` テンプレ一覧：AI/手動テンプレと承認状態（余力）（→ [Admin4-1](#admin4-1-テンプレ一覧)）
- `/admin/templates/new` テンプレ作成：シナリオ選択、AI生成、承認（余力）（→ [Admin4-2](#admin4-2-テンプレ作成)）

### 一般画面（学習系とエラー・オプトアウトのみゲスト可／他はログイン必須）

- `/` トップ（任意）：アプリ概要・訓練の目的説明（→ [General0-1](#general0-1-レイアウト)）
- `/t/[token]` 訓練リンク入口：クリック計測後に学習へ誘導（token検証）（→ [General1-1](#general1-1-訓練リンク入口)）
- `/learn/[drillId]` 学習説明：危険性の説明とクイズ導線（→ [General2-1](#general2-1-学習説明)）
- `/learn/[drillId]/quiz` セキュリティクイズ：合格点まで再受験可、結果保存（→ [General2-2](#general2-2-セキュリティクイズ)）
- `/learn/[drillId]/complete` 学習完了：合格メッセージと学習ポイント（→ [General2-3](#general2-3-学習完了)）
- `/error/invalid-token` 無効リンク：不正/期限切れtoken時のエラー（→ [General3-1](#general3-1-無効リンク)）
- `/settings/opt-out` オプトアウト：訓練停止申請（任意、推奨）（→ [General3-2](#general3-2-オプトアウト)）

--

## 0. 共通

### 0-0. アクセス制御（必須）

* **基本方針**：**ログイン必須**（画面は全て認証ユーザーのみ）
  * **例外**：**`/learn/*` の学習ページのみゲスト閲覧可**
* **ロール**
  * `Admin`：訓練対象ユーザー登録、訓練配信、結果/クリック状況の閲覧
  * `User`：内部画面閲覧（必要に応じて範囲を制限）
  * `Guest`：`/learn/*` のみ閲覧可能（訓練メールで誘導）
* **導線**
  * 訓練メールは **`/learn/[token or drillId]` に直接リンク**
  * 学習ページ到達時に **クリック判定を記録**
* **認証方式**
  * パスワードレス前提：Google / LINE の外部プロバイダログインを使用（ユーザー入力はメール/Slack登録に限る）
  * セッションにロール（Admin/User）を含め、Middlewareで `/admin/**` を判定
* **未ログイン時の挙動**
  * `/admin/**` アクセス時はログインページへリダイレクト（復帰先として元URLを保持）
* **権限なしの挙動**
  * ログイン済みでも `Admin` 以外が `/admin/**` にアクセスした場合は 403 相当のエラー画面を表示（トップへ戻るリンク付き）

### General0-1. レイアウト

* `/`

  * **ログイン必須のトップ**
  * アプリ概要／訓練の目的説明（ログイン後に表示）
* 共通ヘッダー

  * アプリ名
  * 管理画面リンク（**Adminのみ表示**）

---

## Admin1. 登録（Enroll）

### Admin1-1. 訓練参加者登録（管理者のみ）

* `/admin/enroll`
* 目的：
  * **訓練対象者の登録（Adminが実施）**
  * 配信チャネル選択（メール / Slack いずれか or 両方）

**要素**

* メールアドレス入力（任意：メール配信時は必須）
* Slack ID（またはユーザー名/mentionable ID）入力（任意：Slack配信時は必須）
* 配信チャネル選択（メール / Slack / 両方）
* 登録ボタン
* バリデーション
  * 即時（zod）
  * 送信時（Server Action）

**遷移**

* 成功 → `/admin/users`（同画面でフラッシュメッセージ or ダイアログで完了通知）

**実装詳細**

* Server Action: `app/admin/enroll/actions.ts`
* Feature: `features/enroll`
* バリデーション: `features/enroll/validators`（zod schema）
* UI: `features/enroll/_ui`
* 今後の拡張：Slack配信用のチャネル/IDの正当性チェック、複数チャネル選択時の送信キュー投入

---

## Admin2. 管理画面（Admin）

### Admin2-1. ダッシュボード

* `/admin`
* 役割：
  * 管理者向けランディング
  * Admin配下の各ページへのリンク集（Users / Drills / Templates / 配信作成 など）

**実装詳細**

* Server Component: `app/admin/page.tsx`
* Feature: `features/admin`
* **Adminのみ**

---

### Admin2-2. 参加者一覧

* `/admin/users`
* 内容：

  * ユーザー一覧
  * メールアドレス
  * 最新訓練状況（未送信 / 未学習 / 合格）
  * オプトアウト状態の確認と解除（再開）
    * ユーザーが `/settings/opt-out` で停止した場合、管理者が受信再開を指示できる
  * 個別詳細へのリンク（`/admin/users/[id]`）

**実装詳細**

* Server Component: `app/admin/users/page.tsx`
* Feature: `features/admin`
* `User`テーブルと関連する`Drill`、`QuizAttempt`を結合して表示
* **Adminのみ**

---

### Admin2-3. 参加者詳細

* `/admin/users/[id]`
* 内容：

  * 基本情報（メール、Slack ID など）
  * 訓練履歴（Drillごとの送信日時・クリック有無）
  * 学習/クイズ結果（QuizAttemptのスコア・合否）
  * オプトアウト状態・再開操作

**関連画面**

* `Admin2-2` 参加者一覧：遷移元
* `Admin2-4` 訓練一覧 / `Admin2-5` 訓練詳細：関連ドリルへの導線

**実装詳細**

* Server Component: `app/admin/users/[id]/page.tsx`
* Feature: `features/admin`
* `User` と関連 `Drill`、`Interaction`、`QuizAttempt` を集約表示
* **Adminのみ**

---

### Admin2-4. 訓練一覧

* `/admin/drills`
* 内容：

  * 訓練履歴一覧
  * 対象者
  * 送信日時
  * クリック有無
  * 合格有無

**実装詳細**

* Server Component: `app/admin/drills/page.tsx`
* Feature: `features/admin`
* `Drill`テーブルと関連する`Interaction`、`QuizAttempt`を結合して表示
* **Adminのみ**

---

### Admin2-5. 訓練詳細

* `/admin/drills/[id]`
* 内容：
  * 対象ユーザー
  * 行動ログ（送信 → クリック → 学習）
  * クイズ結果
  * 生成された訓練文面（件名・本文・誘導テキスト）と使用プロンプトの確認・編集・再生成

**関連画面**

* `General1-1` 訓練リンク入口 → `/t/[token]` （クリック計測）
* `General2-1` 学習説明 → `/learn/[drillId]`
* `General2-2` セキュリティクイズ → `/learn/[drillId]/quiz`
* `General2-3` 学習完了 → `/learn/[drillId]/complete`

**実装詳細**

* Server Component: `app/admin/drills/[id]/page.tsx`
* Feature: `features/admin`
* 特定の`Drill`の詳細情報と時系列ログを表示
* LangChain + ローカルLLMで生成した訓練文面を表示し、プロンプト再入力で再生成・手動編集を保存可能にする
* **Adminのみ**

---

## Admin3. 訓練配信（Drill）

### Admin3-1. 訓練作成（MVPは手動）

* `/admin/drills/new`
* 内容：
  * 対象者選択（全員 / ランダム）
  * シナリオ種別（例：パスワード再設定 / 添付ファイル / 請求・見積 / アカウント警告 / 社内ツール通知 / 配送・ギフト など）
  * 送信ボタン

**実装詳細**

* Server Component + Client Component: `app/admin/drills/new/page.tsx`
* Server Action: `app/admin/drills/new/actions.ts`
* Feature: `features/drill`
* MVPでは手動送信を想定（将来的に自動送信ジョブに拡張可能）
* `Drill`レコード作成と`trackingToken`発行
* **Adminのみ**
* 将来構想：
  * ランダム配信 / 不定期送信（BullMQ + Redis 等でジョブ化）
  * シナリオと対象ユーザーのランダム選定
  * ジョブ状態管理（scheduled/processing/done/failed）とリトライ・冪等性
* 訓練内容生成：
  * LangChain を用いてローカル LLM から本文/件名/誘導テキストを生成（シナリオ種別に応じたプロンプトを使用）
  * `features/content`（Admin4）と連携し、生成・承認済みテンプレを選択して送信
  * 作成時に生成した内容を `Admin2-5` 訓練詳細で確認し、プロンプト再入力・再生成・手動修正ができるようにする
  * 具体的なプロンプト戦略（few-shot/RAG/評価など）は [doc/promptStrategy.md](./promptStrategy.md) を参照

---

## Admin4. テンプレ管理（余力）

### Admin4-1. テンプレ一覧

* `/admin/templates`
* 内容：

  * AI生成 / 手動テンプレ一覧
  * 承認状態

**実装詳細**

* Server Component: `app/admin/templates/page.tsx`
* Feature: `features/content`
* `Template`テーブルから一覧を取得
* MVPでは省略可能

---

### Admin4-2. テンプレ作成

* `/admin/templates/new`
* 内容：

  * シナリオ選択
  * AI生成ボタン（LangChain）
  * プレビュー
  * 承認

**実装詳細**

* Server Component + Client Component: `app/admin/templates/new/page.tsx`
* Server Action: `app/admin/templates/new/actions.ts`
* Feature: `features/content`
* LangChain + Ollamaを使用したAI生成機能
* 承認フローを経てから使用可能にする
* MVPでは省略可能

---

## General1. 訓練リンク（Tracking）

### General1-1. 訓練リンク入口

* `/t/[token]`
* 目的：

  * 訓練メッセージ内リンクの遷移先
  * 「踏んだ」判定

**関連画面**

* `Admin2-5` 訓練詳細：クリック・学習ログと紐付け
* `General2-1` 学習説明：クリック後の遷移先

**処理**

* token検証
* `Interaction(click)` 記録（**もしくは `/learn/*` 到達時に記録**）
* 学習ページへ自動遷移

**アクセス制御**

* ゲスト公開は **`/learn/*` のみ**
* `/t/[token]` を使わない構成の場合は廃止可

**実装詳細**

* Server Component: `app/t/[token]/page.tsx`
* Feature: `features/tracking`
* tokenは`Drill`レコードの`trackingToken`と紐づけ
* 無効なtokenの場合は`/error/invalid-token`へリダイレクト

---

## General2. 学習（Learning）

### General2-1. 学習説明

* `/learn/[drillId]`
* 内容：

  * なぜこの行動が危険か
  * 見抜くポイント
  * 次はクイズに進む

**関連画面**

* `Admin2-5` 訓練詳細：学習到達ログを表示
* `General1-1` 訓練リンク入口：ここへの導線
* `General2-2` セキュリティクイズ：次ステップ

**実装詳細**

* Server Component: `app/learn/[drillId]/page.tsx`
* Feature: `features/learning`
* `drillId`から訓練内容を取得して表示
* **ゲスト公開**（訓練メールから直接アクセス）
* **到達時にクリック記録**（`/t/[token]` を廃止する場合）

---

### General2-2. セキュリティクイズ

* `/learn/[drillId]/quiz`
* 内容：

  * 3〜5問の選択式クイズ
  * 合格点（例：80%）

**関連画面**

* `Admin2-5` 訓練詳細：クイズ結果を表示
* `General2-1` 学習説明：前段
* `General2-3` 学習完了：合格後の遷移

**挙動**

* 不合格 → 再受験
* 合格 → 合格画面へ

**実装詳細**

* Server Component + Client Component: `app/learn/[drillId]/quiz/page.tsx`
* Server Action: `app/learn/[drillId]/quiz/actions.ts`
* Feature: `features/learning`
* `QuizAttempt`レコードに結果を保存
* 合格点未満の場合は同ページで再挑戦可能
* **ゲスト公開**

---

### General2-3. 学習完了

* `/learn/[drillId]/complete`
* 内容：

  * 合格メッセージ
  * 今回の学習ポイントまとめ

**関連画面**

* `Admin2-5` 訓練詳細：最終結果として表示
* `General2-2` セキュリティクイズ：合格後の遷移元

**実装詳細**

* Server Component: `app/learn/[drillId]/complete/page.tsx`
* Feature: `features/learning`
* 合格後のフィードバック画面
* **ゲスト公開**

---

## General3. エラー・その他

### General3-1. 無効リンク

* `/error/invalid-token`
* 内容：

  * 無効または期限切れの訓練リンク

**実装詳細**

* Server Component: `app/error/invalid-token/page.tsx`
* 無効なtokenで`/t/[token]`にアクセスした場合のエラー画面

---

### General3-2. オプトアウト

* `/settings/opt-out`
* 内容：

  * 訓練停止
  * 理由（任意）
  * **管理者による解除（再開）は `/admin/users` から実施**

**実装詳細**

* Server Component + Client Component: `app/settings/opt-out/page.tsx`
* Server Action: `app/settings/opt-out/actions.ts`
* Feature: `features/enroll`（または新規feature）
* ユーザーが訓練の受信を停止できる機能
* MVPでは省略可能だが、セキュリティ訓練の倫理的な観点から推奨

---

## MVPで「必須」なのはどこ？

### 最小成立セット

以下の画面があれば、訓練の基本的な流れ（登録→配信→クリック計測→学習→集計）が成立する：

* `/admin/enroll` - 参加者登録（管理者が代行）
* `/t/[token]` - 訓練リンク入口（クリック計測）
* `/learn/[drillId]/quiz` - セキュリティクイズ
* `/admin`（簡易） - 管理ダッシュボード

### コンテスト映えセット

最小成立セットに加えて、以下の画面があるとデモでより映える：

* `/admin/users` - 参加者一覧
* `/admin/drills` - 訓練一覧

### 実装優先順位

詳細は [plan/override.md](../plan/override.md) を参照。

1. Day 1: `/admin/enroll` の実装
2. Day 2: `/t/[token]` の実装
3. Day 3: `/learn/[drillId]/quiz` の実装
4. Day 4: `/admin` の実装
5. Day 5: `/admin/drills/new` の実装（手動配信）

---

## 関連ドキュメント

* [アーキテクチャ概要](./architecture.md)
* [プロダクト概要](./product.md)
* [実装プラン](../plan/override.md)

---
