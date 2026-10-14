import { z } from 'zod';
import { db } from './db';
export const memberSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.').max(120),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
});
export async function mutateMember(
  adminId: string,
  alias: string | null,
  operation: 'save' | 'delete',
  input?: unknown,
) {
  return db.$transaction(async (tx) => {
    const admin = await tx.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (admin?.role !== 'ADMIN') throw new Error('Administrator access required.');
    const member = alias
      ? await tx.user.findUniqueOrThrow({ where: { analyticsId: alias } })
      : null;
    if (member && member.role !== 'USER')
      throw new Error('Only member accounts can be managed here.');
    if (operation === 'delete') {
      if (!member) throw new Error('Member not found.');
      await tx.pet.deleteMany({ where: { ownerId: member.id } });
      await tx.user.delete({ where: { id: member.id } });
      await tx.operationalEvent.create({
        data: { actorId: adminId, kind: 'admin.member.deleted' },
      });
      return null;
    }
    const data = memberSchema.parse(input);
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (data.email === adminEmail) throw new Error('This email is reserved for the administrator.');
    const result = member
      ? await tx.user.update({ where: { id: member.id }, data })
      : await tx.user.create({ data: { ...data, id: crypto.randomUUID(), role: 'USER' } });
    if (member && member.email !== data.email)
      await tx.emailSession.deleteMany({ where: { userId: member.id } });
    await tx.operationalEvent.create({
      data: { actorId: adminId, kind: member ? 'admin.member.updated' : 'admin.member.created' },
    });
    return result;
  });
}
