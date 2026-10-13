import assert from 'node:assert/strict';
import { db } from '../lib/db';
import { auth } from '../lib/auth';
import { careOperation } from '../lib/care';
import { readFile } from 'node:fs/promises';
const base = process.env.BETTER_AUTH_URL!;
const emails = [
  `care-http-${crypto.randomUUID()}@example.test`,
  `care-http-${crypto.randomUUID()}@example.test`,
];
const users = await Promise.all(
  emails.map((email) =>
    auth.api.signUpEmail({
      body: { email, name: 'Care HTTP fixture', password: 'Disposable-care-http-password-123' },
    }),
  ),
);
const fixture = await db.pet.create({
  data: {
    ownerId: users[0].user.id,
    name: 'Private care HTTP fixture',
    species: 'Cat',
    records: {
      create: [
        { title: 'Included record', category: 'CHECKUP', date: new Date('2026-01-01') },
        { title: 'Omitted record', category: 'CHECKUP', date: new Date('2026-01-02') },
      ],
    },
  },
  include: { records: true },
});
const cookies: string[] = [];
try {
  for (let i = 0; i < 2; i++) {
    const login = await fetch(base + '/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        origin: base,
        'content-type': 'application/json',
        'x-forwarded-for': `2001:db8:${crypto.randomUUID().slice(0, 4)}::1`,
      },
      body: JSON.stringify({ email: emails[i], password: 'Disposable-care-http-password-123' }),
    });
    assert.equal(login.status, 200);
    cookies.push(
      login.headers
        .getSetCookie()
        .map((v) => v.split(';')[0])
        .join('; '),
    );
  }
  const f = new FormData();
  f.set(
    'file',
    new File([await readFile('public/seed-pets/cat.jpg')], 'photo.jpg', { type: 'image/jpeg' }),
  );
  await careOperation(users[0].user.id, fixture.id, 'photo', f);
  const upload = new FormData();
  upload.set(
    'file',
    new File(['%PDF-1.4\n% fictional test document\n%%EOF'], 'fixture.pdf', {
      type: 'application/pdf',
    }),
  );
  upload.set('recordId', fixture.records[0].id);
  upload.set('title', 'Private original');
  await careOperation(users[0].user.id, fixture.id, 'document', upload);
  const file = await db.petMedia.findFirstOrThrow({
    where: { petId: fixture.id, kind: 'DOCUMENT' },
  });
  for (const path of [
    `/api/pets/${fixture.id}/photo`,
    `/api/files/${file.id}`,
    `/api/pets/${fixture.id}/calendar`,
  ]) {
    const owner = await fetch(base + path, { headers: { cookie: cookies[0] } });
    assert.equal(owner.status, 200);
    assert.match(owner.headers.get('cache-control')!, /private/);
    const other = await fetch(base + path, { headers: { cookie: cookies[1] } });
    assert.equal(other.status, 404);
    const anonymous = await fetch(base + path, { redirect: 'manual' });
    assert.equal(anonymous.status, 307);
  }
  const summary = await fetch(
    `${base}/pets/${fixture.id}/summary?selected=1&records=${fixture.records[0].id}`,
    { headers: { cookie: cookies[0] } },
  );
  assert.equal(summary.status, 200);
  const html = await summary.text();
  assert.match(html, /Selected medical history/);
  assert.match(html, /Private original/);
  const selectedSection = html.slice(
    html.indexOf('<h2>Selected medical history'),
    html.indexOf('</section>', html.indexOf('<h2>Selected medical history')),
  );
  assert.match(selectedSection, /Included record/);
  assert.doesNotMatch(selectedSection, /Omitted record/);
  await db.session.deleteMany({ where: { userId: users[0].user.id } });
  const revoked = await fetch(`${base}/api/files/${file.id}`, {
    headers: { cookie: cookies[0] },
    redirect: 'manual',
  });
  assert.equal(revoked.status, 307);
  console.log(
    'Private photos/documents/calendar: owner success, foreign 404, anonymous denial and selected summary verified.',
  );
} finally {
  await db.pet.delete({ where: { id: fixture.id } });
  await db.user.deleteMany({ where: { email: { in: emails } } });
  await db.$disconnect();
}
