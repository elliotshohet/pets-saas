import { db } from './db';
import { isAdmin } from './admin-access';
import { z } from 'zod';
import sharp from 'sharp';
import { today } from './dates';
export async function accessPet(userId: string, petId: string) {
  const admin = await isAdmin(userId);
  return db.pet.findFirstOrThrow({ where: { id: petId, ...(admin ? {} : { ownerId: userId }) } });
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
const zone = text(80).refine((v) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: v });
    return true;
  } catch {
    return false;
  }
}, 'Enter a valid timezone.');
export async function normalizeFile(file: File, photo: boolean) {
  if (!file.size || file.size > (photo ? 5 : 10) * 1024 * 1024)
    throw new Error(photo ? 'Choose an image up to 5 MB.' : 'Choose a document up to 10 MB.');
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!photo && file.type === 'application/pdf' && bytes.subarray(0, 5).toString() === '%PDF-')
    return { data: bytes, mime: 'application/pdf' };
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Use JPEG, PNG, WebP or a PDF document.');
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
export async function careOperation(userId: string, petId: string, op: string, form: FormData) {
  await accessPet(userId, petId);
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
    await db.pet.update({ where: { id: petId }, data });
  } else if (op === 'medication') {
    const data = z
      .object({
        name: text(120).min(1),
        dose: text(120).min(1),
        frequency: text(120).min(1),
        instructions: text(2000),
      })
      .parse(input);
    await db.medicationPlan.create({ data: { petId, ...data } });
  } else if (op === 'delete-medication') {
    if (form.get('confirm') !== 'yes') throw new Error('Confirm medication deletion.');
    await db.medicationPlan.delete({ where: { id: String(form.get('id')), petId } });
  } else if (op === 'photo' || op === 'document') {
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('Choose a file.');
    const normalized = await normalizeFile(file, op === 'photo');
    const name = text(120)
      .min(1)
      .parse(String(form.get('title') || file.name));
    const recordId = op === 'document' ? String(form.get('recordId') || '') : '';
    if (recordId) await db.medicalRecord.findFirstOrThrow({ where: { id: recordId, petId } });
    if (op === 'document' && !recordId)
      throw new Error('Select a medical record for this document.');
    await db.$transaction(async (tx) => {
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
    await db.$transaction([
      db.petMedia.deleteMany({ where: { petId, kind: 'PHOTO' } }),
      db.pet.update({ where: { id: petId }, data: { photoUrl: '' } }),
    ]);
  } else if (op === 'remove-document') {
    if (form.get('confirm') !== 'yes') throw new Error('Confirm document deletion.');
    await db.petMedia.delete({ where: { id: String(form.get('id')), petId, kind: 'DOCUMENT' } });
  } else if (op === 'task') {
    const data = z
      .object({
        title: text(120).min(1),
        kind: z.enum(['VACCINATION', 'FOLLOW_UP', 'MEDICATION', 'OTHER']),
        dueDate: date,
        timezone: zone,
        intervalDays: z.union([z.literal(''), z.coerce.number().int().min(1).max(3650)]),
        instructions: text(2000),
      })
      .parse(input);
    await db.careTask.create({
      data: {
        ...data,
        petId,
        dueDate: new Date(data.dueDate + 'T00:00:00Z'),
        intervalDays: data.intervalDays === '' ? null : data.intervalDays,
      },
    });
  } else if (op === 'complete' || op === 'snooze' || op === 'delete-task') {
    const id = String(form.get('id'));
    if (op === 'delete-task') {
      if (form.get('confirm') !== 'yes') throw new Error('Confirm reminder deletion.');
      await db.careTask.delete({ where: { id, petId } });
    } else
      await db.$transaction(async (tx) => {
        // Lock to make concurrent completion/snooze operations deterministic.
        await tx.$queryRaw`SELECT id FROM "CareTask" WHERE id=${id} AND "petId"=${petId} FOR UPDATE`;
        const task = await tx.careTask.findFirstOrThrow({ where: { id, petId } });
        if (op === 'snooze') {
          const due = date.parse(String(form.get('dueDate')));
          await tx.careTask.update({
            where: { id },
            data: { dueDate: new Date(due + 'T00:00:00Z'), completedAt: null },
          });
        } else if (!task.completedAt) {
          if (task.intervalDays) {
            if (form.get('scheduledDate') !== task.dueDate.toISOString().slice(0, 10)) return;
            const due = new Date(task.dueDate);
            const current = new Intl.DateTimeFormat('en-CA', { timeZone: task.timezone }).format(
              new Date(),
            );
            const elapsed = Math.floor((Date.parse(current) - due.getTime()) / 86400000);
            due.setUTCDate(
              due.getUTCDate() +
                Math.max(1, Math.floor(elapsed / task.intervalDays) + 1) * task.intervalDays,
            );
            await tx.careTask.update({ where: { id }, data: { dueDate: due } });
          } else await tx.careTask.update({ where: { id }, data: { completedAt: new Date() } });
        }
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
    await db.careLog.create({
      data: {
        petId,
        date: new Date(data.date + 'T00:00:00Z'),
        weightKg: data.weightKg === '' ? null : data.weightKg,
        observation: data.observation || null,
      },
    });
  } else if (op === 'delete-log') {
    if (form.get('confirm') !== 'yes') throw new Error('Confirm log deletion.');
    await db.careLog.delete({ where: { id: String(form.get('id')), petId } });
  } else throw new Error('Unknown operation.');
}
export function taskStatus(
  task: { dueDate: Date; timezone: string; completedAt: Date | null },
  now = new Date(),
) {
  if (task.completedAt) return 'Completed';
  const current = new Intl.DateTimeFormat('en-CA', { timeZone: task.timezone }).format(now);
  const date = task.dueDate.toISOString().slice(0, 10);
  return date < current ? 'Overdue' : date === current ? 'Due today' : 'Upcoming';
}
