import { NextResponse } from 'next/server';
import { z } from 'zod';
import { openEmailSession } from '@/lib/email-access';
import { EMAIL_COOKIE, EMAIL_SESSION_SECONDS } from '@/lib/email-cookie';
import { boundedBody, requestFailure } from '@/lib/http';
import { HttpError } from '@/lib/http';
export async function POST(request: Request) {
  try {
    const origin = new URL(process.env.APP_URL || request.url).origin;
    if (request.headers.get('origin') !== origin)
      throw new HttpError('Submit login from this website.', 403);
    const { email } = z
      .object({ email: z.string().max(254) })
      .parse(JSON.parse((await boundedBody(request, 2048)).toString()));
    const { token } = await openEmailSession(email);
    const response = NextResponse.json({
      redirect: '/dashboard',
    });
    response.cookies.set(EMAIL_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: origin.startsWith('https:'),
      path: '/',
      maxAge: EMAIL_SESSION_SECONDS,
    });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    return requestFailure(error);
  }
}
