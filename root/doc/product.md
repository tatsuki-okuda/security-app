# 「Security Drill（社内セキュリティ訓練）」

## 目的

登録されたメール/Slackに「疑わしいメッセージ（模擬）」をランダムに送って、
クリック/反応 → 学習（クイズ） → スコア化、を回す。

## MVPの最小機能

- ユーザー登録（メール必須 + Slack ID 任意）※本人の同意チェック付き（重要）
- キャンペーン作成（期間、送信頻度、対象者、シナリオ種別）
- ランダム送信ジョブ（不定期に配信）
- 計測：リンククリック / ボタン押下（= "引っかかった" 判定）
- "引っかかった"場合に学習ページへ誘導（クイズ合格まで）
- 管理画面：対象者一覧、クリック率、合格状況のダッシュボード

## セキュアにするガード

- 送るのは「模擬であることが分かる社内ドメイン」＋「学習用LPにしか遷移しない」
（ログイン情報入力フォームなどは作らない）
- 事前合意（オプトイン）、停止（オプトアウト）導線
- 監査ログ（いつ誰に何を送ったか、誰がクリックしたか）
- レート制限・送信上限（迷惑・炎上防止）


## 技術スタック

### Frontend / Backend（フルスタック）

Next.js（App Router） + React + TypeScript

- Server Actions をバックエンドAPI相当として利用
- 管理画面もユーザー学習ページも同居できる
- 将来的に NestJS 等の専用バックエンドへ切り出し可能

### DB

PostgreSQL + Prisma

### 認証・認可

- Auth.js (NextAuth) v5 + App Router でパスワードレス認証
- プロバイダ: Google OAuth / LINE Login（メール取得必須）
- Prisma Adapter で `users` を永続化し、セッション/JWT に `role` を埋め込む
- Middleware で `/admin/**` を `role=admin` に限定し、`/learn/*` と `/t/*` はゲスト許可

### Job/Scheduler

BullMQ + Redis（ランダム送信に必須）

### 通知

- Email：SMTP（社内） or SendGrid等（コンテストならモックでもOK）
- Slack：Slack API（Incoming Webhook or chat.postMessage）

### AI生成

LangChain + Ollama（ローカルLLMモデル）

- **Ollama**を使用してローカルでLLMを実行（無料・オープンソース）
- 推奨モデル：llama3、qwen2.5（日本語対応）、mistral など
- データが外部に出ないため、社内セキュリティ訓練に適している
- LangChainの `@langchain/ollama` パッケージで統合
- "危険な方向に寄らない制約" をプロンプトに組み込む


## アーキテクチャ

[doc/architecture.md](./architecture.md) を参照

### Next.js / React 設計ガイドライン

実装時は [doc/next.md](./next.md) に記載されているベストプラクティスに従ってください。特に以下が重要です：

- **Server Components でサーバー状態を管理する**
- **Server Actions をバックエンドAPI相当として利用する**
- **クライアント状態とサーバー状態を明確に分離する**


## 画面構成

[doc/screenConfiguration.md](./screenConfiguration.md) を参照
