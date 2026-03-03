---

# Admin3-1 `/admin/drills` テスト設計

## スコープ・参照
- 画面: 訓練一覧
- 仕様: `doc/screenConfiguration.md` Admin3-1
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`, `root/plan/override.md`

## 前提
- ロール: Admin のみ。
- データ: 複数 Drill（Draft/Deliverable/Delivering）、異なるチャネル、クイズ結果あり/なし。

## テストレベル別観点
- usecase/infrastructure: Drill と Interaction/QuizAttempt の集計を正しく取得。
- UI: テーブル表示（対象者数、送信日時、クリック有無、合否、チャネル、承認状態）、新規作成ボタン動作。
- E2E: ログイン → `/admin/drills` 表示 → `create` リンク遷移が成功。

## ケース一覧（抜粋）
- P0 正常: 対象者数・送信日時・クリック/合否が表示される。
- P0 導線: 「新規作成」クリックで `/admin/drills/create` へ遷移。
- P1 表示: 承認状態が Draft/Deliverable/Delivering で正しく表示。
- P1 フィルタ/ソート（実装されていれば）: 挙動を確認。
- P2 性能: 件数が多い場合も表示が完了する。

