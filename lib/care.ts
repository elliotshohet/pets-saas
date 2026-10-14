import type { Prisma } from '@prisma/client';
import { db } from './db';
import { z } from 'zod';
import sharp from 'sharp';
import { today } from './dates';
export async function accessPet(
  userId: string,
  petId: string,
  client: Prisma.TransactionClient = db,
) {
  const admin =
    (await client.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role ===
    'ADMIN';
  return client.pet.findFirstOrThrow({
    where: { id: petId, ...(admin ? {} : { ownerId: userId }) },
  });
}
const text = (max: number) => z.string().trim().max(max);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v &&
      v >= '1900-01-01',
    'Enter a valid calendar date.',
  );
export async function normalizeFile(file: File, photo: boolean) {
  if (!file.size || file.size > (photo ? 5 : 10) * 1024 * 1024)
    throw new Error(photo ? 'Choose an image up to 5 MB.' : 'Choose a document up to 10 MB.');
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Use JPEG, PNG or WebP images.');
  const image = sharp(bytes, { limitInputPixels: 20000000 });
  const metadata = await image.metadata();
  if (!['jpeg', 'png', 'webp'].includes(metadata.format || ''))
    throw new Error('Unsupported image contents.');
  if (!photo)
    return {
      data: bytes,
      mime:
        metadata.format === 'png'
          ? 'image/png'
          : metadata.format === 'webp'
            ? 'image/webp'
            : 'image/jpeg',
    };
  return {
    data: await image
      .rotate()
      .resize({
        width: photo ? 1200 : 2000,
        height: photo ? 1200 : 2000,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer(),
    mime: 'image/jpeg',
  };
}
export async function careOperation(
  userId: string,
  petId: string,
  op: string,
  form: FormData,
  transaction?: Prisma.TransactionClient,
) {
  const client = transaction || db;
  const runTransaction = <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) =>
    transaction ? fn(transaction) : db.$transaction(fn);
  await accessPet(userId, petId, client);
  const input = Object.fromEntries(form);
  if (op === 'essentials') {
    const data = z
      .object({
        microchip: text(100),
        allergies: text(2000),
        emergencyContact: text(300),
        medications: text(2000),
      })
      .parse(input);
    await client.pet.update({ where: { id: petId }, data });
  } else if (op === 'medication') {
    const data = z
      .object({
        name: text(120).min(1),
        dose: text(120).min(1),
        frequency: text(120).min(1),
        instructions: text(2000),
      })
      .parse(input);
    await client.medicationPlan.create({ data: { petId, ...data } });
  } else if (op === 'delete-medication') {
    if (form.get('confirm') !== 'yes') throw new Error('Confirm medication deletion.');
    await client.medicationPlan.delete({ where: { id: String(form.get('id')), petId } });
  } else if (op === 'photo' || op === 'document') {
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('Choose a file.');
    const normalized = await normalizeFile(file, op === 'photo');
    const name = text(120)
      .min(1)
      .parse(String(form.get('title') || file.name));
    const recordId = op === 'document' ? String(form.get('recordId') || '') : '';
    if (recordId) await client.medicalRecord.findFirstOrThrow({ where: { id: recordId, petId } });
    if (op === 'document' && !recordId)
      throw new Error('Select a medical record for this document.');
    await runTransaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Pet" WHERE id=${petId} FOR UPDATE`;
      const pet = await tx.pet.findUniqueOrThrow({ where: { id: petId } });
      if (op === 'photo') await tx.petMedia.deleteMany({ where: { petId, kind: 'PHOTO' } });
      if ((await tx.petMedia.count({ where: { petId } })) >= 20)
        throw new Error('Limit of 20 files per pet reached.');
      await tx.petMedia.create({
        data: {
          petId,
          recordId: recordId || null,
          kind: op === 'photo' ? 'PHOTO' : 'DOCUMENT',
          name,
          ...normalized,
        },
      });
      if (op === 'photo')
        await tx.pet.update({
          where: { id: pet.id },
          data: { photoUrl: `/api/pets/${petId}/photo?v=${Date.now()}` },
        });
    });
  } else if (op === 'remove-photo') {
    await runTransaction(async (tx) => {
      await tx.petMedia.deleteMany({ where: { petId, kind: 'PHOTO' } });
      await tx.pet.update({ where: { id: petId }, data: { photoUrl: '' } });
    });
  } else if (op === 'remove-document') {
    if (form.get('confirm') !== 'yes') throw new Error('Confirm document deletion.');
    await client.petMedia.delete({
      where: { id: String(form.get('id')), petId, kind: 'DOCUMENT' },
    });
  } else if (op === 'log') {
    const data = z
      .object({
        date: date.refine((v) => v <= today(), 'Future observations are not allowed.'),
        weightKg: z.union([z.literal(''), z.coerce.number().positive().max(1000)]),
        observation: text(2000),
      })
      .parse(input);
    if (data.weightKg === '' && !data.observation)
      throw new Error('Enter a weight or an observation.');
    await client.careLog.create({
      data: {
        petId,
        date: new Date(data.date + 'T00:00:00Z'),
        weightKg: data.weightKg === '' ? null : data.weightKg,
        observation: data.observation || null,
      },
    });
  } else if (op === 'delete-log') {
    if (form.get('confirm') !== 'yes') throw new Error('Confirm log deletion.');
    await client.careLog.delete({ where: { id: String(form.get('id')), petId } });
  } else throw new Error('Unknown operation.');
}
