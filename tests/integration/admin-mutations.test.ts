import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../../lib/db';
import { mutateAdminAccount } from '../../lib/admin-mutations';
test('admin CRUD stays within the selected account and records the acting admin', async () => {
  const users = await Promise.all(
    ['ADMIN', 'USER', 'USER'].map((role) =>
      db.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Admin CRUD fixture',
          email: `${crypto.randomUUID()}@example.test`,
          role,
        },
      }),
    ),
  );
  const [admin, a, b] = users;
  const petInput = {
    name: 'Admin-created pet',
    species: 'Cat',
    breed: '',
    birthDate: '',
    notes: '',
  };
  const recordInput = {
    title: 'Admin-created checkup',
    category: 'CHECKUP',
    date: '2026-01-01',
    provider: '',
    notes: '',
  };
  try {
    await assert.rejects(mutateAdminAccount(a.id, a.analyticsId, 'pet.save', null, null, petInput));
    const pet = await mutateAdminAccount(admin.id, a.analyticsId, 'pet.save', null, null, petInput);
    const other = await mutateAdminAccount(
      admin.id,
      b.analyticsId,
      'pet.save',
      null,
      null,
      petInput,
    );
    assert.equal((await db.pet.findUniqueOrThrow({ where: { id: pet.id } })).ownerId, a.id);
    const record = await mutateAdminAccount(
      admin.id,
      a.analyticsId,
      'record.save',
      pet.id,
      null,
      recordInput,
    );
    const foreign = await mutateAdminAccount(
      admin.id,
      b.analyticsId,
      'record.save',
      other.id,
      null,
      recordInput,
    );
    for (const operation of ['pet.save', 'pet.delete', 'record.save', 'record.delete'] as const)
      await assert.rejects(
        mutateAdminAccount(
          admin.id,
          a.analyticsId,
          operation,
          other.id,
          foreign.id,
          operation.startsWith('pet') ? petInput : recordInput,
        ),
      );
    await assert.rejects(
      mutateAdminAccount(admin.id, a.analyticsId, 'record.save', pet.id, foreign.id, recordInput),
    );
    await assert.rejects(
      mutateAdminAccount(admin.id, a.analyticsId, 'record.delete', pet.id, foreign.id),
    );
    await mutateAdminAccount(admin.id, a.analyticsId, 'pet.save', pet.id, null, {
      ...petInput,
      name: 'Updated pet',
      ownerId: b.id,
    });
    await mutateAdminAccount(admin.id, a.analyticsId, 'record.save', pet.id, record.id, {
      ...recordInput,
      title: 'Updated record',
    });
    assert.equal((await db.pet.findUniqueOrThrow({ where: { id: pet.id } })).ownerId, a.id);
    assert.equal(
      (await db.medicalRecord.findUniqueOrThrow({ where: { id: record.id } })).title,
      'Updated record',
    );
    assert.equal(
      (await db.medicalRecord.findUniqueOrThrow({ where: { id: foreign.id } })).title,
      recordInput.title,
    );
    await mutateAdminAccount(admin.id, a.analyticsId, 'record.delete', pet.id, record.id);
    await mutateAdminAccount(admin.id, a.analyticsId, 'record.save', pet.id, null, recordInput);
    await mutateAdminAccount(admin.id, a.analyticsId, 'pet.delete', pet.id, null);
    assert.equal(await db.medicalRecord.count({ where: { petId: pet.id } }), 0);
    assert.ok(
      await db.operationalEvent.count({
        where: { actorId: admin.id, kind: 'admin.record.updated' },
      }),
    );
    await db.user.update({ where: { id: admin.id }, data: { role: 'USER' } });
    await assert.rejects(mutateAdminAccount(admin.id, b.analyticsId, 'pet.delete', other.id, null));
  } finally {
    await db.pet.deleteMany({ where: { ownerId: { in: users.map((u) => u.id) } } });
    await db.operationalEvent.deleteMany({ where: { actorId: { in: users.map((u) => u.id) } } });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await db.$disconnect();
  }
});
