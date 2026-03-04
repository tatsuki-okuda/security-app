import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

const guestAllowedPaths = [
  /^\/learn(\/|$)/,
  /^\/t(\/|$)/,
  /^\/error\/invalid-token(\/|$)/,
  /^\/settings\/opt-out(\/|$)/,
];

const adminPaths = /^\/admin(\/|$)/;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (guestAllowedPaths.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  if (process.env.AUTH_BYPASS === 'true') {
    return NextResponse.next();
  }

  // Allow Auth.js endpoints to bypass the custom 401 response early so NextAuth handles the callback/login process itself
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith('/api') || req.headers.has('x-action'); // Simple check for protected API or Server Actions
  const user = req.auth?.user;

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Allow page requests to let component-level modal handle unauthorized state
    return NextResponse.next();
  }

  if (adminPaths.test(pathname)) {
    // role property was added via jwt session callback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (user as any).role;
    if (role !== 'admin') {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
