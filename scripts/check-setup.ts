import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { db } from '../lib/db';
// Run only against a disposable database, never the working workspace.
if (!process.env.DATABASE_URL?.endsWith('/pets_auth_setup_check'))
  throw new Error('Use disposable pets_auth_setup_check database.');
const run = (args: string[]) => {
  const result = spawnSync('npm', args, { stdio: 'inherit', env: process.env });
  assert.equal(result.status, 0);
};
const owner = await db.user.findUniqueOrThrow({ where: { email: process.env.DEMO_EMAIL! } });
const before = await db.pet.findMany({
  where: { ownerId: owner.id },
  orderBy: { id: 'asc' },
  select: { id: true },
});
const credentials = await db.account.findFirstOrThrow({ where: { userId: owner.id } });
run(['run', 'db:setup']);
assert.deepEqual(
  await db.pet.findMany({
    where: { ownerId: owner.id },
    orderBy: { id: 'asc' },
    select: { id: true },
  }),
  before,
);
assert.equal(
  (await db.account.findFirstOrThrow({ where: { userId: owner.id } })).password,
  credentials.password,
);
assert.equal(await db.medicalRecord.count({ where: { pet: { ownerId: owner.id } } }), 16);
const other = await db.user.create({
  data: { id: crypto.randomUUID(), name: 'Other', email: `${crypto.randomUUID()}@example.test` },
});
const pet = await db.pet.create({
  data: {
    name: 'Other pet',
    species: 'Cat',
    ownerId: other.id,
    records: {
      create: { title: 'Other visit', category: 'CHECKUP', date: new Date('2024-01-01') },
    },
  },
  include: { records: true },
});
run(['run', 'db:seed', '--', '--reset']);
assert.ok(await db.pet.findUnique({ where: { id: pet.id } }));
assert.ok(await db.medicalRecord.findUnique({ where: { id: pet.records[0].id } }));
assert.equal(await db.pet.count({ where: { ownerId: owner.id } }), 4);
assert.equal(await db.medicalRecord.count({ where: { pet: { ownerId: owner.id } } }), 16);
assert.equal(
  (await db.account.findFirstOrThrow({ where: { userId: owner.id } })).password,
  credentials.password,
);
console.log('Fresh setup, repeated setup, credentials and demo-only reset verified.');
await db.$disconnect();
