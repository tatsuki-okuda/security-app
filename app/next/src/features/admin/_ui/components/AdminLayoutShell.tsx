import { Bell, User } from 'lucide-react';
import { ReactNode } from 'react';

import { AdminSidebar } from './AdminSidebar';

export function AdminLayoutShell({ children, logoutAction }: { children: ReactNode; logoutAction: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text-primary">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end gap-4 px-6 md:px-8 xl:px-12 w-full max-w-5xl mx-auto">
          <Bell className="h-5 w-5 text-text-secondary cursor-pointer hover:text-text-primary transition-colors" />
          <User className="h-5 w-5 text-text-secondary cursor-pointer hover:text-text-primary transition-colors" />
          {logoutAction}
        </header>
        <main className="flex-1 overflow-auto px-6 py-6 md:px-8 xl:px-12 w-full max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
