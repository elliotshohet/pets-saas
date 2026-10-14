import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../../lib/db';
import { savePet, saveRecord, deletePet, deleteRecord } from '../../lib/mutations';
const petInput = {
  name: 'Integration test pet',
  species: 'Cat',
  breed: '',
  birthDate: '2020-05-05',
  notes: 'Fictional automated test data',
};
const recordInput = {
  title: 'Integration record',
  category: 'CHECKUP',
  date: '2024-03-01',
  provider: 'Test clinic',
  notes: '',
};
let ownerId: string;
before(async () => {
  ownerId = (
    await db.user.create({
      data: { id: crypto.randomUUID(), name: 'Test', email: `${crypto.randomUUID()}@example.test` },
    })
  ).id;
});
after(async () => {
  await db.user.delete({ where: { id: ownerId } });
  await db.$disconnect();
});
test('CRUD, scoped record IDs, and cascade deletion persist in Postgres', async () => {
  const pet = await savePet(ownerId, null, petInput);
  const other = await savePet(ownerId, null, { ...petInput, name: 'Other integration pet' });
  try {
    await savePet(ownerId, pet.id, { ...petInput, name: 'Edited test pet' });
    assert.equal(
      (await db.pet.findUniqueOrThrow({ where: { id: pet.id } })).name,
      'Edited test pet',
    );
    const record = await saveRecord(ownerId, pet.id, null, recordInput);
    assert.equal(
      (await db.pet.findUniqueOrThrow({ where: { id: pet.id }, include: { records: true } }))
        .records.length,
      1,
    );
    await assert.rejects(saveRecord(ownerId, other.id, record.id, recordInput));
    await assert.rejects(deleteRecord(ownerId, other.id, record.id));
    await saveRecord(ownerId, pet.id, record.id, { ...recordInput, notes: 'Updated notes' });
    assert.equal(
      (await db.medicalRecord.findUniqueOrThrow({ where: { id: record.id } })).notes,
      'Updated notes',
    );
    await deleteRecord(ownerId, pet.id, record.id);
    assert.equal(await db.medicalRecord.count({ where: { petId: pet.id } }), 0);
    await saveRecord(ownerId, pet.id, null, recordInput);
    await deletePet(ownerId, pet.id);
    assert.equal(
      await db.medicalRecord.count({ where: { petId: pet.id } }),
      0,
      'deleting pet cascades records',
    );
  } finally {
    await db.pet.deleteMany({ where: { id: { in: [pet.id, other.id] } } });
  }
});
test('invalid data is rejected before writing', async () => {
  const count = await db.pet.count({ where: { ownerId } });
  await assert.rejects(savePet(ownerId, null, { ...petInput, name: ' ' }));
  assert.equal(await db.pet.count({ where: { ownerId } }), count);
});
