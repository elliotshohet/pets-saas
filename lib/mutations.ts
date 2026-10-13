import { db } from './db';
import { petSchema, recordSchema, toDate } from './validation';
export async function savePet(id: string | null, input: unknown) {
  const data = petSchema.parse(input);
  const values = { ...data, birthDate: toDate(data.birthDate) };
  return id ? db.pet.update({ where: { id }, data: values }) : db.pet.create({ data: values });
}
export async function saveRecord(petId: string, id: string | null, input: unknown) {
  const data = recordSchema.parse(input);
  const values = {
    ...data,
    date: toDate(data.date)!,
  };
  if (!id) return db.medicalRecord.create({ data: { ...values, petId } });
  return db.medicalRecord.update({ where: { id, petId }, data: values });
}
export async function deletePet(id: string) {
  return db.pet.delete({ where: { id } });
}
export async function deleteRecord(petId: string, id: string) {
  return db.medicalRecord.delete({ where: { id, petId } });
}
