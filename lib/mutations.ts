import { trackEvent } from './operations';
import { db } from './db';
import { ownedDb } from './owned-db';
import { petSchema, recordSchema, toDate } from './validation';
export async function savePet(ownerId: string, id: string | null, input: unknown) {
  const data = petSchema.parse(input);
  const values = { ...data, birthDate: toDate(data.birthDate) };
  const saved = await (id
    ? ownedDb(ownerId).pet.update({ where: { id }, data: values })
    : db.pet.create({ data: { ...values, ownerId } }));
  await trackEvent(id ? 'pet.updated' : 'pet.created', ownerId);
  return saved;
}
export async function saveRecord(
  ownerId: string,
  petId: string,
  id: string | null,
  input: unknown,
) {
  const data = recordSchema.parse(input);
  const values = {
    ...data,
    date: toDate(data.date)!,
  };
  await db.pet.findUniqueOrThrow({ where: { id: petId, ownerId }, select: { id: true } });
  const saved = await (id
    ? ownedDb(ownerId).medicalRecord.update({ where: { id, petId }, data: values })
    : db.medicalRecord.create({ data: { ...values, petId } }));
  await trackEvent(id ? 'record.updated' : 'record.created', ownerId);
  return saved;
}
export async function deletePet(ownerId: string, id: string) {
  const deleted = await ownedDb(ownerId).pet.delete({ where: { id } });
  await trackEvent('pet.deleted', ownerId);
  return deleted;
}
export async function deleteRecord(ownerId: string, petId: string, id: string) {
  const deleted = await ownedDb(ownerId).medicalRecord.delete({ where: { id, petId } });
  await trackEvent('record.deleted', ownerId);
  return deleted;
}
