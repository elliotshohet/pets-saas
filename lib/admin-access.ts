import { db } from './db';
export async function isAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === 'ADMIN';
}
export async function assertAdmin(userId: string) {
  if (!(await isAdmin(userId))) throw new Error('Admin access required');
}
