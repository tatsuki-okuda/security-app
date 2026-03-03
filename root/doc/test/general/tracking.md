---

# General1-1 `/t/[token]` テスト設計

## スコープ・参照
- 画面: 訓練リンク入口（クリック計測）
- 仕様: `doc/screenConfiguration.md` General1-1
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`

## 前提
- ゲストアクセス可（例外パス）。有効/無効 token が存在。

## テストレベル別観点
- usecase/infrastructure: token 検証、クリック記録、無効 token の扱い。
- UI: リダイレクト挙動（学習ページへ）、エラー画面遷移。
- E2E: 有効 token → クリック記録→ `/learn/[drillId]` へ。無効 token → `/error/invalid-token` へ。

## ケース一覧（抜粋）
- P0 正常: 有効 token でクリックが記録される。
- P0 エラー: 無効 token でエラー画面に遷移。
- P1 ロール: ログイン状態でも同じ挙動（ゲスト許可）。
- P2 期限切れ想定: 期限切れ token の扱い（将来拡張）。

