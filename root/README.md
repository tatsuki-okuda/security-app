# Security Drill（社内セキュリティ訓練）

## 概要

登録されたメール/Slackに「疑わしいメッセージ（模擬）」をランダムに送って、クリック/反応 → 学習（クイズ） → スコア化、を回すセキュリティ訓練アプリケーションです。

詳細は [doc/product.md](./doc/product.md) を参照してください。

## アーキテクチャ

本プロジェクトのアーキテクチャについては [doc/architecture.md](./doc/architecture.md) を参照してください。

## 環境構築

本プロジェクトの環境構築は **Podman** または **Docker** で行えます。詳細は以下を参照してください。

### Podman を使う場合

> **Podmanのインストール方法と環境構築の詳細については、[doc/infrastructure/podman.md](./doc/infrastructure/podman.md) を参照してください。**

#### 前提

- Podman をインストール済み（インストール方法は [doc/infrastructure/podman.md](./doc/infrastructure/podman.md) を参照）
- `podman-compose` が使えること（`podman compose` コマンド）
- エイリアス設定については [doc/infrastructure/podman.md](./doc/infrastructure/podman.md#エイリアス設定) を参照
- Podman Machine が起動していること（未起動なら `podman machine start` もしくは `pmm-start`。初回は `podman machine init` を [doc/infrastructure/podman.md](./doc/infrastructure/podman.md) に従って実行）

#### 起動

ルートディレクトリで実行:

```
podman compose -f root/docker-compose.yml up --build
```

または、エイリアスを設定している場合（[doc/infrastructure/podman.md](./doc/infrastructure/podman.md#エイリアス設定) を参照）:

```
pmc-up
```

起動後にアクセス:

- Next.js: `http://localhost:3000`
- Mailpit UI: `http://localhost:8025`（ローカル配信メールの確認）
- Ollama API (Next.js バックエンド用): `http://localhost:11434`

#### 停止

```
podman compose -f root/docker-compose.yml down
```

または、エイリアスを設定している場合:

```
pmc-down
```

### Docker を使う場合

> **Dockerのインストール方法と環境構築の詳細については、[doc/infrastructure/docker.md](./doc/infrastructure/docker.md) を参照してください。**

#### 前提

- Docker Desktop または Docker Community Edition がインストール済み
- `docker-compose` が使えること（`docker compose` コマンド）
- Docker daemon が起動していること

#### 起動

ルートディレクトリで実行:

```
docker compose -f root/docker-compose.yml up --build
```

起動後にアクセス:

- Next.js: `http://localhost:3000`
- Mailpit UI: `http://localhost:8025`（ローカル配信メールの確認）
- Ollama API (Next.js バックエンド用): `http://localhost:11434`

#### 停止

```
docker compose -f root/docker-compose.yml down
```

### DB 情報（コンテナ内）

- Host: `db`
- Port: `5432`
- User: `app`
- Password: `app`
- Database: `app`

### Prismaに関する操作

Prismaの各種操作は、Dockerコンテナ内から直接実行する方法と、ホスト側から `docker-compose` を使ってコンテナ外から実行する方法があります。
※本プロジェクトではPodmanもサポートしているため、環境に応じて `docker compose` を `podman compose` に置き換えて実行してください。

#### マイグレーションの実行

スキーマの変更をデータベースに適用します。初回起動時などにご利用ください。

- **コンテナ内から実行:**
  ```bash
  npx prisma migrate dev
  ```
- **コンテナ外から実行 (docker-compose):**
  ```bash
  docker compose -f $(git rev-parse --show-toplevel)/root/docker-compose.yml exec next sh -c "npx prisma migrate dev"
  ```

#### マイグレーションの追加

スキーマファイルを変更し、新しいマイグレーション履歴を作成して適用します。

- **コンテナ内から実行:**
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- **コンテナ外から実行 (docker-compose):**
  ```bash
  docker compose -f $(git rev-parse --show-toplevel)/root/docker-compose.yml exec next sh -c "npx prisma migrate dev --name <migration_name>"
  ```

#### Prismaクライアントの作成

スキーマの変更に合わせてPrismaクライアントを再生成します。

- **コンテナ内から実行:**
  ```bash
  npx prisma generate
  ```
- **コンテナ外から実行 (docker-compose):**
  ```bash
  docker compose -f $(git rev-parse --show-toplevel)/root/docker-compose.yml exec next sh -c "npx prisma generate"
  ```

#### セキュリティクイズとフィードバック分析 (Ollama)

このプロジェクトでは、AIクイズシナリオ生成およびユーザー回答のAIフィードバック分析に **Ollama** をローカルLLMとして使用しています。

- **コンテナ内から実行:**
  ```bash
  # モデル（例: llama3）のPullが必要な場合
  npx podman exec -it <ollamaコンテナ名> ollama pull llama3
  ```
- オフライン動作やOllamaの詳細な検証環境構築手順については [doc/infrastructure/ollama.md](./doc/infrastructure/ollama.md) を参照。

#### Seedの挿入

初期データやテストデータをデータベースに投入します。

- **コンテナ内から実行:**
  ```bash
  npx prisma db seed
  ```
- **コンテナ外から実行 (docker-compose):**
  ```bash
  docker compose -f $(git rev-parse --show-toplevel)/root/docker-compose.yml exec next sh -c "npx prisma db seed"
  ```

#### データベースのリセット

データベースの全データを削除し、すべてのマイグレーションを再適用（およびSeedの実行）します。

- **コンテナ内から実行:**
  ```bash
  npx prisma migrate reset
  ```
- **コンテナ外から実行 (docker-compose):**
  ```bash
  docker compose -f $(git rev-parse --show-toplevel)/root/docker-compose.yml exec next sh -c "npx prisma migrate reset"
  ```

#### Prisma Studioの起動

ブラウザ（`http://localhost:5555`）でデータベースの中身をGUIで確認・編集できるツールを起動します。

- **コンテナ内から実行:**
  ```bash
  npx prisma studio --port 5555 --browser none
  ```
- **コンテナ外から実行 (docker-compose):**
  ```bash
  docker compose -f $(git rev-parse --show-toplevel)/root/docker-compose.yml exec next sh -c "npx prisma studio --port 5555 --browser none"
  ```

### 開発用スクリプト（scripts/）

本プロジェクトには、API や LLM 生成機能などのバックエンドロジックを UI（ブラウザ）を通さずに単体でテスト・検証するための簡単なスクリプトを `app/next/scripts/` ディレクトリに配置しています。

これらのスクリプトは、ターミナルから `npx tsx` コマンド等を用いて直接実行することを想定した開発者向けツールです。
例：
```bash
# LLMの生成ロジックをターミナルから単体実行する
npx tsx scripts/test-generate.ts
```

### ローカルメール開発（Mailpit）

- 開発環境のSMTPは `mailpit:1025` に向くように `root/docker-compose.yml` で設定済み
- `/admin/drills/create` からメール配信すると、Mailpit UI（`http://localhost:8025`）で本文とリンクを確認できる

## ドキュメント

- [ドキュメント目次](./doc/README.md)
- [プロジェクト概要](./doc/product.md)
- [画面構成](./doc/screenConfiguration.md)
  - [テスト計画](./doc/test/)
- [アーキテクチャ](./doc/architecture.md)
- [DB設計](./doc/database.md)
- [訓練ステータス遷移](./doc/drills/drillStatusFlow.md)
- [クイズ仕様・採点ロジック](./doc/drills/quizSpecification.md)
- [LLMプロンプト戦略](./doc/features/promptStrategy.md)
- [Podman環境構築](./doc/infrastructure/podman.md)
- [Docker環境構築](./doc/infrastructure/docker.md)
- [コーディング規約](./doc/infrastructure/style.md)
- [next計画](./doc/next.md)
