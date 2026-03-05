---

# Slack連携仕様（通知・DM）

Security Drillアプリにおける Slack 連携（通知・DM）の方針と実装イメージをまとめる。

## 1. 目的

- セキュリティ訓練の結果・お知らせを **Slack に配信** できるようにする。
- 将来的に、以下の両パターンをサポートすることを前提とする。
  - **A. 固定チャンネルへの通知**（例：セキュリティ訓練レポート用チャンネル）
  - **B. 個々のユーザーへの DM**（例：フィッシング訓練メッセージ、個人別フィードバック）

## 2. 現状の実装（Incoming Webhook）

現時点では、Slack連携は **Incoming Webhook のみ** を想定している。

- 利用 API
  - Slack の **Incoming Webhook** 機能
- 環境変数
  - `SLACK_WEBHOOK_URL`：Slack から発行される Webhook URL
- 実装箇所（2026-03 時点）
  - `app/next/src/features/drill/infrastructure/email/NodemailerDeliveryGateway.ts`
    - `createDeliveryGateway().sendSlack()` 内で `fetch(SLACK_WEBHOOK_URL, { ... })` を実行
    - payload は `{ text: "<@UXXXXXXX>\nメッセージ本文" }` のようなシンプルなテキスト

### 2.1 特徴・制約

- **できること**
  - Webhook 作成時に紐づけた **固定チャンネル** にメッセージを送る
  - メンションしたいユーザーの Slack U ID（`U...`）をテキスト内に埋め込む
- **制約**
  - 送信先チャンネルを **動的に変えることは基本できない**
  - ユーザーごとの DM（完全な 1:1 チャット）を厳密に扱うには不向き
  - Slack App の `Client ID / Client Secret` などは **利用していない**

このため、MVP では「特定チャンネルへの通知」を簡易に実現する用途として Webhook を利用し、  
将来的な柔軟な連携（DM・任意チャンネル）については次章の設計に従って拡張する。

## 3. 将来の設計（Slack App + Bot Token）

「訓練対象ユーザーごとに DM を送りたい」「シナリオごとに送信先チャンネルを切り替えたい」など、  
より柔軟な訓練シナリオを実現するために、Slack App（Bot）を用いた構成に拡張する。

### 3.1 方針

- Slack App を作成し、Bot User を有効化する。
- Bot の OAuth Token（`xoxb-...`）を利用して Slack Web API を呼び出す。
- 送信先の管理は以下のように分担する。
  - **固定チャンネル**：環境変数で管理（例：`SLACK_REPORT_CHANNEL_ID`）
  - **訓練対象ユーザーの Slack U ID**：アプリ側 DB で管理（既存の `User` レコードに保持）

### 3.2 想定するユースケース

- **ユースケースA：固定チャンネルに訓練レポートを送る**
  - 使用 API：`chat.postMessage`
  - 送信先：`SLACK_REPORT_CHANNEL_ID`（例：`CXXXXXXX`）
  - タイミング例：
    - 訓練作成時・完了時に Admin 向けレポートを投稿

- **ユースケースB：ユーザーごとに DM を送る**
  - 使用 API：
    - `conversations.open`（ユーザーとの DM チャンネルを開く）
    - `chat.postMessage`（DM チャンネルにメッセージを送る）
  - 送信先：
    - DB に保存されている Slack U ID（例：`user.slackUserId = "UXXXXXXX"`）
  - タイミング例：
    - フィッシングメール訓練の DM 送信
    - クイズの結果フィードバックを個別に送信

## 4. 環境変数の設計

Slack 連携で利用する環境変数（案）：

| 名前 | 用途 | 備考 |
|------|------|------|
| `SLACK_WEBHOOK_URL` | 現行の Incoming Webhook 用 URL | MVP から利用中。固定チャンネル通知向け |
| `SLACK_BOT_TOKEN` | Slack Bot 用 OAuth Token（`xoxb-...`） | 将来的に Web API を利用する場合に必須 |
| `SLACK_REPORT_CHANNEL_ID` | 管理者向けレポート投稿用チャンネル ID（`C...`） | Admin 向け訓練結果レポートなど |
| `SLACK_ADMIN_CHANNEL_ID` | 管理者向けアラート専用チャンネル ID（任意） | 必要に応じて追加 |

> ユーザー個別の Slack U ID（`U...`）は、環境変数ではなく **DB の `User` テーブル側で管理する**。  
> `/admin/enroll` 画面で入力された Slack ID を、そのまま U ID として保持する想定。

## 5. 画面仕様との関係

### 5.1 参加者登録（`/admin/enroll`）

- Slack ID 入力欄で受け取る値は、原則として **Slack の U ID（`U...`）** を想定する。
- 入力された Slack U ID は `User` テーブルに保存し、将来の DM 送信時に利用する。
- Slack ID の正当性チェック（実在ユーザーか確認）は、将来的に Slack Web API（`users.info` など）を利用して実装予定。

### 5.2 訓練作成・配信（`/admin/drills/create`, `/admin/drills/[id]/edit`）

- チャネル選択で「メール」「Slack」「両方」を指定できる。
- 「Slack」が選択された場合：
  - MVP では `SLACK_WEBHOOK_URL` 経由で固定チャンネルに通知。
  - 将来的には、シナリオ設定やユーザー属性にもとづいて、以下を切り替える。
    - 固定チャンネル通知（管理者向けレポート）
    - ユーザーごとの DM（フィッシング訓練・個別フィードバック）

## 6. 実装メモ・補足

- **認証方式**
  - Incoming Webhook：URL によるシンプルな認証のみ。App ID / Client Secret は不要。
  - Slack App + Bot Token：OAuth インストール時に発行された `SLACK_BOT_TOKEN` をサーバー側で保持し、Web API 呼び出しに利用。
- **セキュリティ上の注意**
  - Webhook URL や Bot Token は必ず環境変数で管理し、Git 管理しない。
  - Bot のスコープ（権限）は、`chat.write` など必要最小限に絞る。
  - DM 送信は「訓練目的」「ユーザーの同意」がある前提で行う。

このドキュメントは、Slack 連携の全体像（現状と将来像）を共有するためのハブとして利用し、  
実装詳細の変更があった場合は、本ファイルおよび関連画面仕様（`screenConfiguration.md`）を同時に更新する。

---

