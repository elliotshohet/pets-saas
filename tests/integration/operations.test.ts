import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../../lib/db';
import { savePet, deletePet } from '../../lib/mutations';
import { onboardingData, qualityData, activityData, healthData } from '../../lib/admin-operations';
test('operations track successful writes, reject member reads, and calculate admin checks', async () => {
  const member = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Operations fixture',
      email: `${crypto.randomUUID()}@example.test`,
    },
  });
  const admin = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Admin fixture',
      email: `${crypto.randomUUID()}@example.test`,
      role: 'ADMIN',
    },
  });
  try {
    for (const loader of [onboardingData, qualityData, activityData, healthData])
      await assert.rejects(loader(member.id));
    const pet = await savePet(member.id, null, {
      name: 'Fixture pet',
      species: 'Cat',
      breed: '',
      birthDate: '',
      notes: '',
    });
    assert.equal(
      await db.operationalEvent.count({ where: { actorId: member.id, kind: 'pet.created' } }),
      1,
    );
    await assert.rejects(deletePet(admin.id, pet.id));
    assert.equal(await db.operationalEvent.count({ where: { actorId: admin.id } }), 0);
    const [onboarding, quality, activity, health] = await Promise.all([
      onboardingData(admin.id),
      qualityData(admin.id),
      activityData(admin.id),
      healthData(admin.id),
    ]);
    assert.equal(onboarding.total, onboarding.noPets + onboarding.noRecords + onboarding.activated);
    assert.ok(quality.examples.some((p) => p.name === 'Fixture pet'));
    assert.ok(activity.some((e) => e.kind === 'pet.created'));
    assert.equal(health.database, true);
    assert.ok(!JSON.stringify(activity).includes('Fixture pet'));
    await deletePet(member.id, pet.id);
    assert.equal(
      await db.operationalEvent.count({ where: { actorId: member.id, kind: 'pet.deleted' } }),
      1,
    );
  } finally {
    await db.pet.deleteMany({ where: { ownerId: member.id } });
    await db.operationalEvent.deleteMany({ where: { actorId: { in: [member.id, admin.id] } } });
    await db.user.deleteMany({ where: { id: { in: [member.id, admin.id] } } });
    await db.$disconnect();
  }
});
