---

# General3-2 `/settings/opt-out` テスト設計

## スコープ・参照
- 画面: オプトアウト申請
- 仕様: `doc/screenConfiguration.md` General3-2
- 参照: `doc/architecture.md`

## 前提
- ロール: ログイン必須。Admin/User が対象。

## テストレベル別観点
- validators: 理由は任意、停止フラグの必須設定。
- usecase: 停止申請でユーザーの opt-out 状態を更新。重複申請の扱い。
- infrastructure: 状態更新の永続化、監査ログ（存在する場合）。
- Server Action: 入力検証、Result、リダイレクト/メッセージ表示。
- UI: 入力フォーム、送信結果表示、再開は `/admin/users` で行う旨の案内。
- E2E: 送信成功で状態が opt-out になり、`/admin/users` に反映される。

## ケース一覧（抜粋）
- P0 正常: ログインユーザーが停止申請→成功。
- P1 エラー: 未ログインでアクセス→ログインへ。
- P1 反映: `/admin/users` で opt-out 状態が確認できる。
- P2 重複: 既に opt-out のユーザーが再度申請した場合の挙動。

