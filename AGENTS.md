# Cursor / AI エージェント向け索引

本文の二重管理を避けるため、ここは **リンク集のみ**。

| 用途 | 参照先 |
|------|--------|
| 実装依頼（SpecID・changePacket・検証ゲート） | [`.cursor/skills/security-app-implement-request/SKILL.md`](.cursor/skills/security-app-implement-request/SKILL.md) |
| 仕様ドキュメントのみ更新 | [`.cursor/skills/security-app-doc-update/SKILL.md`](.cursor/skills/security-app-doc-update/SKILL.md) |
| 変更パケットテンプレ | [`root/doc/changePacket.md`](root/doc/changePacket.md) |
| コード ↔ doc 同期ルール | [`.agents/workflows/code_doc_sync.md`](.agents/workflows/code_doc_sync.md) |
| doc 間の整合 | [`.agents/workflows/docs_consistency.md`](.agents/workflows/docs_consistency.md) |
| アーキ不変条件 | [`.agents/rules/architecture_invariants.md`](.agents/rules/architecture_invariants.md) |
| doc 目次 | [`root/doc/README.md`](root/doc/README.md) |

Next.js アプリの検証（`app/next/package.json` 準拠）:

- `npm --prefix app/next run check`
- `npm --prefix app/next run test:run`
- `npm --prefix app/next run verify`
