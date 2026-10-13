import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { trackEvent } from '@/lib/operations';
const handlers = toNextJsHandler(auth);
export const GET = handlers.GET;
export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  try {
    const response = await handlers.POST(request);
    if (response.status === 429) await trackEvent('auth.rate_limited');
    else if (response.status >= 400)
      await trackEvent(response.status >= 500 ? 'app.error' : 'auth.failure');
    else if (path.endsWith('/sign-up/email')) await trackEvent('auth.signup');
    else if (path.endsWith('/sign-in/email') || path.endsWith('/local-email'))
      await trackEvent('auth.login');
    else if (path.endsWith('/sign-out')) await trackEvent('auth.logout');
    return response;
  } catch (error) {
    await trackEvent('app.error');
    throw error;
  }
}
