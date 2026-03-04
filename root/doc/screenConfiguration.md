---
# 画面構成（Screen List）

本ドキュメントでは、Security Drillアプリケーションの画面構成と各画面の役割を定義する。

画面は機能ごとに分類され、各画面の目的・要素・遷移先を明確にしている。
---

## 画面一覧（概要） ※adminと一般を分けてリンク

### admin画面（ログイン＋Adminロール必須）

- `/admin` 管理ダッシュボード：管理者ランディング＆Admin配下リンク集（→ [Admin0-1](#admin0-1-ダッシュボード)）
- `/admin/scenarios` シナリオ管理（将来実装）：シナリオの CRUD 管理（→ [Admin0-0](#admin0-0-シナリオ管理将来実装)）
- `/admin/enroll` 登録：訓練対象者のメール登録＋同意取得（→ [Admin1-1](#admin1-1-訓練参加者登録管理者のみ)）
- `/admin/users` 参加者一覧：メール・最新訓練状況・オプトアウト確認/解除（→ [Admin2-1](#admin2-1-参加者一覧)）
- `/admin/users/[id]` 参加者詳細：個別の訓練履歴・クリック/学習/クイズ結果（→ [Admin2-2](#admin2-2-参加者詳細)）
- `/admin/drills` 訓練一覧：送信履歴・クリック有無・合否・承認状態（→ [Admin3-1](#admin3-1-訓練一覧)）
- `/admin/drills/create` 訓練作成：シナリオ選択→AI生成→承認→対象/チャネル選択→送信（→ [Admin3-2](#admin3-2-訓練作成)）
- `/admin/drills/[id]` 訓練詳細：訓練内容・行動ログ・クイズ結果確認（→ [Admin3-3](#admin3-3-訓練詳細)）
- `/admin/drills/[id]/edit` 訓練編集・配信：訓練内容編集→再配信設定→送信（→ [Admin3-4](#admin3-4-訓練編集配信)）

### 一般画面（学習系とエラー・オプトアウトのみゲスト可／他はログイン必須）

- `/` トップ（任意）：アプリ概要・訓練の目的説明・最近実施されたdrill概要（→ [General0-1](#general0-1-レイアウト)）
- `/t/[token]` 訓練リンク入口：クリック計測後に学習へ誘導（token検証）（→ [General1-1](#general1-1-訓練リンク入口)）
- `/learn/[drillId]` 学習説明：危険性の説明とクイズ導線（→ [General2-1](#general2-1-学習説明)）
- `/learn/[drillId]/quiz` セキュリティクイズ：合格点まで再受験可、結果保存（→ [General2-2](#general2-2-セキュリティクイズ)）
- `/learn/[drillId]/complete` 学習完了：合格メッセージと学習ポイント（→ [General2-3](#general2-3-学習完了)）
- `/error/invalid-token` 無効リンク：不正/期限切れtoken時のエラー（→ [General3-1](#general3-1-無効リンク)）
- `/settings/opt-out` オプトアウト：訓練停止申請（任意、推奨）（→ [General3-2](#general3-2-オプトアウト)）

--

## 0. 共通

### 0-0. アクセス制御（必須）

- **基本方針**：**ログイン必須**（画面は全て認証ユーザーのみ）
  - **例外**：**`/learn/*` と `/t/*` のみゲスト閲覧可**
- **ロール**
  - `Admin`：訓練対象ユーザー登録、訓練配信、結果/クリック状況の閲覧
  - `User`：内部画面閲覧（必要に応じて範囲を制限）
- `Guest`：`/learn/*` と `/t/*` のみ閲覧可能（訓練メールで誘導）
- **導線**
- 訓練メールは **`/t/[token]` または `/learn/[token or drillId]` に直接リンク**
  - 学習ページ到達時に **クリック判定を記録**
- **認証方式**（詳細：[認証・認可仕様](./auth.md)）
  - パスワードレス前提：Google / LINE の外部プロバイダログインを使用（ユーザー入力はメール/Slack登録に限る）
  - セッションにロール（Admin/User）を含め、Middlewareで `/admin/**` を判定
- **未ログイン時の挙動**
  - `/admin/**` アクセス時は画面上にログインモーダルを表示（別ページへのリダイレクトは行わず、元URLを保持）
- **権限なしの挙動**
  - ログイン済みでも `Admin` 以外が `/admin/**` にアクセスした場合は 403 相当のエラー画面を表示（トップへ戻るリンク付き）

---

## Admin0. シナリオ管理（Scenarios）※将来拡張予定

### Admin0-0. シナリオ管理（将来実装）

- `/admin/scenarios`（将来実装）
- 役割：
  - セキュリティ訓練のシナリオを CRUD 管理
  - 月1回程度の更新に対応
- 予定内容：
  - シナリオ一覧表示
  - 新規シナリオ作成：シナリオ名、説明、プロンプトテンプレート入力
  - 既存シナリオ編集：内容更新、ステータス管理
  - シナリオ削除
- 実装時期：MVP 完成後、運用開始の段階で追加検討

---

## Admin0. ダッシュボード（Admin）

### Admin0-1. ダッシュボード

- `/admin`
- 役割：
  - 管理者向けランディング
  - Admin配下の各ページへのリンク集（Users / Drills / Templates / 配信作成 など）

**実装詳細**

- Server Component: `app/admin/page.tsx`
- Feature: `features/admin`
- **Adminのみ**

---

## Admin1. 登録（Enroll）

### Admin1-1. 訓練参加者登録（管理者のみ）

- `/admin/enroll`
- 目的：
  - **訓練対象者の登録（Adminが実施）**
  - 配信チャネル選択（メール / Slack いずれか or 両方）

**要素**

- メールアドレス入力（必須）
- Slack ID（またはユーザー名/mentionable ID）入力（任意：Slack配信時は必須）
- 配信チャネル選択（メール / Slack / 両方）
- 参加同意チェック（必須）
- 登録ボタン
- バリデーション
  - 即時（zod）
  - 送信時（Server Action）

**遷移**

- 成功 → `/admin/users`（同画面でフラッシュメッセージ or ダイアログで完了通知）

**実装詳細**

- Server Action: `app/admin/enroll/actions.ts`
- Feature: `features/enroll`
- バリデーション: `features/enroll/validators`（zod schema）
- UI: `features/enroll/_ui`
- 今後の拡張：Slack配信用のチャネル/IDの正当性チェック、複数チャネル選択時の送信キュー投入
- **Adminのみ**

---

## Admin2. 参加者管理（Users）

### Admin2-1. 参加者一覧

- `/admin/users`
- 内容：
  - ユーザー一覧
  - メールアドレス
  - 最新訓練状況（未送信 / 未学習 / 合格）
  - 権限（Role）の確認・変更（Admin / User）
    - 一般ユーザーを Admin に昇格させる機能を備える
  - オプトアウト状態の確認と解除（再開）
    - ユーザーが `/settings/opt-out` で停止した場合、管理者が受信再開を指示できる
  - 個別詳細へのリンク（`/admin/users/[id]`）

**実装詳細**

- Server Component: `app/admin/users/page.tsx`
- Feature: `features/admin`
- `User`テーブルと関連する`Drill`、`QuizAttempt`を結合して表示
- **Adminのみ**

---

### Admin2-2. 参加者詳細

- `/admin/users/[id]`
- 内容：
  - 基本情報（メール、Slack ID、権限 など）
  - 権限（Role）の変更（Admin / User）
  - 訓練履歴（Drillごとの送信日時・クリック有無）
  - 学習/クイズ結果（QuizAttemptのスコア・合否）
  - オプトアウト状態・再開操作

**関連画面**

- `Admin2-1` 参加者一覧：遷移元
- `Admin3-1` 訓練一覧 / `Admin3-2` 訓練詳細兼生成/配信：関連ドリルへの導線

**実装詳細**

- Server Component: `app/admin/users/[id]/page.tsx`
- Feature: `features/admin`
- `User` と関連 `Drill`、`Interaction`、`QuizAttempt` を集約表示
- **Adminのみ**

---

## Admin3. 訓練管理（Drills）

### Admin3-1. 訓練一覧

- `/admin/drills`
- 内容：
  - 訓練履歴一覧
  - 対象者
  - 送信日時
  - クリック有無
  - 合格有無
  - シナリオ種別・配信チャネル（メール/Slack）
  - 承認状態（ドラフト/承認済み/送信済み/失敗）
  - 新規作成ボタン → `/admin/drills/create` へ遷移（Admin3-2）

**実装詳細**

- Server Component: `app/admin/drills/page.tsx`
- Feature: `features/admin`
- `Drill` と関連する `Interaction`、`QuizAttempt` を結合して表示
- **Adminのみ**

---

### Admin3-2. 訓練作成

- `/admin/drills/create`
- 役割：
  - 新規訓練の作成・設定・配信を一連で完結させる
  - ステータス遷移：Draft → Deliverable → Delivering
- **MVP注記**：固定クイズを使用し、作成と同時に配信（AI生成は準備中）。
- 内容：
  - **シナリオ選択**
    - MVP では固定シナリオをドロップダウンで選択
    - 例：パスワード再設定 / 添付ファイル / 請求・見積 / アカウント警告 / 社内ツール通知 / 配送・ギフト など
    - 将来：`/admin/scenarios` でシナリオの CRUD 管理を実装予定
  - **AI生成**（LangChain + ローカルLLM；few-shot/RAG/評価は [doc/features/promptStrategy.md](./features/promptStrategy.md)）
    - 訓練メール：件名/本文/誘導テキスト自動生成
    - セキュリティクイズ：問題文/選択肢/正解/解説自動生成（出題形式は LLM が single/multiple/text を決定）
  - **メール内容の表示・編集**
    - AI生成結果を表示
    - **手動で件名/本文/誘導テキストを編集可能**
    - **「AI再生成」ボタン**でプロンプト変更＆再生成可能
  - **クイズ内容の表示・編集**（詳細は [doc/drills/quizSpecification.md](./drills/quizSpecification.md) を参照）
    - AI生成結果を表示
    - **手動で問題文/出題形式(single/multiple/text)/選択肢/正解/解説を編集可能**
    - **「AI再生成」ボタン**でプロンプト変更＆再生成可能
  - **「保存」ボタン** → バリデーション無し、Draft ステータスで保存
  - **「配信可能にする」ボタン** → 必須項目をチェック
    - ✅ 成功：全て入力 → **Deliverable へ昇格**
    - ❌ 失敗：不足あり → エラーメッセージ表示、Draft のまま
  - **「配信する」ボタン**（Deliverable 状態のみ有効）
    - 対象者選択：全員 / ランダム / 個別
    - チャネル選択：メール / Slack / 両方
    - 送信タイミング：即時 / 指定時刻
    - 送信実行 → **Delivering へ遷移** → `/admin/drills/[id]` へリダイレクト

**必須項目**（バリデーション対象）:

- **メール必須項目**
  - 件名（Subject）：空でない
  - 本文（Body）：空でない
  - 誘導テキスト（Guidance Text）：空でない
- **クイズ必須項目（MVPは single/multiple のみ有効）**
  - 問題文（Questions）：空でない
  - 出題形式（Question Type）：`single_choice` / `multiple_choice`（`text` は将来拡張。DBは対応済み）
  - 選択肢（single/multiple の場合）：2個以上、各選択肢が空でない。正解は1つ以上（single=1、multiple=1..N）
  - 解説（Explanation）：空でない

**関連画面**

- `Admin3-1` 訓練一覧：遷移元
- `Admin3-3` 訓練詳細：送信後の遷移先
- `General1-1` 訓練リンク入口 → `/t/[token]`
- `General2-1/2/3` 学習・クイズ・完了

**実装詳細**

- **Adminのみ**
- Server Component + Client Component: `app/admin/drills/create/page.tsx`
- Server Action: `app/admin/drills/create/actions.ts`
- Feature: `features/drill`
- `Drill` レコードと `trackingToken` を発行し、送信までを完結

---

### Admin3-3. 訓練詳細

- `/admin/drills/[id]`
- 内容：
  - 訓練基本情報（シナリオ、送信日時、対象者数など）
  - 訓練メール内容（件名、本文、誘導テキスト）
  - セキュリティクイズ内容（問題文、選択肢、正解、解説）
  - 行動ログ（送信 → クリック → 学習）
  - クイズ結果（ユーザーごとのスコア、合否、再受験状況、ユーザー選択肢との比較）
  - 「編集」ボタン → `/admin/drills/[id]/edit` へ遷移
- 役割：
  - 配信済み訓練の詳細・ログ・結果確認
  - 訓練の実施状況を可視化

**関連画面**

- `Admin3-1` 訓練一覧：遷移元
- `Admin3-4` 訓練編集・配信：編集・再配信時の遷移先

**実装詳細**

- **Adminのみ**
- Server Component: `app/admin/drills/[id]/page.tsx`
- Feature: `features/drill`
- `Drill` レコードと関連する `Interaction`、`QuizAttempt`、`ApprovalHistory` を表示

---

### Admin3-4. 訓練編集・配信

- `/admin/drills/[id]/edit`
- 役割：
  - 配信可能な訓練の編集・再配信
  - ステータス遷移：Deliverable → Delivering
- **MVP注記**：編集・再配信は準備中。現状は案内画面のみ表示。
- 内容：
  - 現在のステータスを表示（Deliverable / Delivering）
  - **メール内容の編集**
    - 既存の件名/本文/誘導テキストを表示
    - **手動で各項目を編集可能**
    - **「AI再生成」ボタン**でプロンプト変更＆再生成可能
  - **クイズ内容の編集**
    - 既存の問題文/選択肢/正解/解説を表示
    - **手動で各項目を編集可能**
    - **「AI再生成」ボタン**でプロンプト変更＆再生成可能
  - **「保存」ボタン** → バリデーション無し、ステータス維持（Deliverable / Delivering のまま）
  - **「配信する」ボタン**（Deliverable 状態のみ有効）
    - 対象者選択：全員 / ランダム / 個別
    - チャネル選択：メール / Slack / 両方
    - 送信タイミング：即時 / 指定時刻
    - 送信実行 → **Delivering へ遷移** → `/admin/drills/[id]` へリダイレクト
  - **「配信停止」ボタン**（Delivering 状態のみ有効）
    - 配信を停止 → **Stopped へ遷移** → `/admin/drills/[id]` へリダイレクト
  - **Delivering 状態での編集**
    - 訓練内容の編集は可能（配信中でも修正可）
    - 新規配信はできない（配信中は自動配信のみ）

**関連画面**

- `Admin3-3` 訓練詳細：遷移元・リダイレクト先

**実装詳細**

- **Adminのみ**
- Server Component + Client Component: `app/admin/drills/[id]/edit/page.tsx`
- Server Action: `app/admin/drills/[id]/edit/actions.ts`
- Feature: `features/drill`
- 将来構想：
  - ランダム配信 / 不定期送信（BullMQ + Redis 等でジョブ化）
  - シナリオと対象ユーザーのランダム選定
  - ジョブ状態管理（scheduled/processing/done/failed）とリトライ・冪等性

---

### General0-1. レイアウト

- `/`
  - **ログイン必須のトップ**
  - アプリ概要／訓練の目的説明（ログイン後に表示）
  - **最近実施されたdrill概要パネル（Admin向け）**
    - 表示内容：
      - 最新のdrill名
      - 送信日時
      - 参加人数（対象者数）
    - 詳細確認への導線：「詳細を見る」リンク → `/admin/drills` へ遷移
    - 各ユーザーの個別実施状況（クリック有無・学習実施・クイズ合否）は `/admin/drills/[id]` で確認

- 共通ヘッダー
  - アプリ名
  - 管理画面リンク（**Adminのみ表示**）

---

## General1. 訓練リンク（Tracking）

### General1-1. 訓練リンク入口

- `/t/[token]`
- 目的：
  - 訓練メッセージ内リンクの遷移先
  - 「踏んだ」判定

**関連画面**

- `Admin3-2` 訓練詳細兼生成/配信：クリック・学習ログと紐付け
- `General2-1` 学習説明：クリック後の遷移先

**処理**

- token検証
- `Interaction(click)` 記録（**もしくは `/learn/*` 到達時に記録**）
- 学習ページへ自動遷移

**アクセス制御**

- ゲスト公開は **`/learn/*` と `/t/*` のみ**
- `/t/[token]` を使わない構成の場合は廃止可

**実装詳細**

- Server Component: `app/t/[token]/page.tsx`
- Feature: `features/tracking`
- tokenは`Drill`レコードに加え、必要に応じて`drill_recipients`に紐づけ
- 無効なtokenの場合は`/error/invalid-token`へリダイレクト

---

## General2. 学習（Learning）

### General2-1. 学習説明

- `/learn/[drillId]`
- 内容：
  - なぜこの行動が危険か
  - 見抜くポイント
  - 次はクイズに進む

**関連画面**

- `Admin3-2` 訓練詳細兼生成/配信：学習到達ログを表示
- `General1-1` 訓練リンク入口：ここへの導線
- `General2-2` セキュリティクイズ：次ステップ

**実装詳細**

- Server Component: `app/learn/[drillId]/page.tsx`
- Feature: `features/learning`
- `drillId`から訓練内容を取得して表示
- **ゲスト公開**（訓練メールから直接アクセス）
- **到達時にクリック記録**（`/t/[token]` を廃止する場合）

---

### General2-2. セキュリティクイズ

- `/learn/[drillId]/quiz`
- 内容：
  - 3〜5問のクイズ（出題形式は LLM が single_choice / multiple_choice / text を決定）
  - 合格点：80点以上
  - 受験履歴管理：複数回受験時の全回答を記録
  - LLM による詳細フィードバック（詳細は [doc/drills/quizSpecification.md](./drills/quizSpecification.md) を参照）

**関連画面**

- `Admin3-3` 訓練詳細：クイズ結果を表示
- `General2-1` 学習説明：前段
- `General2-3` 学習完了：合格後の遷移

**挙動**

- 不合格 → 再受験（受験回数制限なし）
  - LLM がこれまでの受験パターンを分析
  - 「〇〇が弱いようです」という改善ポイントをフィードバック
- 合格 → 合格画面へ
  - 受験履歴全体の分析フィードバック表示

**実装詳細**

- Server Component + Client Component: `app/learn/[drillId]/quiz/page.tsx`
- Server Action: `app/learn/[drillId]/quiz/actions.ts`
- Feature: `features/learning`
- `QuizAttempt`レコードに複数回答を保存
- 合格点未満の場合は同ページで再挑戦可能
- LLM による受験履歴分析 → フィードバック生成（`features/learning/feedbackAnalysis`）
- **ゲスト公開**
- **token をクエリで引き継ぐ**（`/t/[token]` → `/learn/[drillId]?token=...` → `/quiz?token=...`）

---

### General2-3. 学習完了

- `/learn/[drillId]/complete`
- 内容：
  - 合格メッセージ
  - 最終スコア・受験回数表示
  - LLM による受験履歴分析フィードバック（詳細は [doc/drills/quizSpecification.md](./drills/quizSpecification.md) を参照）
    - 強み（できていたこと）
    - 改善ポイント（弱かったこと）
    - 今後のアドバイス

**関連画面**

- `Admin3-3` 訓練詳細：最終結果として表示
- `General2-2` セキュリティクイズ：合格後の遷移元

**実装詳細**

- Server Component: `app/learn/[drillId]/complete/page.tsx`
- Server Action: `app/learn/[drillId]/complete/actions.ts`
- Feature: `features/learning`
- 合格後のフィードバック画面
- LLM による受験履歴分析 → フィードバック生成
- **ゲスト公開**
- **token をクエリで引き継ぐ**（合格後のリダイレクトで付与）

---

## General3. エラー・その他

### General3-1. 無効リンク

- `/error/invalid-token`
- 内容：
  - 無効または期限切れの訓練リンク

**実装詳細**

- Server Component: `app/error/invalid-token/page.tsx`
- 無効なtokenで`/t/[token]`にアクセスした場合のエラー画面

---

### General3-2. オプトアウト

- `/settings/opt-out`
- 内容：
  - 訓練停止
  - 理由（任意）
  - **管理者による解除（再開）は `/admin/users` から実施**

**実装詳細**

- Server Component + Client Component: `app/settings/opt-out/page.tsx`
- Server Action: `app/settings/opt-out/actions.ts`
- Feature: `features/enroll`（または新規feature）
- ユーザーが訓練の受信を停止できる機能
- MVPでは省略可能だが、セキュリティ訓練の倫理的な観点から推奨

---

## MVPで「必須」なのはどこ？

### 最小成立セット（1ループ回るのに必要）

以下が揃えば「登録→配信リンク発行→クリック計測→学習/合格→集計」が成立する：

- `/admin/enroll` - 同意付きの訓練対象者登録（メール/Slack ID）
- `/admin/drills/create` - 訓練作成・配信（MVPは手動配信でも可／trackingToken発行）
- `/t/[token]` **または** `/learn/[drillId]` - クリック計測入口（到達時に `Interaction(click)` 記録）
- `/learn/[drillId]/quiz` - セキュリティクイズ（固定問題でOK、合格までループ）
- `/admin`（簡易） - クリック率・合格率などのサマリ表示

### コンテスト映えセット（あると強い）

- `/learn/[drillId]` 学習説明 / `/learn/[drillId]/complete` 学習完了
- `/admin/users` 参加者一覧、`/admin/users/[id]` 参加者詳細
- `/admin/drills` 訓練一覧、`/admin/drills/[id]` 訓練詳細（ログ確認）
- `/admin/drills/[id]/edit` 訓練編集・再配信
- `/settings/opt-out` オプトアウト受付

### 実装優先順位（5日想定）

詳細は [plan/override.md](../plan/override.md) を参照。

1. Day 1: `/admin/enroll`（同意チェック・ログイン足場）
2. Day 2: `/t/[token]` または `/learn/[drillId]` でクリック記録
3. Day 3: `/learn/[drillId]/quiz`（固定問題・再受験ループ）＋説明/完了ページの骨組み
4. Day 4: `/admin` 簡易ダッシュボード（クリック率・合格率）＋ `/admin/users` 最低限
5. Day 5: `/admin/drills/create` 最小送信（URL表示 or 手動配信）＋ `/admin/drills/[id]` でログ確認

---

## 関連ドキュメント

- [アーキテクチャ概要](./architecture.md)
- [プロダクト概要](./product.md)
- [認証・認可仕様](./auth.md)
- [訓練ステータス遷移フロー](./drills/drillStatusFlow.md)
- [セキュリティクイズ仕様](./drills/quizSpecification.md)
- [実装プラン](../plan/override.md)

---
