---
name: security-app-implement-request
description: >-
  Runs spec-driven implementation for Security Drill (Next.js app under app/next).
  Use when implementing or changing features, fixing bugs against docs, working with
  SpecIDs, screenConfiguration, Server Actions, or when the user asks for code changes
  aligned with root/doc. Requires filling root/doc/changePacket.md before coding.
---

# Security Drill: 実装依頼（仕様駆動）

## 前提（Cursor コンテキスト）

- `app/**` や `src/**` を編集する場合、プロジェクトルールとして [`.cursor/rules/code-doc-sync.mdc`](../../rules/code-doc-sync.mdc) と [`.cursor/rules/architecture-invariants.mdc`](../../rules/architecture-invariants.mdc) が該当しうる。責務分離・認証認可はここに従う。

## 着手前（必須・人が埋める）

1. [`root/doc/changePacket.md`](../../../root/doc/changePacket.md) の **入力**セクションをコピーし、チャットに貼るか作業ブランチで埋める。
2. **ファイルパスだけの参照は禁止**。各関連 doc には **見出し名** または **該当する記述の要約＋根拠行** まで書く（例: `screenConfiguration.md` の `Admin3-2` 節、§ローディング）。
3. **Implement SpecID** と **NotInScope** を必ず列挙する。曖昧なら `changePacket.md` の「曖昧/グレー」に質問を書き、先に確認する。

## 読む順序（最小・タスク別）

共通の土台（常に最初）:

1. `root/doc/screenConfiguration.md`（対象 screenId）
2. `root/doc/database.md` と `root/doc/architecture.md`（データ・依存がある場合は必須）

分岐（必要なものだけ追加で読む）:

| タスクの種類 | 追加で読む |
|--------------|------------|
| 画面のみ（表示・遷移・文言） | `root/doc/next.md`、`root/doc/infrastructure/style.md` |
| DB スキーマ・フィールド変更 | 上記に加え `root/doc/database.md` を全体確認 |
| 訓練ステータス・クイズ・採点 | `root/doc/drills/drillStatusFlow.md`、`root/doc/drills/quizSpecification.md` |
| LLM・プロンプト | `root/doc/features/promptStrategy.md`、`root/doc/features/promptInjectionDefense.md` |

## 不変条件（必読・短い本文）

- 全文: [`.agents/rules/architecture_invariants.md`](../../../.agents/rules/architecture_invariants.md)（`actions.ts` / `validators` / `domain` / `infrastructure` / 認証認可・監査）

## 実装中

- [`.agents/workflows/code_doc_sync.md`](../../../.agents/workflows/code_doc_sync.md) の「実装時のルール」に従う（doc とコードの矛盾は doc 更新または相談が先）。

## 検証コマンド（リポジトリルートから・真実は app/next/package.json）

Next.js アプリ（`app/next`）を対象とする:

- 静的（prettier + eslint）: `npm --prefix app/next run check`
- テスト（vitest 1 回実行）: `npm --prefix app/next run test:run`
- 両方: `npm --prefix app/next run verify`

失敗時は修正して再実行する。NestJS や別パッケージのみを触る場合は、その `package.json` の scripts を確認してから実行する。

## 完了時（必須出力）

- [`root/doc/changePacket.md`](../../../root/doc/changePacket.md) の **「出力（AIが返すべきもの）」** にある **SpecID ブロック**を、対象 SpecID ごとに必ず出す（`pass` / `fail` / `skip` / `provisional` と evidence）。
- `provisional` / `skip` には未確定点と参照 doc を evidence に残す。

## 詳細テンプレ・例

- 入力・出力の全文テンプレ: `root/doc/changePacket.md`
- 良い依頼 / 悪い依頼の例: 同ディレクトリの `examples.md`
