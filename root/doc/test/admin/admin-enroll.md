---

# Admin1-1 `/admin/enroll` テスト設計

## スコープ・参照
- 画面: 管理者による訓練参加者登録
- 仕様: `doc/screenConfiguration.md` Admin1-1
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`, `doc/drills/quizSpecification.md`, `root/plan/override.md`

## 前提
- ロール: Admin のみアクセス可。未ログインはログインへ、Admin 以外は 403 相当。
- データ: 既存ユーザーが存在する場合の重複登録方針を確認（エラー or 上書き）。

## テストレベル別観点
- validators: メール必須、Slack ID 必須(Slack 配信時)、チャネル未選択エラー、同意未チェックエラー、メール形式不正、Slack ID 形式不正。
- domain: Email 値オブジェクトの正規化/不正判定。
- usecase: 正常登録、重複メール、同意なし、チャネル未選択、権限不足。
- infrastructure: Prisma 経由の unique 制約・トランザクション整合。
- Server Action: zod 再検証→Result、成功時 `/admin/users` へリダイレクト、失敗時のフィールドエラー返却。
- UI(presentation/components): 入力中バリデーション表示、送信時 disable、サーバーエラー表示、同意チェックの必須制御。
- E2E: Admin ログイン→入力→送信→リダイレクト、エラー時に入力値が保持されること。

## ケース一覧（抜粋）
- P0 正常: メール+同意+メールチャネル → 登録成功し `/admin/users` へ。
- P0 エラー: 同意未チェック → 送信不可/エラー表示。
- P1 エラー: チャネル未選択 → エラー表示。
- P1 エラー: メール未入力でメールチャネル選択 → エラー表示。
- P1 エラー: Slack 未入力で Slack チャネル選択 → エラー表示。
- P1 エラー: 重複メール登録時の期待動作（エラー or 上書き）を確認。
- P2 表示: サーバー起因エラー時のメッセージ表示と再送信可否。
