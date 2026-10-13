import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../../lib/db';
import { auth } from '../../lib/auth';
import { isAdmin } from '../../lib/admin-access';
import { adminOverview, adminAccounts, adminAccount } from '../../lib/admin-data';
import { seedPopulation } from '../../prisma/population';
const ids: string[] = [];
after(async () => {
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
});
test('administrator access is enforced and signup cannot grant privileges', async () => {
  const result = await auth.api.signUpEmail({
    body: {
      name: 'Admin test member',
      email: `${crypto.randomUUID()}@example.test`,
      password: 'Disposable-admin-test-123',
      role: 'ADMIN',
      isSynthetic: true,
    } as { name: string; email: string; password: string },
  });
  ids.push(result.user.id);
  const user = await db.user.findUniqueOrThrow({ where: { id: result.user.id } });
  assert.equal(user.role, 'USER');
  assert.equal(user.isSynthetic, false);
  assert.equal(await isAdmin(user.id), false);
  await assert.rejects(adminOverview(user.id));
  await assert.rejects(adminAccounts(user.id, '', '', 1));
  await assert.rejects(adminAccount(user.id, user.id));
  await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  const overview = await adminOverview(user.id);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const currentMonth = new Date().getUTCMonth();
  assert.deepEqual(
    overview.growth.map((item) => item.month),
    Array.from({ length: 12 }, (_, index) => monthNames[(currentMonth + 1 + index) % 12]),
  );
  assert.ok(overview.accounts >= 1001);
  const directory = await adminAccounts(user.id, user.analyticsId.slice(0, 8), '', 1);
  assert.equal(directory.users.length, 1);
  const detail = await adminAccount(user.id, user.analyticsId);
  assert.ok(detail);
  assert.equal('accounts' in detail, false);
  assert.equal('sessions' in detail, false);
  assert.equal('name' in detail, false);
  assert.equal(detail.email, user.email);
  assert.equal(await adminAccount(user.id, user.id), null);
  assert.equal((await adminAccounts(user.id, user.email, '', 1)).total, 1);
  await db.user.update({ where: { id: user.id }, data: { role: 'USER' } });
  await assert.rejects(adminOverview(user.id));
});
test('synthetic community is complete, coherent and idempotent', async () => {
  await seedPopulation();
  const users = await db.user.findMany({
    where: { isSynthetic: true },
    include: { accounts: true, pets: { include: { records: true } } },
  });
  assert.equal(users.length, 1000);
  assert.equal(new Set(users.map((user) => user.accounts[0]?.password)).size, 1000);
  const snapshot = users
    .map((user) => [user.id, user.accounts[0].password, user.pets.length])
    .sort();
  const now = new Date();
  assert.ok(users.some((user) => user.pets.length === 0));
  assert.ok(users.some((user) => user.pets.length > 2));
  assert.ok(new Set(users.map((user) => user.createdAt.toISOString().slice(0, 7))).size > 8);
  for (const user of users) {
    assert.equal(user.role, 'USER');
    assert.match(user.email, /@example\.test$/);
    assert.equal(user.accounts.length, 1);
    assert.ok(user.accounts[0].password);
    assert.ok(user.createdAt <= now);
    for (const pet of user.pets) {
      assert.equal(pet.ownerId, user.id);
      assert.ok(pet.createdAt >= user.createdAt);
      assert.ok(pet.birthDate! <= pet.createdAt);
      for (const record of pet.records) {
        assert.equal(record.petId, pet.id);
        assert.ok(record.date <= now);
        assert.ok(record.date >= pet.birthDate!);
        assert.ok(record.createdAt >= pet.createdAt);
        assert.ok(record.updatedAt <= now);
      }
    }
  }
  await seedPopulation();
  const repeated = await db.user.findMany({
    where: { isSynthetic: true },
    include: { accounts: true, _count: { select: { pets: true } } },
  });
  assert.deepEqual(
    repeated.map((user) => [user.id, user.accounts[0].password, user._count.pets]).sort(),
    snapshot,
  );
});

test('admin details expose identities and care history only to administrators', async () => {
  const owner = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'CANARY_PERSON_NAME',
      email: `canary-${crypto.randomUUID()}@example.test`,
    },
  });
  ids.push(owner.id);
  const admin = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'CANARY_ADMIN_NAME',
      email: `admin-canary-${crypto.randomUUID()}@example.test`,
      role: 'ADMIN',
    },
  });
  ids.push(admin.id);
  const pet = await db.pet.create({
    data: {
      ownerId: owner.id,
      name: 'CANARY_PET_NAME',
      species: 'Cat',
      breed: 'CANARY_BREED',
      notes: 'CANARY_PERSONAL_NOTES',
      birthDate: new Date('2020-01-01'),
      records: {
        create: {
          title: 'CANARY_MEDICAL_TITLE',
          provider: 'CANARY_CLINIC_NAME',
          notes: 'CANARY_RECORD_NOTES',
          category: 'CHECKUP',
          date: new Date('2024-01-01'),
        },
      },
    },
  });
  try {
    const [overview, directory, detail] = await Promise.all([
      adminOverview(admin.id),
      adminAccounts(admin.id, owner.analyticsId, '', 1),
      adminAccount(admin.id, owner.analyticsId),
    ]);
    const encoded = JSON.stringify({ overview, directory, detail });
    assert.match(encoded, /CANARY_PERSON_NAME/);
    assert.match(encoded, /CANARY_MEDICAL_TITLE/);
    assert.equal(detail?.email, owner.email);
    assert.equal((await adminAccounts(admin.id, owner.email, '', 1)).total, 1);
    await assert.rejects(adminAccount(owner.id, owner.analyticsId));
    assert.doesNotMatch(encoded, /"password"|"token"/);
    assert.ok(detail);
    assert.equal(detail.petCount, 1);
    assert.equal(detail.recordCount, 1);
    assert.equal(directory.users[0].id, owner.analyticsId);
    assert.notEqual(directory.users[0].id, owner.id);
  } finally {
    await db.pet.delete({ where: { id: pet.id } });
  }
});
