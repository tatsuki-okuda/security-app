# Podman インストールと環境構築

## 公式ドキュメント

Podmanの公式インストールガイド: https://podman.io/docs/installation

## macOS でのインストール

### 推奨方法: 公式インストーラー

1. [Podman公式サイト](https://podman.io/getting-started/installation)からインストーラーをダウンロード
2. ダウンロードした `.pkg` ファイルを実行してインストール

### Homebrew でのインストール（非推奨）

> **注意**: Homebrewでのインストールはコミュニティメンテナンスのため、安定性が保証されていません。

```bash
brew install podman
```

インストール後、最初のPodmanマシンを作成して起動:

```bash
podman machine init
podman machine start
```

インストールの確認:

```bash
podman info
```

## Windows でのインストール

Windowsでは、PodmanマシンはWSLv2（Windows Subsystem for Linux）ディストリビューションでバックアップされます。

詳細なセットアップ手順は [Podman for Windows guide](https://podman.io/docs/installation#windows) を参照してください。

## Linux でのインストール

### Ubuntu / Debian

```bash
sudo apt-get update
sudo apt-get -y install podman
```

### Fedora

```bash
sudo dnf -y install podman
```

### Arch Linux / Manjaro

```bash
sudo pacman -S podman
```

その他のディストリビューションについては、[公式インストールガイド](https://podman.io/docs/installation#installing-on-linux)を参照してください。

## 初期設定

### Podman Compose の確認

このプロジェクトでは `podman compose` コマンドを使用します。Podman 4.0以降では `podman compose` が標準で利用可能です。

確認方法:

```bash
podman compose version
```

### ルートレスモードでの実行

Podmanはデフォルトでルートレス（root権限なし）で実行できます。初回実行時に設定が必要な場合があります。

### エイリアス設定（オプション）

このプロジェクト用の便利なエイリアスを設定できます。`root/aliases.sh` ファイルに定義されています。

**設定方法:**

1. `.zshrc` に以下を追加:
   ```bash
   # プロジェクト用エイリアス
   source /Users/okuda.tatsuki/Documents/workspace/security-app/root/aliases.sh
   ```
   または、プロジェクトルートに移動してから実行する場合:
   ```bash
   # プロジェクト用エイリアス（プロジェクトルートで実行）
   source "$(pwd)/root/aliases.sh"
   ```

2. 設定を反映:
   ```bash
   source ~/.zshrc
   ```

**利用可能なエイリアス:**

- `pmc` - `podman compose -f root/docker-compose.yml` の短縮形
- `pmc-up` - コンテナをビルドして起動
- `pmc-down` - コンテナを停止
- `pmc-logs` - ログを表示（フォロー）
- `pmc-ps` - コンテナの状態を表示
- `pmc-exec-next` - nextコンテナでコマンド実行
- `pmc-exec-db` - dbコンテナでコマンド実行
- `pmc-prisma-migrate` - Prismaマイグレーション実行
- `pmc-prisma-generate` - Prismaクライアント生成
- `pmc-prisma-studio` - Prisma Studio起動
- `pmm-start` - Podman Machine起動
- `pmm-stop` - Podman Machine停止
- `pmm-restart` - Podman Machine再起動

**使用例:**

```bash
# エイリアスを使用しない場合
podman compose -f root/docker-compose.yml up --build

# エイリアスを使用する場合
pmc-up
```

## コンテナイメージの再ビルド

コードや依存関係を更新したあと、イメージを再ビルドしたい場合:

```bash
# エイリアスなし（--no-cache でキャッシュ無効化）
podman compose -f root/docker-compose.yml build --no-cache

# エイリアスあり（pmc は podman compose をラップ）
pmc build --no-cache
```

最新イメージを取り込みたい場合は `--pull` を追加してください。

## その他のローカルサービス（Mailpit / Ollama）

`root/docker-compose.yml` には他の有用なローカルサービスが含まれています。

### ローカルメール確認（Mailpit）
開発中の訓練メールをローカルで確認できます。

- SMTP Host: `mailpit`
- SMTP Port: `1025`
- Web UI: `http://localhost:8025`

### 利用手順

1. 通常どおり `pmc-up`（または `podman compose -f root/docker-compose.yml up --build`）で起動
2. 管理画面で訓練メールを配信（`/admin/drills/create`）
3. Mailpit UI（`http://localhost:8025`）で受信メールを開き、`/t/[token]` リンク遷移を確認

### ローカルLLM（Ollama）
訓練コンテンツのAIによる生成とフィードバック分析をローカル環境で無料で行うため、Ollama のサービスが稼働します。

- API Endpoint: `http://localhost:11434`
- コンテナとして提供されるため、追加の設定なくNext.jsアプリケーションと連携します。詳細は [ollama.md](./ollama.md) を参照してください。

## 動作確認

インストールが正しく完了したか確認:

```bash
podman --version
podman info
```

簡単なコンテナの実行テスト:

```bash
podman run --rm docker.io/library/hello-world
```

## トラブルシューティング

### macOS でマシンが起動しない場合

```bash
# マシンの状態を確認
podman machine list

# マシンを再起動
podman machine stop
podman machine start
```

### 権限エラーが発生する場合

ルートレスモードで実行している場合、`/etc/subuid` と `/etc/subgid` の設定が必要な場合があります。詳細は公式ドキュメントを参照してください。

## 参考リンク

- [Podman公式サイト](https://podman.io/)
- [Podmanインストールガイド](https://podman.io/docs/installation)
- [Podman Getting Started](https://podman.io/getting-started/)
