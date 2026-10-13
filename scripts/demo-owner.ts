import { auth } from '../lib/auth';
import { db } from '../lib/db';
export async function demoOwner() {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) throw new Error('Configure DEMO_EMAIL and DEMO_PASSWORD.');
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    await auth.api.signUpEmail({ body: { name: 'Demo workspace', email, password } });
    user = await db.user.findUniqueOrThrow({ where: { email } });
  }
  if (email === (process.env.ADMIN_EMAIL || process.env.DEMO_EMAIL)?.trim().toLowerCase()) {
    user = await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  }
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
