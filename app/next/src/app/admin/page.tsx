import Link from 'next/link';

export default function Page() {
  return (
    <main className="mx-auto mt-12 max-w-3xl space-y-6 px-4 sm:px-0">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">管理ダッシュボード</h1>
        <p className="text-sm text-slate-600">管理機能の入口です。</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/enroll" className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
          参加者登録
        </Link>
        <Link href="/admin/users" className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
          参加者一覧
        </Link>
        <Link href="/admin/drills" className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
          訓練一覧
        </Link>
        <Link href="/admin/drills/create" className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
          訓練作成
        </Link>
      </div>
    </main>
  );
}
