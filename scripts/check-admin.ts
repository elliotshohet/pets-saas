import assert from 'node:assert/strict';
import { auth } from '../lib/auth';
import { db } from '../lib/db';
const base = process.env.BETTER_AUTH_URL!;
const password = 'Disposable-admin-http-test-123';
const email = `${crypto.randomUUID()}@example.test`;
const member = await auth.api.signUpEmail({
  body: { name: 'HTTP admin test member', email, password },
});
try {
  const login = await fetch(`${base}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(';')[0])
    .join('; ');
  const synthetic = await db.user.findFirstOrThrow({ where: { isSynthetic: true } });
  const paths = [
    '/admin',
    '/admin/accounts',
    '/admin/care',
    '/admin/onboarding',
    '/admin/data-quality',
    '/admin/activity',
    '/admin/system-health',
    `/admin/accounts/${synthetic.analyticsId}`,
  ];
  for (const path of paths) {
    const anonymous = await fetch(base + path, { redirect: 'manual' });
    assert.equal(anonymous.status, 307);
    const normal = await fetch(base + path, { headers: { cookie } });
    const html = await normal.text();
    assert.match(html, /This page has wandered off/);
    assert.doesNotMatch(
      html,
      /Explore your community|Account directory|ACCOUNT DETAILS|A fuller picture of care/,
    );
  }
  await db.user.update({ where: { id: member.user.id }, data: { role: 'ADMIN' } });
  for (const path of paths) {
    const response = await fetch(base + path, { headers: { cookie } });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.doesNotMatch(html, /Something went wrong|Internal Server Error/);
  }
  const dashboard = await fetch(base + '/admin', { headers: { cookie } });
  assert.equal(dashboard.status, 200);
  assert.match(await dashboard.text(), /Explore your community/);
  const directory = await fetch(base + '/admin/accounts?q=zzzz-no-matching-account&page=999', {
    headers: { cookie },
  });
  assert.match(await directory.text(), /No accounts match/);
  const detail = await fetch(`${base}/admin/accounts/${synthetic.analyticsId}`, {
    headers: { cookie },
  });
  assert.equal(detail.status, 200);
  const detailHtml = await detail.text();
  assert.match(detailHtml, /Synthetic account/);
  assert.ok(detailHtml.includes(synthetic.email));
  const search = await fetch(`${base}/admin/accounts?q=${encodeURIComponent(synthetic.email)}`, {
    headers: { cookie },
  });
  assert.ok((await search.text()).includes(synthetic.email));
  await db.user.update({ where: { id: member.user.id }, data: { role: 'USER' } });
  const downgraded = await fetch(base + '/admin', { headers: { cookie } });
  assert.doesNotMatch(await downgraded.text(), /Explore your community/);
  console.log(
    'Admin pages: anonymous/member denial, live role revocation, directory and account detail verified.',
  );
} finally {
  await db.user.delete({ where: { id: member.user.id } });
  await db.$disconnect();
}
