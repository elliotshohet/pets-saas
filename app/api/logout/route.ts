import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { closeEmailSession } from '@/lib/email-access';
import { EMAIL_COOKIE } from '@/lib/email-cookie';
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(process.env.APP_URL || request.url).origin)
    return NextResponse.json({ error: 'Submit logout from this website.' }, { status: 403 });
  await closeEmailSession((await cookies()).get(EMAIL_COOKIE)?.value);
  const response = NextResponse.json({ success: true });
  response.cookies.set(EMAIL_COOKIE, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' });
  return response;
}
