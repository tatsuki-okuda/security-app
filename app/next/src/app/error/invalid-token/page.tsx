import Link from 'next/link';

export default function Page() {
  return (
    <main className="mx-auto mt-12 max-w-xl space-y-4 px-4 sm:px-0">
      <h1 className="text-2xl font-semibold text-text-primary">無効なリンクです</h1>
      <p className="text-sm text-text-secondary">
        リンクの有効期限が切れているか、URLが正しくありません。管理者にお問い合わせください。
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
