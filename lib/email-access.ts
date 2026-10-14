import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from './db';
import { EMAIL_SESSION_SECONDS } from './email-cookie';
const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
const hash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function openEmailSession(input: unknown) {
  const email = emailSchema.parse(input);
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const token = randomBytes(32).toString('base64url');
  return db.$transaction(async (tx) => {
    await tx.emailSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const user = await tx.user.upsert({
      where: { email },
      create: {
        id: randomUUID(),
        email,
        name: email.split('@')[0],
        role: email === adminEmail ? 'ADMIN' : 'USER',
      },
      update: email === adminEmail ? { role: 'ADMIN' } : {},
    });
    await tx.emailSession.create({
      data: {
        tokenHash: hash(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + EMAIL_SESSION_SECONDS * 1000),
      },
    });
    return { user, token };
  });
}
export async function emailSessionUser(token: string | undefined) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const session = await db.emailSession.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: true },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
}
export async function closeEmailSession(token: string | undefined) {
  if (token) await db.emailSession.deleteMany({ where: { tokenHash: hash(token) } });
}
