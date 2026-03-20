---
title: 変更パケット（SpecIDベース）
purpose: Cursor/AIに仕様ID（SpecID）ベースで指示し、制約→ハーネス→人の承認までを回すための入力テンプレ。
---

# 変更パケット（SpecIDベース）

## 目的
- 仕様書の指示を “画面ID直下 SpecID” に分解して、AIの実装・テスト作成・最終チェックを一貫させる。
- 曖昧/グレーは原則 `skip` または `provisional` として明示し、evidence（未確定点と参照）を残す。

## 入力（Cursor agent向け）
### 1) 変更概要
- 変更対象（画面ID/SpecID）: ``
- 変更理由（ユーザー価値/不具合/仕様追加）: ``
- 期間（必要なら）: ``

### 2) SpecID（画面ID直下＋補助タグ）
`SpecID = <screenId>[.<tag>]`

- Implement: ``
  - 例: `Admin3-2.required`, `Admin3-2.transitions`, `General1-1.ui`
- NotInScope（触らない）: ``

### 3) 関連ドキュメント（参照元）
- 画面仕様: `root/doc/screenConfiguration.md`（該当screenId）
- DB/状態: `root/doc/database.md` / `root/doc/drills/drillStatusFlow.md` / `root/doc/drills/quizSpecification.md`
- 実装ガイド: `root/doc/next.md`
- LLM/制約（該当する場合）: `root/doc/features/promptStrategy.md` / `root/doc/features/promptInjectionDefense.md`

### 4) 制約（Constraints: static + AIレビュー）
- 静的解析（リポジトリルート）: `npm --prefix app/next run check`（prettier + eslint）で満たすべきルール: ``
- AIレビューで確認すべきセキュリティ/禁止事項: ``

### 5) ハーネス（Harness: テストで仕様を充足）
- 追加/更新するテスト: `doc/test/...`（SpecIDごとに）
- vitest 実行: `npm --prefix app/next run test:run`（または `npm --prefix app/next run verify`）
- “失敗時”の期待: `fail/skip/provisional` をSpecID単位で返す

### 6) 曖昧/グレーの扱い方
- 実装前に確認すべき未確定点（質問）: ``
- 暫定判断（provisionalで進めるなら何を決めるか）: ``

## 出力（AIが返すべきもの）
### 1) SpecIDごとの検証レポート（Markdownのみ）
各SpecIDごとに、以下のブロックを必ず出す。

#### SpecIDブロック雛形
- `SpecID`: ``
- `Status`: `pass | fail | skip | provisional`
- `Constraints(evidence)`: `npm --prefix app/next run check` / AIレビュー結果と、NGなら理由
- `Harness(evidence)`: 該当テストと、失敗観点（NGならどの観点が落ちたか）
- `HumanQA(evidence)`: 人が最終承認で確認すべき観点（またはevidenceへのリンク）
- `NextActions`: 次に直すSpecID（失敗時）/provisional確定に向けた質問（必要なら）

### 2) 追加の質問（必要な場合のみ）
- `provisional` の未確定点に対する確認質問を列挙する。

