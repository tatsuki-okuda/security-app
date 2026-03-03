import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const guestAllowedPaths = [
  /^\/learn(\/|$)/,
  /^\/t(\/|$)/,
  /^\/error\/invalid-token(\/|$)/,
  /^\/settings\/opt-out(\/|$)/,
];

const adminPaths = /^\/admin(\/|$)/;

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (guestAllowedPaths.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  if (process.env.AUTH_BYPASS === 'true') {
    return NextResponse.next();
  }

  const userId = request.cookies.get('sd-user')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (adminPaths.test(pathname)) {
    const role = request.cookies.get('sd-role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
