import { createAuthEndpoint, APIError } from 'better-auth/api';
import { setSessionCookie } from 'better-auth/cookies';
import { z } from 'zod';
import { localEmailMode } from './local-email-mode';
export const localEmailPlugin = {
  id: 'local-email-demo',
  endpoints: {
    localEmailLogin: createAuthEndpoint(
      '/local-email',
      { method: 'POST', body: z.object({ email: z.email().max(254) }) },
      async (ctx) => {
        if (!localEmailMode()) throw new APIError('NOT_FOUND');
        if (ctx.headers?.get('origin') !== new URL(process.env.BETTER_AUTH_URL!).origin)
          throw new APIError('FORBIDDEN', { message: 'Untrusted origin' });
        const email = ctx.body.email.trim().toLowerCase();
        let user = await ctx.context.internalAdapter.findUserByEmail(email);
        if (!user) {
          const created = await ctx.context.internalAdapter.createUser(
            {
              email,
              name: email.split('@')[0],
              emailVerified: false,
            },
            { method: 'email-password' },
          );
          user = await ctx.context.internalAdapter.findUserByEmail(created.email);
        }
        if (!user) throw new APIError('INTERNAL_SERVER_ERROR');
        const session = await ctx.context.internalAdapter.createSession(user.user.id);
        if (!session) throw new APIError('INTERNAL_SERVER_ERROR');
        await setSessionCookie(ctx, { session, user: user.user });
        return ctx.json({ success: true });
      },
    ),
  },
};
