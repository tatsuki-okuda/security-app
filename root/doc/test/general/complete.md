---

# General2-3 `/learn/[drillId]/complete` テスト設計

## スコープ・参照
- 画面: 学習完了（合格後）
- 仕様: `doc/screenConfiguration.md` General2-3
- 参照: `doc/drills/quizSpecification.md`, `doc/architecture.md`

## 前提
- 合格済みの QuizAttempt が存在。token をクエリで引き継ぐ。

## テストレベル別観点
- usecase/infrastructure: 最終スコア・受験回数・フィードバック取得。
- UI: 合格メッセージ、スコア、受験回数、フィードバック（強み/改善ポイント/アドバイス）表示。
- E2E: 合格後のみ到達できる。直接アクセスで未合格ならリダイレクト/エラー。

## ケース一覧（抜粋）
- P0 正常: 合格後に到達し、スコアと受験回数が表示される。
- P1 エラー: 未合格での直接アクセス時の挙動確認。
- P2 フィードバック: フィードバック生成失敗時のフォールバック表示。
