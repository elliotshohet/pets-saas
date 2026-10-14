import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { openEmailSession, emailSessionUser, closeEmailSession } from '../../lib/email-access';
import { db } from '../../lib/db';

test('email-only sessions normalize identities, reject forged/expired cookies and log out independently', async () => {
  const email = `${randomUUID()}@example.test`;
  const first = await openEmailSession(`  ${email.toUpperCase()}  `);
  try {
    assert.equal(first.user.email, email);
    assert.equal(first.user.role, 'USER');
    assert.equal((await emailSessionUser(first.token))?.id, first.user.id);
    assert.equal(await emailSessionUser('forged'), null);
    const second = await openEmailSession(email);
    assert.equal(second.user.id, first.user.id);
    await closeEmailSession(first.token);
    assert.equal(await emailSessionUser(first.token), null);
    assert.equal((await emailSessionUser(second.token))?.id, first.user.id);
    await db.emailSession.updateMany({
      where: { userId: first.user.id },
      data: { expiresAt: new Date(0) },
    });
    assert.equal(await emailSessionUser(second.token), null);
    await assert.rejects(openEmailSession('not-an-email'));
  } finally {
    await db.user.delete({ where: { id: first.user.id } });
    await db.$disconnect();
  }
});
