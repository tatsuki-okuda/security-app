import { auth, signIn, signOut } from '@/auth';

import { AdminLayoutShell } from '../../features/admin/_ui/components/AdminLayoutShell';

export const dynamic = 'force-dynamic';

const LoginModal = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-sm space-y-4 rounded-2xl bg-surface p-6 shadow-xl">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold text-text-primary">管理者ログインが必要です</h2>
        <p className="text-sm text-text-secondary">このページを表示するには管理者権限でのログインが必要です。</p>
      </div>
      <div className="space-y-3 pt-4">
        <form
          action={async () => {
            'use server';
            await signIn('google');
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Googleでログイン
          </button>
        </form>
        <form
          action={async () => {
            'use server';
            await signIn('line');
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#05b34c] focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:ring-offset-2"
          >
            LINEでログイン
          </button>
        </form>
      </div>
    </div>
  </div>
);

const Forbidden = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg px-4">
    <div className="w-full max-w-lg space-y-3 rounded-2xl bg-surface p-8 shadow">
      <h2 className="text-xl font-bold text-text-primary">権限がありません</h2>
      <p className="text-sm text-text-secondary">管理者ロールでログインしてから再度アクセスしてください。</p>
      <p className="text-xs text-text-secondary">疑わしい場合は管理者に連絡してください。</p>
    </div>
  </div>
);

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (process.env.AUTH_BYPASS !== 'true') {
    if (!session?.user) {
      return <LoginModal />;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any).role;

    if (role !== 'admin') {
      return <Forbidden />;
    }
  }

  const logoutAction = (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/' });
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-primary cursor-pointer transition-all duration-200 hover:bg-border hover:shadow-md active:translate-y-px"
      >
        ログアウト
      </button>
    </form>
  );

  return <AdminLayoutShell logoutAction={logoutAction}>{children}</AdminLayoutShell>;
}