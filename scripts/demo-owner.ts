import { db } from '../lib/db';
export async function demoOwner() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('Configure ADMIN_EMAIL.');
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: { id: crypto.randomUUID(), name: 'Demo workspace', email },
    });
  }
  user = await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  return user;
}
async function assign() {
  const user = await demoOwner();
  await db.$executeRaw`UPDATE "Pet" SET "ownerId" = ${user.id} WHERE "ownerId" IS NULL`;
  console.log('Demo ownership ready; existing records preserved.');
}
if (process.argv[1]?.endsWith('demo-owner.ts')) {
  assign()
    .catch(() => {
      console.error('Demo ownership setup failed.');
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
