# Docker 環境構築

このドキュメントでは、Docker を使った本プロジェクトの環境構築方法について説明します。

Podman を使う場合は [podman.md](./podman.md) を参照してください。

## 概要

本プロジェクトは `docker-compose.yml` により、以下の複数コンテナを管理しています：

- **db**: PostgreSQL（データベース）
- **mailpit**: Mailpit（ローカルメール配信＆UI）
- **next**: Next.js アプリケーション（開発サーバー）

## 前提条件

### Docker のインストール

#### macOS

[Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) をインストールしてください。

```bash
# Homebrew を使用する場合
brew install --cask docker
```

#### Linux

Docker と Docker Compose をインストールしてください：

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

#### Windows

[Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) をインストールしてください。

### インストール確認

```bash
docker --version
docker compose version
```

## 便利なエイリアスの利用 (推奨)

プロジェクト内で頻繁に利用する Docker Compose コマンド群をまとめたエイリアススクリプトを用意しています。
これを利用すると、プロジェクト内のどのディレクトリにいても自動でルートの `docker-compose.yml` を参照するため、操作が非常にシンプルになります。

**設定方法**（`.zshrc` などに追記）:

```bash
source /path/to/security-app/root/docker-aliases.sh
```

**主な利用例**:

- `docker compose -f root/docker-compose.yml up --build` → **`dc-up`** (バックグラウンド) または **`dc-up-fg`** (フォアグラウンド)
- `docker compose -f root/docker-compose.yml down` → **`dc-down`**
- `docker compose -f root/docker-compose.yml logs -f` → **`dc-logs`**
- `docker compose -f root/docker-compose.yml exec <service>` → **`dc-exec-next`** や **`dc-exec-db`**
- 任意のコマンド（例: `docker compose ps`） → **`dc ps`**

※ 以降のドキュメントのコマンド例は標準的な `docker compose` の形式で記述されていますが、エイリアス導入後は適宜上記コマンド体系に読み替えることができます。

## クイックスタート

### 1. 起動

プロジェクトのルートディレクトリで以下を実行：

```bash
docker compose -f root/docker-compose.yml up --build
# またはエイリアス使用: dc-up
```

初回は以下のような処理が実行されます：

- Docker イメージのダウンロード・ビルド
- コンテナの起動
- `npm ci` による依存パッケージのインストール
- Prisma の自動生成（`prisma generate`）
- Next.js 開発サーバーの起動

ログに以下が表示されれば起動成功です：

```
next  |   ▲ Next.js 15.x.x
next  |   - Local:        http://localhost:3000
next  |   - Environments: .env.local
```

### 2. アプリケーションへのアクセス

起動後、以下のURLにアクセスできます：

| サービス       | URL                   | 説明                   |
| -------------- | --------------------- | ---------------------- |
| Next.js アプリ | http://localhost:3000 | メインアプリケーション |
| Mailpit UI     | http://localhost:8025 | メール配信テストUI     |
| PostgreSQL     | localhost:5432        | DB接続ポート           |

### 3. 停止

```bash
docker compose -f root/docker-compose.yml down
# またはエイリアス使用: dc-down
```

停止時にコンテナは削除されますが、データベースのボリューム（`dbdata`）は保持されます。

## よくある操作

### ログの確認

すべてのサービスのログ：

```bash
docker compose -f root/docker-compose.yml logs -f
# またはエイリアス使用: dc-logs
```

特定のサービスのログ（例：next）：

```bash
docker compose -f root/docker-compose.yml logs -f next
# またはエイリアス使用: dc logs -f next
```

### コンテナへのアクセス

Next.js コンテナでコマンド実行：

```bash
docker compose -f root/docker-compose.yml exec next sh
# またはエイリアス使用: dc-exec-next sh
```

### DB マイグレーション

Prisma マイグレーション実行：

```bash
docker compose -f root/docker-compose.yml exec next npx prisma migrate dev --schema src/prisma/schema.prisma
# またはエイリアス使用: dc-prisma-migrate
```

### DB リセット

```bash
docker compose -f root/docker-compose.yml down -v
docker compose -f root/docker-compose.yml up --build
# またはエイリアス使用:
# dc-down -v
# dc-up
```

`-v` フラグでボリューム（DB データ）を削除します。

### npm パッケージの追加

新しいパッケージを追加する場合：

```bash
# コンテナ内で実行
docker compose -f root/docker-compose.yml exec next npm install <package-name>
# またはエイリアス使用: dc-exec-next npm install <package-name>
```

または、`docker-compose.yml` で `npm ci` を実行しているため、ローカル環境で `package.json` を編集後、コンテナをリビルドします：

```bash
docker compose -f root/docker-compose.yml up --build
# またはエイリアス使用: dc-up
```

## ファイルマウント

`docker-compose.yml` では以下のボリュームマウントを設定しています：

| ホスト         | コンテナ                   | 説明                             |
| -------------- | -------------------------- | -------------------------------- |
| `../app/next`  | `/app`                     | Next.js プロジェクトディレクトリ |
| `node_modules` | `/app/node_modules`        | Node.js モジュール（分離）       |
| `dbdata`       | `/var/lib/postgresql/data` | DB データ永続化                  |

### ホットリロード

`docker-compose.yml` で以下の設定により、ホストの変更がコンテナに反映されます：

```yaml
volumes:
  - ../app/next:/app
```

ファイルを保存するとNext.js の開発サーバーが自動的にリロードされます。ただし、ファイルシステムのポーリングを有効にしています：

```yaml
environment:
  WATCHPACK_POLLING: "true"
```

これにより、macOS など一部の環境でのファイル監視の不安定性を改善しています。

## 環境変数

`docker-compose.yml` で設定されている環境変数：

```yaml
DATABASE_URL: postgresql://app:app@db:5432/app
APP_BASE_URL: "http://localhost:3000"
SMTP_HOST: "mailpit"
SMTP_PORT: "1025"
SMTP_USER: ""
SMTP_PASS: ""
MAIL_FROM: "no-reply@example.com"
SLACK_WEBHOOK_URL: ""
AUTH_BYPASS: "true" # 認証導入までの暫定バイパス
WATCHPACK_POLLING: "true" # ファイル監視の安定化
```

開発環境での設定値です。本番環境では適切に変更してください。

## トラブルシューティング

### ポート競合エラー

```
ERROR: for next  Cannot start service next: Ports are not available: exposing port TCP 0.0.0.0:3000
```

別のアプリケーションが該当ポートを使用しています。プロセスを確認・終了するか、`docker-compose.yml` でポート設定を変更してください。

### メモリ不足

Docker コンテナにメモリ割り当てが足りない場合、コンテナが強制終了される可能性があります。Docker Desktop の設定でメモリ上限を増やしてください。

### Database connection refused

DB コンテナの起動に時間がかかる場合があります。ログで確認：

```bash
docker compose -f root/docker-compose.yml logs db
# またはエイリアス使用: dc logs db
```

起動後、Next.js コンテナの再起動：

```bash
docker compose -f root/docker-compose.yml restart next
# またはエイリアス使用: dc restart next
```

### ボリュームの問題

ボリュームを完全にリセット：

```bash
docker compose -f root/docker-compose.yml down -v
docker volume prune
docker compose -f root/docker-compose.yml up --build
# またはエイリアス使用:
# dc-down -v
# docker volume prune
# dc-up
```

## Podman との比較

| 項目                 | Docker                          | Podman                  |
| -------------------- | ------------------------------- | ----------------------- |
| インストール         | Docker Desktop（macOS/Windows） | Podman + Podman Machine |
| コマンド             | `docker compose`                | `podman compose`        |
| ライセンス           | フリーミアム                    | オープンソース          |
| セットアップの簡易性 | 簡単                            | 少し手間                |

本プロジェクトは両者に対応しており、コマンドを `docker compose` → `podman compose` に置き換えるだけで動作します。

## 参考

- [Docker 公式ドキュメント](https://docs.docker.com/)
- [Docker Compose リファレンス](https://docs.docker.com/compose/reference/)
- [root/docker-compose.yml](../../docker-compose.yml) - プロジェクトの Compose 設定ファイル
- [README.md](../../README.md) - 環境構築のクイックスタート
