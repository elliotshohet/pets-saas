import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../../lib/db';
import { auth } from '../../lib/auth';
import { ownedDb } from '../../lib/owned-db';
import { savePet, saveRecord, deletePet, deleteRecord } from '../../lib/mutations';
const users: string[] = [];
const runId = crypto.randomUUID().replaceAll('-', '');
const testIp = `2001:db8:${runId.slice(0, 4)}:${runId.slice(4, 8)}::1`;
const password = 'Fictional-test-password-123';
const petInput = {
  name: 'Private pet',
  species: 'Cat',
  breed: '',
  birthDate: '',
  notes: 'Private notes',
};
const recordInput = {
  title: 'Private visit',
  category: 'CHECKUP',
  date: '2024-03-01',
  provider: 'Private clinic',
  notes: 'Private record',
};
after(async () => {
  await db.pet.deleteMany({ where: { ownerId: { in: users } } });
  await db.user.deleteMany({ where: { id: { in: users } } });
  await db.rateLimit.deleteMany({ where: { key: { contains: testIp } } });
  await db.$disconnect();
});
async function request(path: string, body?: object, cookie?: string) {
  return auth.handler(
    new Request(`${process.env.BETTER_AUTH_URL}/api/auth/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': testIp,
        origin: process.env.BETTER_AUTH_URL!,
        ...(cookie ? { cookie } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  );
}
test('auth lifecycle and two-account data isolation', async () => {
  const emails = [0, 1].map(() => `${crypto.randomUUID()}@example.test`);
  for (const email of emails) {
    const response = await request('sign-up/email', { name: 'Test user', email, password });
    assert.equal(response.status, 200);
    users.push((await response.json()).user.id);
  }
  assert.equal(await ownedDb(users[1]).pet.count(), 0);
  assert.equal(
    (await request('sign-up/email', { name: 'Test user', email: emails[0], password })).ok,
    false,
  );
  assert.equal(
    (
      await request('sign-up/email', {
        name: 'Test user',
        email: `${crypto.randomUUID()}@example.test`,
        password: 'short',
      })
    ).ok,
    false,
  );
  assert.equal(
    (await request('sign-in/email', { email: emails[0], password: 'wrong-password' })).ok,
    false,
  );
  const login = await request('sign-in/email', { email: emails[0], password });
  assert.equal(login.status, 200);
  const cookie = login.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  assert.match(login.headers.get('set-cookie')!, /HttpOnly/i);
  assert.match(login.headers.get('set-cookie')!, /SameSite=Lax/i);
  assert.ok((await (await request('get-session', undefined, cookie)).json()).user);
  assert.equal(
    await (await request('get-session', undefined, 'better-auth.session_token=forged')).json(),
    null,
  );
  assert.equal(await (await request('get-session')).json(), null);
  const pet = await savePet(users[0], null, { ...petInput, ownerId: users[1] });
  const record = await saveRecord(users[0], pet.id, null, recordInput);
  assert.equal(pet.ownerId, users[0]);
  assert.equal(await ownedDb(users[1]).pet.count(), 0);
  assert.equal(await ownedDb(users[1]).medicalRecord.count(), 0);
  assert.deepEqual(await ownedDb(users[1]).pet.findMany(), []);
  assert.deepEqual(
    await ownedDb(users[1]).medicalRecord.findMany({ where: { petId: pet.id } }),
    [],
  );
  assert.equal(await ownedDb(users[1]).pet.findUnique({ where: { id: pet.id } }), null);
  assert.equal(
    await ownedDb(users[1]).medicalRecord.findUnique({ where: { id: record.id } }),
    null,
  );
  await assert.rejects(savePet(users[1], pet.id, petInput));
  await assert.rejects(deletePet(users[1], pet.id));
  await assert.rejects(saveRecord(users[1], pet.id, null, recordInput));
  await assert.rejects(saveRecord(users[1], pet.id, record.id, recordInput));
  await assert.rejects(deleteRecord(users[1], pet.id, record.id));
  assert.equal(await ownedDb(users[0]).pet.count(), 1);
  assert.equal(await ownedDb(users[0]).medicalRecord.count(), 1);
  assert.equal(
    (await ownedDb(users[0]).medicalRecord.findUnique({ where: { id: record.id } }))!.notes,
    'Private record',
  );
  await db.session.updateMany({ where: { userId: users[0] }, data: { expiresAt: new Date(0) } });
  assert.equal(await (await request('get-session', undefined, cookie)).json(), null);
  const again = await request('sign-in/email', { email: emails[0], password });
  const againCookie = again.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  assert.equal((await request('sign-out', {}, againCookie)).status, 200);
  assert.equal(await (await request('get-session', undefined, againCookie)).json(), null);
  const revoked = await request('sign-in/email', { email: emails[0], password });
  const revokedCookie = revoked.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  await db.session.deleteMany({ where: { userId: users[0] } });
  assert.equal(await (await request('get-session', undefined, revokedCookie)).json(), null);
});

test('authentication rate limiting persists in PostgreSQL', async () => {
  const ip = '203.0.113.22';
  let limited = false;
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await auth.handler(
      new Request(`${process.env.BETTER_AUTH_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: process.env.BETTER_AUTH_URL!,
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({
          email: 'missing-rate-test@example.test',
          password: 'Invalid-test-password-123',
        }),
      }),
    );
    if (response.status === 429) limited = true;
  }
  assert.ok(limited, 'repeated sign-in attempts must be throttled');
  assert.ok(await db.rateLimit.count({ where: { key: { contains: ip } } }));
  await db.rateLimit.deleteMany({ where: { key: { contains: ip } } });
});
