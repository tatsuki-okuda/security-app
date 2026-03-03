---

# General2-2 `/learn/[drillId]/quiz` テスト設計

## スコープ・参照
- 画面: セキュリティクイズ
- 仕様: `doc/screenConfiguration.md` General2-2
- 参照: `doc/drills/quizSpecification.md`, `doc/architecture.md`

## 前提
- ゲストアクセス可。token をクエリで引き継ぎ、該当 drillId が存在し、クイズデータがある。

## テストレベル別観点
- validators: 問題文必須、questionType(single/multiple)、選択肢 2 以上、正解 1 以上、解説必須。text は将来拡張で skip。
- usecase: 受験履歴保存、再受験時の履歴追加、合格判定 80 点、再挑戦可否。
- infrastructure: QuizAttempt 永続化、複数回答保存、スコア計算結果の保存。
- Server Action: zod 再検証、Result、合格/不合格の分岐。
- UI: 出題表示、選択肢入力、エラー表示、スコア/合否表示、再受験導線。
- E2E: 不合格→再受験可能、合格→ `/learn/[drillId]/complete` へ遷移。

## ケース一覧（抜粋）
- P0 正常: 正解選択で 80 点以上となり合格画面へ。
- P0 エラー: 選択肢未選択で送信 → バリデーションエラー表示。
- P0 ループ: 不合格時に同ページで再挑戦でき、履歴が増える。
- P1 エラー: 問題データが欠落している場合のエラー表示。
- P1 権限: Admin/User ログイン時もゲスト同様に受験可能。
- P2 形式: questionType=text は pending/skip。
