import 'dotenv/config';
import { localEmailMode } from './local-email-mode';
import { localEmailPlugin } from './local-email-plugin';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;
if (!secret || secret.length < 32 || !baseURL)
  throw new Error('Configure BETTER_AUTH_SECRET (at least 32 characters) and BETTER_AUTH_URL.');
export const auth = betterAuth({
  secret,
  baseURL,
  trustedOrigins: [new URL(baseURL).origin],
  database: prismaAdapter(db, { provider: 'postgresql' }),
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'USER', input: false },
      isSynthetic: { type: 'boolean', defaultValue: false, input: false },
    },
  },
  emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
  session: { expiresIn: 60 * 60 * 8, disableSessionRefresh: true, cookieCache: { enabled: false } },
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 30,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/local-email': { window: 60, max: 5 },
      '/sign-up/email': { window: 60, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: baseURL.startsWith('https:'),
    defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
  },
  logger: { disabled: true },
  plugins: [...(localEmailMode() ? [localEmailPlugin] : []), nextCookies()],
});
