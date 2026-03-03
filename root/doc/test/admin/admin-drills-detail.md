---

# Admin3-3 `/admin/drills/[id]` テスト設計

## スコープ・参照
- 画面: 訓練詳細
- 仕様: `doc/screenConfiguration.md` Admin3-3
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`, `doc/drills/quizSpecification.md`, `root/plan/override.md`

## 前提
- ロール: Admin のみ。
- データ: Drill に紐づく Interaction（クリック/学習）、QuizAttempt（スコア・合否）、ApprovalHistory が存在。

## テストレベル別観点
- usecase/infrastructure: Drill と関連ログ/結果の取得、存在しない ID の扱い。
- UI: 訓練基本情報、メール内容、クイズ内容、行動ログ、クイズ結果の表示。編集ボタンの導線。
- E2E: `/admin/drills/[id]` へ遷移し、すべての情報が表示される。編集ボタンで `/admin/drills/[id]/edit` へ。

## ケース一覧（抜粋）
- P0 正常: 送信日時/対象者数/チャネル/承認状態が表示される。
- P0 正常: クイズ内容と正解が表示される。
- P0 正常: 行動ログ（送信→クリック→学習）が時系列で表示。
- P1 権限: Admin 以外は 403 相当。
- P1 エラー: 不正 ID で 404/エラー表示。
- P2 導線: 編集ボタンから edit 画面へ遷移。

