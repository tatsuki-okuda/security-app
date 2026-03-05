import Link from 'next/link';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto mt-12 max-w-3xl space-y-4 px-4 sm:px-0">
      <Link href={`/admin/drills/${params.id}`} className="text-sm font-semibold text-text-secondary">
        ← 詳細へ戻る
      </Link>
      <h1 className="text-2xl font-semibold text-text-primary">訓練編集</h1>
      <p className="text-sm text-text-secondary">編集機能は準備中です。作成画面から新規作成してください。</p>
    </main>
  );
}
