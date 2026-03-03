---
title: UI Style Guide (Tailwind)
updated: 2026-02-26
---

# 目的
- フォーム／ボタンなどの共通スタイルを Tailwind で統一し、見た目と可読性を高める。
- `shared/ui/styles/formStyles.ts` による共通クラスを起点に、機能ごとに再利用しやすくする。

# ファイル配置
- Tailwind 設定: `app/next/tailwind.config.ts`
- PostCSS 設定: `app/next/postcss.config.mjs`
- 共通スタイルトークン: `app/next/src/shared/ui/styles/formStyles.ts`
- グローバルスタイル: `app/next/src/app/globals.css`

# 基本ポリシー
- **構造と余白をはっきり**: `space-y-*` で縦リズムをそろえ、`max-w-*` で読み幅を制御。
- **カード型のフォーム**: `formStyles.card` をベースに、淡い境界線とソフトなシャドウで読みやすく。
- **入力の状態がわかる**: エラー時は `formStyles.inputError` を追加し、`InlineError` に強調色を付与。
- **操作を目立たせる**: プライマリボタンは `buttonStyles.primary` を使用（グラデ背景とフォーカスリング付き）。
- **テキストの階層**: 見出し/本文/補足は `title` / `description` / `hint` を使い分ける。

# 主要トークン一覧 (`formStyles`)
- `shell`: フォーム全体の外枠（配置・左右余白）
- `card`: フォームカード（背景・角丸・シャドウ）
- `header` / `eyebrow` / `title` / `description`: 見出し一式
- `form`: 入力領域の縦リズム
- `field`: 各フィールドのスタック
- `label`: ラベル（フォント強調）
- `input`: 通常入力の共通クラス
- `inputError`: 入力エラー時に追加
- `hint`: 補足テキスト
- `errors.list` / `errors.item` / `errors.bullet`: エラー表示の UL / LI / マーカー
- `alert`: フォーム全体のアラート（API エラー等）
- `actions`: ボタンエリア
- `buttonStyles.primary`: プライマリボタン
- `buttonStyles.spinner`: ローディング用スピナー

# 使用例（フォーム）
```tsx
import { formStyles, buttonStyles } from '@/shared/ui/styles/formStyles';
import { InlineError } from '@/shared/ui/components/InlineError';

const hasError = errors.email?.length > 0;

return (
  <div className={formStyles.shell}>
    <form className={formStyles.card}>
      <div className={formStyles.header}>
        <span className={formStyles.eyebrow}>Security Training</span>
        <h1 className={formStyles.title}>訓練アカウント登録</h1>
      </div>

      <div className={formStyles.form}>
        <div className={formStyles.field}>
          <label htmlFor="email" className={formStyles.label}>メールアドレス</label>
          <input
            id="email"
            className={`${formStyles.input} ${hasError ? formStyles.inputError : ''}`}
            {...register('email')}
          />
          <InlineError
            id="email-errors"
            messages={errors.email ?? []}
            className={formStyles.errors.list}
            itemClassName={formStyles.errors.item}
            bulletClassName={formStyles.errors.bullet}
          />
        </div>

        <div className={formStyles.actions}>
          <button type="submit" className={buttonStyles.primary}>登録</button>
        </div>
      </div>
    </form>
  </div>
);
```

# 運用メモ
- 新しい UI を作るときは、まず既存トークンを流用し、不足があれば `formStyles` に追加してから使う。
- 色や余白を変える場合もトークンを更新し、分散したカスタムクラスを増やさない。
- 画面全体の背景グラデやフォントは `globals.css` で統制する。個別ページでのリセットは避ける。
