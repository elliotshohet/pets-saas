import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { auth } from '../lib/auth';
import { db } from '../lib/db';
const require = createRequire(import.meta.url);
const { encodeReply } = require('next/dist/compiled/react-server-dom-webpack/client.node');
const base = process.env.BETTER_AUTH_URL!;
const userIds: string[] = [];
try {
  const email = `${crypto.randomUUID()}@example.test`;
  const password = 'Disposable-action-test-123';
  const a = await auth.api.signUpEmail({
    body: { name: 'Action owner', email: `${crypto.randomUUID()}@example.test`, password },
  });
  userIds.push(a.user.id);
  const b = await auth.api.signUpEmail({ body: { name: 'Action attacker', email, password } });
  userIds.push(b.user.id);
  const login = await fetch(`${base}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  const pet = await db.pet.create({
    data: {
      ownerId: a.user.id,
      name: 'Action isolation target',
      species: 'Cat',
      records: {
        create: {
          title: 'Private action target',
          category: 'CHECKUP',
          date: new Date('2024-01-01'),
        },
      },
    },
    include: { records: true },
  });
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name: 'Tampered',
    species: 'Cat',
    birthDate: '',
    breed: '',
    notes: '',
    title: 'Tampered',
    category: 'CHECKUP',
    date: '2024-01-01',
    provider: '',
    confirm: 'yes',
  }))
    form.set(key, value);
  form.set('password', 'Must-not-echo-secret');
  await fetch(`${base}/pets/new`, { headers: { cookie } });
  await fetch(`${base}/pets/${pet.id}`, { headers: { cookie } });
  const manifest = JSON.parse(
    readFileSync('.next/dev/server/server-reference-manifest.json', 'utf8'),
  );
  const cases: [string, unknown[]][] = [
    ['savePetAction', [pet.id, {}, form]],
    ['deletePetAction', [pet.id, {}, form]],
    ['saveRecordAction', [pet.id, null, {}, form]],
    ['saveRecordAction', [pet.id, pet.records[0].id, {}, form]],
    ['deleteRecordAction', [pet.id, pet.records[0].id, {}, form]],
  ];
  for (const [name, args] of cases) {
    const action = Object.entries(manifest.node).find(
      ([, metadata]) => (metadata as { exportedName: string }).exportedName === name,
    )?.[0];
    assert.ok(action);
    const response = await fetch(`${base}/pets/${pet.id}`, {
      method: 'POST',
      headers: { 'next-action': action, origin: base, cookie },
      body: await encodeReply(args),
    });
    const text = await response.text();
    assert.doesNotMatch(text, /Must-not-echo-secret/);
    assert.match(text, /no longer exists/, `${name} must reach and deny the action`);
  }
  const action = Object.entries(manifest.node).find(
    ([, m]) => (m as { exportedName: string }).exportedName === 'savePetAction',
  )![0];
  const anonymous = await fetch(`${base}/pets/new`, {
    method: 'POST',
    headers: { 'next-action': action, origin: base },
    body: await encodeReply([null, {}, form]),
    redirect: 'manual',
  });
  assert.ok(
    anonymous.headers.get('x-action-redirect')?.includes('/sign-in') ||
      anonymous.headers.get('location')?.includes('/sign-in'),
  );
  assert.equal(
    (await db.pet.findUniqueOrThrow({ where: { id: pet.id } })).name,
    'Action isolation target',
  );
  assert.equal(
    (await db.medicalRecord.findUniqueOrThrow({ where: { id: pet.records[0].id } })).title,
    'Private action target',
  );
  assert.equal(await db.medicalRecord.count({ where: { petId: pet.id } }), 1);
  assert.equal(await db.pet.count({ where: { ownerId: b.user.id } }), 0);
  for (const path of [
    '/dashboard',
    '/pets',
    '/records',
    '/records/new',
    `/pets/${pet.id}`,
    `/pets/${pet.id}/edit`,
  ]) {
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), '/sign-in');
  }
  for (const id of [pet.id, 'missing']) {
    const response = await fetch(`${base}/pets/${id}`, { headers: { cookie } });
    const html = await response.text();
    // Streaming Next.js responses can send 200 before the not-found boundary resolves.
    assert.match(html, /This page has wandered off/);
    assert.doesNotMatch(html, /Action isolation target|Private action target/);
  }
  for (const path of ['/dashboard', '/pets?q=Action', `/records?pet=${pet.id}`, '/records/new']) {
    const response = await fetch(base + path, { headers: { cookie } });
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /Action isolation target|Private action target/);
    // Next.js dev overrides Cache-Control; production force-dynamic pages use private/no-store.
    assert.match(response.headers.get('cache-control')!, /private|no-cache/);
  }
  const forged = await fetch(`${base}/pets/${pet.id}`, {
    headers: { cookie: 'better-auth.session_token=forged' },
  });
  const forgedHtml = await forged.text();
  assert.doesNotMatch(forgedHtml, /Action isolation target|Private action target/);
  assert.match(forgedHtml, /sign-in/);
  console.log('Direct Server Action attacks and anonymous routes denied; database unchanged.');
} finally {
  await db.pet.deleteMany({ where: { ownerId: { in: userIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
}
