---
name: security-app-doc-update
description: >-
  Updates Security Drill specification docs under root/doc with cross-document
  consistency. Use when editing only Markdown under root/doc, fixing doc drift,
  screenConfiguration, database.md, architecture.md, or when the user asks for
  doc-only changes. Hands off to security-app-implement-request when code must change.
---

# Security Drill: ドキュメント更新（整合のみ）

## いつ使うか

- `root/doc/**/*.md`（および `root/doc/assets/`）**だけ**を変更するとき。
- 仕様の追記・矛盾解消・目次・リンクの修正。

**コード（`app/next`、`app/nestJs` 等）も触る場合は** [`security-app-implement-request`](../security-app-implement-request/SKILL.md) **に切り替える**。doc だけ先に直す場合は本 Skill で終え、実装は別タスクで changePacket を渡す。

## 正とするドキュメント（一覧）

詳細な説明は [`.agents/workflows/docs_consistency.md`](../../../.agents/workflows/docs_consistency.md) を参照。

## 修正時チェックリスト（必ず順に確認）

- [ ] 変更が **他の doc** に波及しないか見た。波及するなら **同じ変更セット**で直す。
- [ ] [`root/doc/README.md`](../../../root/doc/README.md) の **ディレクトリ構成・ドキュメント一覧・読み順・FAQ・アセット** に影響があれば更新した。
- [ ] 画面仕様を触った → [`root/doc/screenConfiguration.md`](../../../root/doc/screenConfiguration.md) を単一のソースとして更新した（ドラフトは正規 doc へ取り込む）。
- [ ] ステータス / 遷移 / 採点を触った → [`drillStatusFlow.md`](../../../root/doc/drills/drillStatusFlow.md) / [`quizSpecification.md`](../../../root/doc/drills/quizSpecification.md) と必要なら [`database.md`](../../../root/doc/database.md) を更新した。
- [ ] データ項目・依存を触った → [`architecture.md`](../../../root/doc/architecture.md) と [`database.md`](../../../root/doc/database.md) を同期した。
- [ ] LLM・プロンプト方針を触った → [`promptStrategy.md`](../../../root/doc/features/promptStrategy.md) と関連する画面説明（`screenConfiguration` 内）を確認した。
- [ ] 新規画像・図 → `root/doc/assets/` に置き、`README.md` のアセット表に追記した。
- [ ] 新規 doc → `README.md` のツリーと表に追加し、関連 doc からリンクした。

## 運用メモ

- 不一致を見つけたら **正とする doc** に合わせて他を揃える。
- 迷ったら **`screenConfiguration.md` → `database.md` → `architecture.md`** の順で整合を取る（[`docs_consistency.md`](../../../.agents/workflows/docs_consistency.md) と同じ）。

## 完了後の受け渡し

- この変更で **アプリの挙動やスキーマ実装も変えるべき**なら、依頼に [`root/doc/changePacket.md`](../../../root/doc/changePacket.md) を埋めた上で **security-app-implement-request** を使うよう明示する。
