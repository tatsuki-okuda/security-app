'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'ダッシュボード', href: '/admin' },
    { name: '参加者登録', href: '/admin/enroll' },
    { name: '参加者一覧', href: '/admin/users' },
    { name: '訓練一覧', href: '/admin/drills' },
    { name: '訓練作成', href: '/admin/drills/create' },
  ];

  return (
    <aside className="flex h-full w-[240px] flex-col gap-6 border-r border-border bg-bg p-6 pt-8">
      <div className="text-lg font-bold text-text-primary">Admin</div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          let isActive = false;
          if (link.href === '/admin') {
            isActive = pathname === '/admin';
          } else if (link.href === '/admin/drills') {
            isActive =
              pathname === '/admin/drills' ||
              (pathname?.startsWith('/admin/drills/') && !pathname?.startsWith('/admin/drills/create') && !pathname?.endsWith('/edit'));
          } else {
            isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
