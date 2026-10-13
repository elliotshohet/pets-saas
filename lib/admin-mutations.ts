import { db } from './db';
import { assertAdmin } from './admin-access';
import { petSchema, recordSchema, toDate } from './validation';
export type AdminOperation = 'pet.save' | 'pet.delete' | 'record.save' | 'record.delete';
export async function mutateAdminAccount(
  adminId: string,
  alias: string,
  operation: AdminOperation,
  petId: string | null,
  recordId: string | null,
  input?: unknown,
) {
  await assertAdmin(adminId);
  const owner = await db.user.findUniqueOrThrow({
    where: { analyticsId: alias },
    select: { id: true },
  });
  return db.$transaction(async (tx) => {
    if (petId)
      await tx.pet.findUniqueOrThrow({
        where: { id: petId, ownerId: owner.id },
        select: { id: true },
      });
    if (operation.startsWith('record.') && !petId) throw new Error('Missing parent pet');
    let result;
    let kind;
    if (operation === 'pet.save') {
      const data = petSchema.parse(input);
      const values = { ...data, birthDate: toDate(data.birthDate) };
      result = petId
        ? await tx.pet.update({ where: { id: petId, ownerId: owner.id }, data: values })
        : await tx.pet.create({ data: { ...values, ownerId: owner.id } });
      kind = petId ? 'admin.pet.updated' : 'admin.pet.created';
    } else if (operation === 'pet.delete') {
      if (!petId) throw new Error('Missing pet');
      result = await tx.pet.delete({ where: { id: petId, ownerId: owner.id } });
      kind = 'admin.pet.deleted';
    } else if (operation === 'record.save') {
      const data = recordSchema.parse(input);
      const values = { ...data, date: toDate(data.date)! };
      result = recordId
        ? await tx.medicalRecord.update({ where: { id: recordId, petId: petId! }, data: values })
        : await tx.medicalRecord.create({ data: { ...values, petId: petId! } });
      kind = recordId ? 'admin.record.updated' : 'admin.record.created';
    } else {
      if (!recordId) throw new Error('Missing record');
      result = await tx.medicalRecord.delete({ where: { id: recordId, petId: petId! } });
      kind = 'admin.record.deleted';
    }
    // Admin changes and their actor-only event commit together; no medical text is logged.
    await tx.operationalEvent.create({ data: { kind, actorId: adminId } });
    return result;
  });
}
