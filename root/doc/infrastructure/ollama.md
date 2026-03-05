# Ollama 統合と環境構築

このプロジェクトでは、ローカルで安全かつ無料でAI機能（訓練コンテンツの生成やAIフィードバック分析）を動かすためのLLMエンジンとして **Ollama** をサポートしています。

Ollamaは `docker-compose.yml` にサービスとして組み込まれており、データベース（PostgreSQL）やメール確認ツール（Mailpit）と一緒に一元管理できます。

## 1. Ollamaコンテナの起動

他のサービスと同様に、`docker-compose` コマンド（または設定済みのエイリアス）を使って起動します。

```bash
# プロジェクトルートで起動 (Podman の場合)
podman compose -f root/docker-compose.yml up -d

# プロジェクトルートで起動 (Docker の場合)
docker compose -f root/docker-compose.yml up -d

# エイリアスを使用する場合
pmc-up
```

## 2. 言語モデル（LLM）のダウンロード

コンテナが起動した直後は、Ollama内にモデルデータがありません。使用したいモデルをOllamaコンテナ内にダウンロード（Pull）する必要があります。

### 推奨モデル（日本語対応・性能重視）

プロジェクトの性質上、セキュリティ訓練用のシナリオ生成やAIフィードバックにおいて、日本語を自然に扱えるモデルが適しています。まずは最もおすすめの設定で動作確認を行うことを推奨します。

1. **最もおすすめ: `qwen2.5`** (パラメータ数: 7B など)
   - **特徴:** 日本語の表現力や指示への忠実さがオープンモデルの中ではトップクラスです。不自然な翻訳調になりにくく最適です。（メモリに余裕がある場合はさらに上位の `qwen2.5:14b` なども選択肢に入ります）
2. **汎用性が高く安定: `llama3.1`** (パラメータ数: 8B)
   - **特徴:** Meta社製の標準的かつ強力なモデル。全体的な推論能力は高いですが、たまに英語が混ざるなど、日本語の自然さでQwen2.5に劣る場合があります。
3. **軽量モデル（低スペック環境向け）: `phi3`** (3.8B) や **`gemma2`** (9B)
   - **特徴:** ラップトップなどリソースが限られている環境でサクサク動かしたい場合に使用します。

### モデルのPull手順

コンテナ名を確認してから、以下のコマンドでモデルをPullします。

```bash
# 現在起動しているOllamaコンテナを確認 (エイリアス または podman/docker ps)
pmc-ps  # または podman ps / docker ps

# Ollamaコンテナ内でモデルをPull（例として最もおすすめの qwen2.5 を取得）
# Podman の場合:
podman exec -it <ollamaのコンテナ名> ollama pull qwen2.5

# Docker の場合:
docker exec -it <ollamaのコンテナ名> ollama pull qwen2.5
```
※ モデルのサイズにより数GBのダウンロードが発生します。完了するまでお待ちください。

特定のモデルと対話して動作確認したい場合は、`run` コマンドを使用します。
```bash
# Podman の場合:
podman exec -it <ollamaのコンテナ名> ollama run qwen2.5

# Docker の場合:
docker exec -it <ollamaのコンテナ名> ollama run qwen2.5
```

## 3. アプリケーション（Next.js）との連携設定

Next.jsアプリからOllamaを利用するために、`app/next/.env` ファイルに以下の設定を追加します。

### Next.jsをコンテナ内で動かしている場合（デフォルト）
Next.jsとOllamaが同じDockerネットワーク内にいるため、コンテナ名である `ollama` をホストとして指定します。

```env
# LangChainにOllamaのエンドポイントを認識させる
LLM_BASE_URL=http://ollama:11434/v1

# 使用するモデル名（Pullしたモデル名と合わせる）
LLM_MODEL=qwen2.5

# LangChainのOpenAI互換クライアントを使うためのダミーAPIキー
OPENAI_API_KEY=ollama
```

### Next.jsをローカルマシン側（npm run dev）で動かしている場合
ローカルからコンテナの公開ポートにアクセスするため、`localhost` を指定します。

```env
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5
OPENAI_API_KEY=ollama
```

## 4. 動作確認

設定完了後、アプリケーションブラウザから以下の機能にアクセスし、ローカルLLMから応答が生成されることを確認してください。
*   `/admin/drills/create` : シナリオを選択して「自動で生成する」ボタンを押下
*   `/learn/[drillId]/quiz` : わざと誤った回答をして送信し、AIフィードバックが表示されるか確認

> **Note**: アプリケーション起動後の初回の推論リクエストは、Ollama内でモデルをメモリにロードするため時間がかかる場合があります。
