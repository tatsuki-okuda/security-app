import Google from 'next-auth/providers/google';
import LineProvider from 'next-auth/providers/line';

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    LineProvider({
      clientId: process.env.AUTH_LINE_ID,
      clientSecret: process.env.AUTH_LINE_SECRET,
      // Request email from LINE API
      authorization: { params: { scope: 'profile openid email' } },
    }),
  ],
  session: {
    // We use JWT instead of database sessions so middleware can read the session
    // without doing a database lookup at the Edge.
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Upon initial sign in, the user object is available.
      if (user) {
        token.id = user.id;
        // The user object here comes from the DB (via PrismaAdapter),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let role = (user as any).role || 'user';

        // 環境変数 AUTH_ADMIN_EMAILS に設定されたメールアドレスの場合は強制的に admin ロールを付与する
        const adminEmails = process.env.AUTH_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];
        if (user.email && adminEmails.includes(user.email)) {
          role = 'admin';
        }

        token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer values from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    // Custom sign-in page, in our case the modal within /admin handles it,
    // but setting this prevents NextAuth from showing its default page if unauthenticated access happens.
    signIn: '/admin',
  },
  debug: true,
} satisfies NextAuthConfig;
