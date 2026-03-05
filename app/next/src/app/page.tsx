import { AppHeader } from '../shared/ui/AppHeader';

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-4xl font-bold text-text-primary">Security Drill</h1>
        <p className="mb-8 text-center text-text-secondary">
          セキュリティ訓練でフィッシングやメール詐欺への対応力を高めます。
        </p>
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">最近の訓練</h2>
          <div className="rounded-xl border border-border bg-bg p-4 flex justify-between items-center group cursor-pointer hover:border-primary transition-colors">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">パスワード再設定の偽メール</h3>
              <p className="text-xs text-text-secondary mt-1">送信: 2025/03/01　対象: 12名</p>
            </div>
            <span className="text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">詳細を見る →</span>
          </div>
        </div>
      </main>
    </>
  );
}
