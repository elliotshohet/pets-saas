import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { db } from '../../lib/db';
import { careOperation, normalizeFile, accessPet } from '../../lib/care';
const form = (data: Record<string, string | File>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
};
test('care files, essentials, observations persist with ownership checks', async () => {
  const users = await Promise.all(
    ['USER', 'USER', 'ADMIN'].map((role) =>
      db.user.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Care fixture',
          email: `${crypto.randomUUID()}@example.test`,
          role,
        },
      }),
    ),
  );
  const [a, b, admin] = users;
  const pet = await db.pet.create({
    data: {
      name: 'Care fixture pet',
      species: 'Cat',
      ownerId: a.id,
      records: {
        create: { title: 'Care fixture record', category: 'CHECKUP', date: new Date('2026-01-01') },
      },
    },
    include: { records: true },
  });
  const other = await db.pet.create({
    data: {
      name: 'Other fixture',
      species: 'Dog',
      ownerId: b.id,
      records: {
        create: { title: 'Foreign record', category: 'CHECKUP', date: new Date('2026-01-01') },
      },
    },
    include: { records: true },
  });
  try {
    await assert.rejects(accessPet(b.id, pet.id));
    await accessPet(admin.id, pet.id);
    const essentials = form({
      microchip: 'chip-123',
      emergencyContact: 'Fictional contact',
      allergies: 'Unknown',
      medications: '',
    });
    await assert.rejects(careOperation(b.id, pet.id, 'essentials', essentials));
    await careOperation(a.id, pet.id, 'essentials', essentials);
    const image = await sharp({
      create: { width: 16, height: 16, channels: 3, background: '#ff542e' },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const file = new File([image], 'fixture.jpg', { type: 'image/jpeg' });
    assert.ok((await sharp(image).metadata()).exif);
    assert.deepEqual((await normalizeFile(file, false)).data, image);
    const normalized = await normalizeFile(file, true);
    assert.equal(normalized.mime, 'image/jpeg');
    assert.equal((await sharp(normalized.data).metadata()).exif, undefined);
    for (let i = 0; i < 2; i++) await careOperation(a.id, pet.id, 'photo', form({ file }));
    assert.equal(await db.petMedia.count({ where: { petId: pet.id, kind: 'PHOTO' } }), 1);
    await assert.rejects(
      careOperation(
        a.id,
        pet.id,
        'document',
        form({ file, title: 'Foreign attachment', recordId: other.records[0].id }),
      ),
    );
    await careOperation(
      a.id,
      pet.id,
      'document',
      form({ file, title: 'Original clinic image', recordId: pet.records[0].id }),
    );
    await db.petMedia.createMany({
      data: Array.from({ length: 18 }, (_, i) => ({
        petId: pet.id,
        recordId: pet.records[0].id,
        kind: 'DOCUMENT',
        name: `Quota fixture ${i}`,
        mime: 'image/jpeg',
        data: normalized.data,
      })),
    });
    await assert.rejects(
      careOperation(
        a.id,
        pet.id,
        'document',
        form({ file, title: 'Over quota', recordId: pet.records[0].id }),
      ),
      /Limit/,
    );
    await assert.rejects(
      normalizeFile(new File(['<svg/>'], 'fake.jpg', { type: 'image/jpeg' }), true),
    );
    await assert.rejects(
      normalizeFile(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' }),
        true,
      ),
    );
    await careOperation(
      a.id,
      pet.id,
      'medication',
      form({
        name: 'Fictional medication',
        dose: 'As prescribed',
        frequency: 'Daily',
        instructions: 'Fixture only',
      }),
    );
    await careOperation(
      a.id,
      pet.id,
      'log',
      form({ date: '2026-01-01', weightKg: '4.2', observation: 'Eating normally' }),
    );
    await assert.rejects(
      careOperation(
        a.id,
        pet.id,
        'log',
        form({ date: '2026-02-30', weightKg: '0', observation: '' }),
      ),
    );
    assert.equal((await db.careLog.findFirstOrThrow({ where: { petId: pet.id } })).weightKg, 4.2);
    await careOperation(a.id, pet.id, 'remove-photo', new FormData());
    assert.equal((await db.pet.findUniqueOrThrow({ where: { id: pet.id } })).photoUrl, '');
    await db.pet.delete({ where: { id: pet.id } });
    assert.equal(await db.petMedia.count({ where: { petId: pet.id } }), 0);
    assert.equal(await db.medicationPlan.count({ where: { petId: pet.id } }), 0);
  } finally {
    await db.pet.deleteMany({ where: { ownerId: { in: users.map((u) => u.id) } } });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await db.$disconnect();
  }
});
