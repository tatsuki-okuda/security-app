import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="flex h-14 w-full items-center justify-between bg-surface px-6 text-text-primary">
      <Link href="/" className="text-lg font-bold">
        Security Drill
      </Link>
      <nav>
        <Link href="/admin" className="text-sm font-medium text-text-secondary hover:text-text-primary hover:underline">
          管理画面
        </Link>
      </nav>
    </header>
  );
}
