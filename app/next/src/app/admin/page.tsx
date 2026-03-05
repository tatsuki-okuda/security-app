import Link from 'next/link';
import { Users, FileText, Send, UserPlus } from 'lucide-react';

export default function Page() {
  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">ダッシュボード</h1>
        <p className="text-sm text-text-secondary">管理機能の入口です。</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/enroll" className="group flex flex-col gap-3 rounded-xl border border-border bg-bg p-6 transition-all duration-200 cursor-pointer hover:bg-surface hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-text-primary transition-colors group-hover:text-primary" />
            <h2 className="font-semibold text-text-primary">参加者登録</h2>
          </div>
          <p className="text-sm text-text-secondary">新規に対象者を登録します。</p>
        </Link>
        
        <Link href="/admin/users" className="group flex flex-col gap-3 rounded-xl border border-border bg-bg p-6 transition-all duration-200 cursor-pointer hover:bg-surface hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-text-primary transition-colors group-hover:text-primary" />
            <h2 className="font-semibold text-text-primary">参加者一覧</h2>
          </div>
          <p className="text-sm text-text-secondary">登録済みユーザーを確認。</p>
        </Link>

        <Link href="/admin/drills" className="group flex flex-col gap-3 rounded-xl border border-border bg-bg p-6 transition-all duration-200 cursor-pointer hover:bg-surface hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-text-primary transition-colors group-hover:text-primary" />
            <h2 className="font-semibold text-text-primary">訓練一覧</h2>
          </div>
          <p className="text-sm text-text-secondary">配信履歴と結果を確認。</p>
        </Link>

        <Link href="/admin/drills/create" className="group flex flex-col gap-3 rounded-xl border border-border bg-bg p-6 transition-all duration-200 cursor-pointer hover:bg-surface hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3">
            <Send className="h-5 w-5 text-text-primary transition-colors group-hover:text-primary" />
            <h2 className="font-semibold text-text-primary">訓練作成</h2>
          </div>
          <p className="text-sm text-text-secondary">新しい訓練を作成・配信。</p>
        </Link>
      </div>
    </div>
  );
}
