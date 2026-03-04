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

### Prisma（必要に応じて）
初回で DB マイグレーションが必要な場合:
```
podman compose -f root/docker-compose.yml exec next npx prisma migrate dev --schema src/prisma/schema.prisma
```
（Docker の場合は `podman compose` を `docker compose` に置き換えてください。または、エイリアスを設定している場合は [doc/infrastructure/podman.md](./doc/infrastructure/podman.md#エイリアス設定) を参照）

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
