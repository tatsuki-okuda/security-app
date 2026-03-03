---

# テスト設計ガイド

本ドキュメントは Security Drill アプリのテスト方針・粒度・記述ルールを定義する。各画面/機能ごとの詳細は `doc/test/**.md` に分割して記載する。

## 参照元・正とする仕様
- アーキテクチャ: `doc/architecture.md`
- 画面仕様: `doc/screenConfiguration.md`
- ステータス遷移: `doc/drills/drillStatusFlow.md`
- クイズ仕様: `doc/drills/quizSpecification.md`
- 実装プラン: `root/plan/override.md`

## テストレベルの定義
- **unit (domain/validators)**: 値オブジェクト・純粋関数・zod schema の入力制約を検証。
- **usecase**: DTO 入出力と gateway モックで業務フローを検証。
- **infrastructure (Prisma)**: Repository/Mapper の CRUD・ユニーク制約・FK 整合性を検証。
- **Server Action**: zod 再検証、usecase 呼び出し、Result/redirect の橋渡しを検証。
- **UI (presentation/components)**: `useActionState` の状態反映、入力制御、エラー表示を検証。
- **E2E (App Router)**: ルーティング・認証/ロール・副作用記録（クリック・回答保存）・リダイレクトを検証。

## テスト配置ルール
- 基本は **feature ごとに閉じて配置**: `features/<feature>/tests/{unit,usecase,infrastructure,server-actions,ui,e2e}`。
- `shared` 配下の共通ロジックは `shared/tests/{unit,infrastructure}` などで管理する。
- E2E を全体でまとめたい場合は `e2e/` をルートに置き、ファイル名に feature/画面ID を含める（例: `admin-enroll.e2e.spec.ts`）。
- テストファイル先頭に対応ドキュメント（例: `doc/test/admin/admin-enroll.md`）をコメントで示すと棚卸ししやすい。

## 優先度タグ
- **P0**: MVP ループ成立に必須（登録→配信→クリック→学習→クイズ合格）。
- **P1**: 管理・可視化の主要機能（一覧/詳細/編集）。
- **P2**: 将来拡張・運用オプション（ジョブ/シナリオ管理など）。

## 共通観点チェックリスト
- 認証/認可: `/admin/**` は Admin のみ。`/learn/*` と `/t/*` はゲスト可。
- 入力バリデーション: 必須/形式/選択肢数/正解数/同意チェック。
- 状態遷移: Draft→Deliverable→Delivering→Stopped、合格判定 80 点、再受験ループ。
- 副作用: クリック記録、回答保存、トランザクション整合、エラーログ。
- 導線/リダイレクト: 成功・失敗時の遷移先、活性/非活性の制御。
- エラーハンドリング: 無効 token、権限不足、DB 制約違反の扱い。

## 記述テンプレート（推奨）
各 `doc/test/**.md` は次の章立てを基本とする。
- スコープ・参照: 画面/機能 ID と参照ドキュメントを列挙。
- 前提: ロール/データ/初期状態。
- テストレベル別観点: unit/usecase/infrastructure/Server Action/UI/E2E で確認する論点を箇条書き。
- ケース一覧: P0/P1/P2 を付与し、期待結果と備考を記載。

## テストデータ指針
- メール: 正常/不正形式、重複登録。
- Slack: mentionable ID 正常/不正、未入力。
- Token: 有効/無効/期限切れ想定（無効は `/error/invalid-token`）。
- クイズ: single/multiple の正解パターン、選択肢 2 未満、正解なし。
- ステータス: Draft/Deliverable/Delivering/Stopped の切替データ。
- ロール: Admin/User/Guest のアクセス差分。

## 運用メモ
- 新規テストドキュメント追加時は `doc/README.md` のディレクトリ・テーブルに追記する。
- 将来機能（シナリオ管理、配信ジョブ）は pending/skip として枠を用意し、実装後に具体化する。
- 画面 ID（例: Admin1-1）は `screenConfiguration.md` の見出しと揃えてトレーサビリティを確保する。

