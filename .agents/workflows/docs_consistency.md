---
description: ドキュメント修正時の矛盾・更新漏れを防ぐための基本ルール
---

# Docs Consistency Guard

目的: ドキュメント修正時の矛盾・更新漏れを防ぎ、AIエージェントが常に最新の情報を参照できるようにする。

## 正とするドキュメント
- 画面仕様/遷移: `root/doc/screenConfiguration.md`（最新版。`root/doc/tmp.md`はドラフト）
- データモデル: `root/doc/database.md`
- アーキ思想/依存関係: `root/doc/architecture.md`
- プロダクト概要/MVP範囲: `root/doc/product.md`
- 訓練フロー: `root/doc/drills/drillStatusFlow.md`
- クイズ仕様/採点: `root/doc/drills/quizSpecification.md`
- LLM/プロンプト: `root/doc/features/promptStrategy.md`
- Next.js/React実装: `root/doc/next.md`
- 目次・導線: `root/doc/README.md`（本ファイル）

## 修正時のチェックリスト
1) 変更が他文書に影響するか確認し、該当箇所を同時更新する。
2) `root/doc/README.md` の「ドキュメント一覧」「読み順」「FAQ」「アセット」が影響する場合は必ず追従。
3) 画面仕様を触る場合は `root/doc/screenConfiguration.md` を単一のソースとし、`root/doc/tmp.md` は補助メモにとどめる。
4) ステータス/遷移/採点に触る場合は `root/doc/drills/drillStatusFlow.md` / `root/doc/drills/quizSpecification.md` を更新し、必要なら `root/doc/database.md` のテーブル・インデックスにも反映。
5) データ項目や依存関係を追加/変更したら `root/doc/architecture.md` と `root/doc/database.md` の対応箇所を同期。
6) LLMやプロンプト方針を変えたら `root/doc/features/promptStrategy.md` と関連画面説明（screenConfiguration内の学習/クイズ説明）を確認。
7) 新規画像・図を追加したら `root/doc/assets/` に置き、`root/doc/README.md` のアセット表に追記。
8) 新規ドキュメントを作るときは `root/doc/README.md` のディレクトリツリーと各テーブルに追加し、関連する既存ドキュメントからリンクを張る。
9) 一時的なメモは `root/doc/tmp.md` に置き、確定後は正規ドキュメントへ移す。

## 運用メモ
- 不一致を見つけた場合は「正とするドキュメント」を優先し、他を揃える。
- 迷ったときは `root/doc/screenConfiguration.md` → `root/doc/database.md` → `root/doc/architecture.md` の順に整合を取る。
