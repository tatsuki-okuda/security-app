---
description: ソースコード生成・改修時に仕様ドキュメントを参照し、矛盾や更新漏れを防ぐためのルール
---

# Code ↔ Docs Consistency Rule

目的: ソースコード生成・改修時に、仕様ドキュメントを必ず参照し、矛盾や更新漏れを防ぐ。

## 参照すべき正規ドキュメント
- 画面/遷移: `root/doc/screenConfiguration.md`
- データモデル: `root/doc/database.md`
- アーキ構成: `root/doc/architecture.md`
- 訓練フロー: `root/doc/drills/drillStatusFlow.md`
- クイズ仕様: `root/doc/drills/quizSpecification.md`
- LLM/プロンプト: `root/doc/features/promptStrategy.md`
- Next.js/React実装: `root/doc/next.md`
- 全体概要: `root/doc/product.md`
- 目次・導線: `root/doc/README.md`

## コード生成・変更前の確認
1) 触る画面/機能を `root/doc/screenConfiguration.md` で特定。URL、遷移、表示要素、ローディング/エラー挙動を確認。
2) 関連するデータ項目/状態は `root/doc/database.md` と `root/doc/architecture.md` で整合を取る（テーブル・フィールド・依存関係）。
3) 訓練/クイズに関わる場合は `root/doc/drills/drillStatusFlow.md` / `root/doc/drills/quizSpecification.md` を確認（ステータス・採点・再受験ルール）。
4) LLM/プロンプトを使う場合は `root/doc/features/promptStrategy.md` の方針と制約を尊重。
5) 実装パターンは `root/doc/next.md` を遵守（Server Actions/Components、状態管理、非同期パターン）。

## 実装時のルール
- スペックがドキュメントと異なる挙動を要求された場合、まずドキュメントを更新するか相談してから実装。
- 画面要素や文言を追加/変更する際は、`root/doc/screenConfiguration.md` と必要に応じて `root/doc/README.md` の表を更新。
- データフィールドを追加/変更する場合は `root/doc/database.md`（テーブル、インデックス、制約）と `root/doc/architecture.md` の対応箇所を同期。
- 訓練ステータスや採点ロジックを変えるときは `root/doc/drills/drillStatusFlow.md` / `root/doc/drills/quizSpecification.md` へ反映し、関連画面の記述も合わせる。
- LLMプロンプトを変えたら `root/doc/features/promptStrategy.md` と該当画面説明を更新。
- 不整合を見つけたら「正とするドキュメント」に合わせ、必要ならドキュメント→コードの順で修正。

## 生成前チェックリスト（簡易）
- [ ] 対象画面/機能の仕様を `root/doc/screenConfiguration.md` で確認した
- [ ] 必要なデータ項目を `root/doc/database.md` で確認し、不足がない
- [ ] 該当するフロー/ロジック（訓練・クイズ・LLM）が関連ドキュメントと矛盾しない
- [ ] 適用すべき実装パターンを `root/doc/next.md` で確認した
- [ ] ドキュメント更新が必要なら先に着手・または依頼する
