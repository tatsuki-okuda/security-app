---

# Admin3-2 `/admin/drills/create` テスト設計

## スコープ・参照
- 画面: 訓練作成
- 仕様: `doc/screenConfiguration.md` Admin3-2
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`, `doc/drills/quizSpecification.md`, `root/plan/override.md`

## 前提
- ロール: Admin のみ。
- データ: シナリオ選択肢、対象ユーザーが存在する状態。
 - MVP: 固定クイズ、作成と同時に配信。

## テストレベル別観点
- MVP: 作成→配信が同時に行われる。
- validators: 件名/本文/誘導テキスト必須、クイズ必須項目（問題文・形式 single/multiple・選択肢 2 以上・正解 1 以上・解説）。
- usecase: Draft 保存（バリデーション無し）と Deliverable 昇格チェック、配信時の対象/チャネル/タイミング検証。
- infrastructure: Drill + trackingToken 発行、Quiz の永続化、トランザクション整合。
- Server Action: zod 再検証、成功/失敗の Result、Deliverable 判定。
- UI: AI生成結果表示/編集、再生成ボタン（実装範囲に応じて挙動確認）、ボタン活性条件。
- E2E: 入力→「配信可能にする」で Deliverable、必須欠落でエラー、配信実行で `/admin/drills/[id]` へ。

## ケース一覧（抜粋）
- P0 正常: 必須を満たし「配信可能にする」→ Deliverable へ昇格。
- P0 エラー: クイズ選択肢 1 つのみ → エラー。
- P0 エラー: 正解未指定 → エラー。
- P1 正常: Draft 保存でバリデーション無し保存が成功。
- P1 配信: Deliverable 状態で配信実行 → Delivering へ遷移し詳細へリダイレクト。
- P1 形式: questionType = single_choice で正解 2 つ指定時にエラー。
- P2 形式: questionType = text は将来拡張として skip/pending。
