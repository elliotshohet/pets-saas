import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../../lib/db';
import { mutateMember } from '../../lib/admin-members';
import { openEmailSession } from '../../lib/email-access';
test('member CRUD requires an admin, protects admin accounts, revokes renamed sessions and cascades pet data', async () => {
  const admin = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Member test admin',
      email: `${crypto.randomUUID()}@example.test`,
      role: 'ADMIN',
    },
  });
  let memberId = '';
  try {
    const member = await mutateMember(admin.id, null, 'save', {
      name: 'Member fixture',
      email: `${crypto.randomUUID()}@example.test`,
    });
    assert.ok(member);
    memberId = member.id;
    await assert.rejects(
      mutateMember(member.id, member.analyticsId, 'save', { name: 'Forged', email: member.email }),
    );
    await assert.rejects(mutateMember(admin.id, admin.analyticsId, 'delete'));
    await assert.rejects(mutateMember(admin.id, null, 'save', { name: ' ', email: 'invalid' }));
    await assert.rejects(
      mutateMember(admin.id, null, 'save', { name: 'Duplicate', email: member.email }),
    );
    await openEmailSession(member.email);
    const updated = await mutateMember(admin.id, member.analyticsId, 'save', {
      name: 'Updated member',
      email: `${crypto.randomUUID()}@example.test`,
      role: 'ADMIN',
    });
    assert.equal(updated?.name, 'Updated member');
    assert.equal(updated?.role, 'USER');
    assert.equal(await db.emailSession.count({ where: { userId: member.id } }), 0);
    const pet = await db.pet.create({
      data: {
        ownerId: member.id,
        name: 'Fixture pet',
        species: 'Cat',
        records: {
          create: { title: 'Fixture checkup', category: 'CHECKUP', date: new Date('2024-01-01') },
        },
      },
    });
    await mutateMember(admin.id, member.analyticsId, 'delete');
    assert.equal(await db.user.findUnique({ where: { id: member.id } }), null);
    assert.equal(await db.pet.findUnique({ where: { id: pet.id } }), null);
    assert.equal(await db.medicalRecord.count({ where: { petId: pet.id } }), 0);
  } finally {
    if (memberId) {
      await db.pet.deleteMany({ where: { ownerId: memberId } });
      await db.user.deleteMany({ where: { id: memberId } });
    }
    await db.operationalEvent.deleteMany({ where: { actorId: admin.id } });
    await db.user.delete({ where: { id: admin.id } });
    await db.$disconnect();
  }
});
