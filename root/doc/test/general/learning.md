---

# General2-1 `/learn/[drillId]` テスト設計

## スコープ・参照
- 画面: 学習説明
- 仕様: `doc/screenConfiguration.md` General2-1
- 参照: `doc/architecture.md`, `doc/drills/drillStatusFlow.md`

## 前提
- ゲストアクセス可。token をクエリで引き継ぐ構成を想定。
- 該当 drillId が存在すること。

## テストレベル別観点
- usecase/infrastructure: drillId 取得、存在しない場合の扱い。
- UI: 危険性説明、見抜きポイント、クイズ導線表示。
- E2E: 有効 drillId → 学習内容表示、クイズ導線が機能。無効 drillId → エラー/404。

## ケース一覧（抜粋）
- P0 正常: 学習内容が表示され、クイズ導線が有効。
- P1 エラー: 不正 drillId で 404/エラー表示。
- P1 副作用: 到達時にクリック記録が実行される構成での確認。
