# 実装依頼の例（security-app-implement-request）

## 悪い例（避ける）

- 「`screenConfiguration.md` を見て管理画面を直して」だけ → 対象 screenId・SpecID・NotInScope・受け入れ条件がなく、同じ指示でも結果がブレる。
- 「DBもよしなに」→ `database.md` / マイグレ方針と整合しないリスクが高い。

## 良い例（changePacket の入力を埋めた断片）

- **変更対象**: 画面 `Admin3-2`、SpecID `Admin3-2.required`, `Admin3-2.transitions`
- **NotInScope**: `Admin3-2` 以外の画面、メール送信ロジック
- **関連 doc**: `screenConfiguration.md` の `Admin3-2` 節（必須表示項目と遷移図）、`next.md` の Server Actions 節
- **制約**: `npm --prefix app/next run check` 緑、`/admin/**` は admin のみ（architecture_invariants）

このレベルまで書けば、誰が依頼しても同じゲートと同じ doc 順で実装できる。
