---
description: root/doc/architecture.md 由来のアーキテクチャ不変条件
---

# Architecture Invariants

本ルールは `root/doc/architecture.md` の責務分離・依存方向・配置ルールを不変条件として固定するためのものです。

## 守るべきアーキテクチャ制約（不変条件）
- `app/**/actions.ts` は Server Actions（バックエンドAPI相当）のみに責務を置き、UIやビジネスロジックは持たない。
- UIと入力検証は zod を `validators/` に集約し、最終的な安全性・禁止判定などのビジネスルールは `domain/` の純粋関数に置く。
- DBアクセスや外部I/O、副作用は `infrastructure/`（例: `infrastructure/prisma`）に閉じる。
- 実装は feature 単位で分離し、基本は `src/features/<feature>/{contracts,validators,domain,usecases,infrastructure,_ui}` に揃える。
- 認証/認可: `/admin/**` は `role=admin` のみ許可、`/learn/*` と `/t/*` はゲスト許可。重要操作（承認・配信・停止）は監査テーブルに記録する。

