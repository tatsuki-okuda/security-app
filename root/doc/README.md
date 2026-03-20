---

# ドキュメント構成

Security Drillアプリケーションの各種ドキュメント、設計書、仕様を管理している。

### AI / Cursor 向け

- **実装依頼の型**: [changePacket.md](./changePacket.md)（SpecID・制約・テスト・承認の入出力）
- **エージェント手順**: リポジトリ直下の [AGENTS.md](../../AGENTS.md) → プロジェクト Skill（`.cursor/skills/security-app-implement-request/`・`security-app-doc-update/`）

---

## ディレクトリ構成

```
doc/
├── README.md（このファイル）
├── architecture.md ★ システム全体の構成・思想
├── assets/ ★ 画像・図解など
│   ├── architecture-dependency.png
│   ├── drill-status-flow.png
│   └── ui-presentation-split.png
├── screenConfiguration.md ★ 画面仕様・遷移の最新版
├── database.md ★ DB設計・テーブル定義
├── product.md ★ プロダクト概要・目的
│
├── drills/ ★ 訓練機能に関する詳細仕様
│   ├── drillStatusFlow.md（ステータス遷移フロー図）
│   └── quizSpecification.md（クイズの仕様・採点ロジック）
│
├── test/ ★ テスト方針・画面別テスト設計
│   ├── test.md（全体方針・テンプレ）
│   ├── admin/
│   └── general/
│
├── features/ ★ 機能実装に関する詳細
│   └── promptStrategy.md（LLMプロンプト戦略）
│
├── infrastructure/ ★ インフラ・運用に関する情報
│   ├── podman.md（コンテナ環境構築）
│   └── style.md（コーディング規約）
│
├── presentation/ ★ 発表用スライド
│   └── slides.md（Security Drill 発表スライド・Marp 等で表示可）
│
├── next.md（Next.js / React 実装ガイド）
├── QA.md ★ 開発時のQ&A・テスト手順
└── changePacket.md ★ SpecIDベースの変更パケット（AI/テスト/承認用）
（作業メモ用の `tmp.md` は任意。未使用なら置かない。正規の画面仕様は `screenConfiguration.md`）
```

---

## ドキュメント一覧

### 全体設計・俯瞰

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [product.md](./product.md) | プロダクト概要・目的・MVP範囲 | 全員 |
| [screenConfiguration.md](./screenConfiguration.md) | 画面構成・仕様・遷移（最新版） | 全員 |
| [architecture.md](./architecture.md) | システムアーキテクチャ・設計思想 | 開発者 |
| [database.md](./database.md) | DB設計・テーブル定義・インデックス指針・ER図 | 開発者 |

### 訓練機能（drills）

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [drills/drillStatusFlow.md](./drills/drillStatusFlow.md) | 訓練のステータス遷移、各ステータスでの操作 | 開発者・PM |
| [drills/quizSpecification.md](./drills/quizSpecification.md) | クイズデータ構造・採点ロジック・将来展開 | 開発者 |

### セキュリティ（Security）

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [features/promptInjectionDefense.md](./features/promptInjectionDefense.md) | プロンプトインジェクション対策等のLLMセキュリティ仕様・実装方針 | 全員 |

### 実装ガイド / ベストプラクティス

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [next.md](./next.md) | Next.js / React の実装ガイドライン | 開発者 |
| [slack.md](./slack.md) | Slack連携（通知・DM）の仕様と設計方針 | 開発者・PM |
| [infrastructure/style.md](./infrastructure/style.md) | コーディング規約・命名指針 | 開発者 |

### テスト

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [test/test.md](./test/test.md) | テスト方針・優先度・テンプレ | 開発者・QA |
| [test/admin/admin-enroll.md](./test/admin/admin-enroll.md) | `/admin/enroll` テスト設計 | 開発者・QA |
| [test/admin/admin-users.md](./test/admin/admin-users.md) | `/admin/users`, `/admin/users/[id]` テスト設計 | 開発者・QA |
| [test/admin/admin-drills-list.md](./test/admin/admin-drills-list.md) | `/admin/drills` テスト設計 | 開発者・QA |
| [test/admin/admin-drills-create.md](./test/admin/admin-drills-create.md) | `/admin/drills/create` テスト設計 | 開発者・QA |
| [test/admin/admin-drills-detail.md](./test/admin/admin-drills-detail.md) | `/admin/drills/[id]` テスト設計 | 開発者・QA |
| [test/admin/admin-drills-edit.md](./test/admin/admin-drills-edit.md) | `/admin/drills/[id]/edit` テスト設計 | 開発者・QA |
| [test/general/tracking.md](./test/general/tracking.md) | `/t/[token]` テスト設計 | 開発者・QA |
| [test/general/learning.md](./test/general/learning.md) | `/learn/[drillId]` テスト設計 | 開発者・QA |
| [test/general/quiz.md](./test/general/quiz.md) | `/learn/[drillId]/quiz` テスト設計 | 開発者・QA |
| [test/general/complete.md](./test/general/complete.md) | `/learn/[drillId]/complete` テスト設計 | 開発者・QA |
| [test/general/opt-out.md](./test/general/opt-out.md) | `/settings/opt-out` テスト設計 | 開発者・QA |

### 機能実装（features）

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [features/promptStrategy.md](./features/promptStrategy.md) | LLMプロンプト設計・プロンプトテンプレート | 開発者・AI担当 |

### インフラ・運用（infrastructure）

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [infrastructure/podman.md](./infrastructure/podman.md) | Podman環境構築（ローカルSMTP: Mailpit を含む） | 開発者・DevOps |

### 発表・資料

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [presentation/slides.md](./presentation/slides.md) | Security Drill 発表用スライド（Markdown・Marp 等で表示可） | 全員 |

### 資料・アセット

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [assets/architecture-dependency.png](./assets/architecture-dependency.png) | アーキテクチャ依存関係図 | 開発者 |
| [assets/drill-status-flow.png](./assets/drill-status-flow.png) | 訓練ステータス遷移図 | 全員 |
| [assets/ui-presentation-split.png](./assets/ui-presentation-split.png) | UI/プレゼンテーション分離イメージ | 開発者 |

### Q&A・作業メモ / ドラフト

| ドキュメント | 説明 | 対象者 |
|-----------|------|--------|
| [QA.md](./QA.md) | 開発時のQ&A、ローカル環境でのテスト手順など | 開発者 |
| [changePacket.md](./changePacket.md) | SpecIDベースの変更パケット（AI/テスト/承認用） | 開発者・AI担当 |

---

## 読み順の推奨

### 初めて読む方

1. [product.md](./product.md) - プロダクトの目的・位置づけを把握
2. [screenConfiguration.md](./screenConfiguration.md) - 画面構成・ユーザーフローを把握
3. [architecture.md](./architecture.md) - システム全体の構成・思想を理解
4. [database.md](./database.md) - データモデルの全体像を確認（技術寄り）

### 開発を始める方

1. [screenConfiguration.md](./screenConfiguration.md) - 対象画面の仕様を確認
2. [drills/](./drills/) - 訓練機能の詳細仕様（ステータス・クイズ）
3. [database.md](./database.md) - テーブル・リレーション・インデックスを確認
4. [architecture.md](./architecture.md) - 設計思想・依存関係を確認
5. [next.md](./next.md) - Next.js / React 実装ガイドラインを遵守
6. [features/promptStrategy.md](./features/promptStrategy.md) - LLM/プロンプト周りを実装する場合
7. [features/promptInjectionDefense.md](./features/promptInjectionDefense.md) - セキュリティ・脆弱性対策（LLMプロンプトインジェクション防護）の仕様を確認（LLM機能の実装時は必読）
8. [infrastructure/podman.md](./infrastructure/podman.md) - ローカルLLM環境構築
9. [infrastructure/style.md](./infrastructure/style.md) - コーディング規約・命名

### PM・企画の方

1. [product.md](./product.md)
2. [screenConfiguration.md](./screenConfiguration.md)
3. [drills/drillStatusFlow.md](./drills/drillStatusFlow.md)

---

## 更新ルール

- ドキュメント変更時は対応する別ドキュメントのリンクも更新する
- 新規ドキュメントや画像追加時は、このファイルの該当テーブル（ドキュメント一覧／アセット）と screenConfiguration.md の「関連ドキュメント」セクションに追加
- 大きな仕様変更は複数ドキュメントに影響することが多いため、必ず全関連ドキュメントを確認
- 作業メモ・ドラフトは必要ならローカル・issue、または任意の `tmp.md` に置く。確定した内容は screenConfiguration.md / architecture.md / database.md など正規ドキュメントへ反映する

---

## よくある質問

**Q: どのドキュメントで〇〇について書いてありますか？**

ドキュメント種別ごとの責務：
- **画面・遷移について** → screenConfiguration.md / drills/drillStatusFlow.md
- **データ構造・ロジック（DB/ER/インデックス含む）** → database.md / drills/quizSpecification.md / architecture.md
- **セキュリティ・プロンプトインジェクション対策** → features/promptInjectionDefense.md
- **LLMの使い方** → features/promptStrategy.md
- **Next.js / React 実装指針** → next.md
- **技術・仕様での不明点、テスト手順** → QA.md
- **コーディング規約・命名** → infrastructure/style.md
- **環境構築** → infrastructure/podman.md
- **図・ダイアグラム** → assets 配下（architecture-dependency.png / drill-status-flow.png / ui-presentation-split.png）
- **発表スライド** → presentation/slides.md
- **作業メモ・ドラフト** → ローカル・issue または任意の tmp.md（正規は screenConfiguration.md 等）

---
