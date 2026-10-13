import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
// Optimistic redirect only. Every protected read/action validates the database session.
export function proxy(request: NextRequest) {
  const response = !getSessionCookie(request)
    ? NextResponse.redirect(new URL('/sign-in', request.url))
    : NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = {
  matcher: ['/dashboard/:path*', '/pets/:path*', '/records/:path*', '/admin/:path*'],
};
