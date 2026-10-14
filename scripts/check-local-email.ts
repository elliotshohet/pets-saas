import assert from 'node:assert/strict';
import { db } from '../lib/db';
const base = process.env.APP_URL!;
const testIp = `2001:db8:${crypto.randomUUID().slice(0, 4)}::1`;
const email = `local-login-${crypto.randomUUID()}@example.test`;
try {
  const login = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'x-forwarded-for': testIp, origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ email, role: 'ADMIN' }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers
    .getSetCookie()
    .map((v) => v.split(';')[0])
    .join('; ');
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  assert.equal(user.role, 'USER');
  const dashboard = await fetch(`${base}/dashboard`, { headers: { cookie } });
  assert.equal(dashboard.status, 200);
  const splash = await fetch(`${base}/`, { headers: { cookie } });
  assert.equal(splash.status, 200);
  assert.match(await splash.text(), /href="\/dashboard"/);
  for (const path of ['/sign-in', '/sign-up']) {
    const destination = path === '/sign-up' ? '/sign-in' : '/dashboard';
    const entry = await fetch(`${base}${path}`, { headers: { cookie }, redirect: 'manual' });
    if (entry.status === 307) {
      assert.equal(new URL(entry.headers.get('location')!, base).pathname, destination);
    } else {
      assert.equal(entry.status, 200);
      assert.match(
        await entry.text(),
        new RegExp(`<meta[^>]+http-equiv="refresh"[^>]+content="[0-9]+;url=${destination}"`),
      );
    }
  }
  const afterSplash = await fetch(`${base}/dashboard`, { headers: { cookie } });
  assert.equal(afterSplash.status, 200);
  const anonymous = await fetch(`${base}/`);
  assert.equal(anonymous.status, 200);
  assert.match(await anonymous.text(), /Get started/);
  const again = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'x-forwarded-for': testIp, origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  assert.equal(again.status, 200);
  assert.equal(await db.user.count({ where: { email } }), 1);
  const invalid = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'x-forwarded-for': testIp, origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  assert.equal(invalid.status, 400);
  const foreign = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: {
      'x-forwarded-for': testIp,
      origin: 'https://untrusted.example',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  assert.equal(foreign.status, 403);
  console.log(
    'Unverified email-only login: creation, reuse, sessions, validation and origin checks passed.',
  );
} finally {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
}
