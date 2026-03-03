---

# Admin3-4 `/admin/drills/[id]/edit` テスト設計

## スコープ・参照
- 画面: 訓練編集・配信
- 仕様: `doc/screenConfiguration.md` Admin3-4
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`, `doc/drills/quizSpecification.md`, `root/plan/override.md`

## 前提
- ロール: Admin のみ。
- データ: Deliverable または Delivering の Drill が存在。
 - MVP: 編集機能は準備中（画面のみ）。

## テストレベル別観点
- MVP: 画面が表示され、準備中の案内が出ること。
- validators: 作成時と同等の必須項目検証（件名/本文/誘導、クイズ必須項目）。
- usecase: Deliverable 状態でのみ「配信する」有効、Delivering では配信不可だが編集可、配信停止で Stopped へ。
- infrastructure: 更新の永続化、状態遷移の排他。
- Server Action: zod 再検証、Result、ステータス更新の可否判定。
- UI: 現在ステータス表示、ボタン活性条件、AI再生成の挙動（実装範囲に応じる）。
- E2E: Deliverable で配信→Delivering へ遷移、Delivering で配信ボタンが無効、配信停止で Stopped へリダイレクト。

## ケース一覧（抜粋）
- P0 正常: Deliverable で配信ボタンが有効→配信成功し詳細へ。
- P0 エラー: 必須欠落で配信不可、エラーメッセージ表示。
- P1 状態: Delivering 状態では配信ボタン無効、編集保存は可能。
- P1 停止: Delivering で「配信停止」→ Stopped へ遷移し詳細へ。
- P2 形式: クイズ questionType=text は pending/skip。
