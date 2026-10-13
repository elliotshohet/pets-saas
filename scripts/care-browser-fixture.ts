import { db } from '../lib/db';
const owner = await db.user.findUniqueOrThrow({
  where: { email: process.env.DEMO_EMAIL!.toLowerCase() },
});
if (process.argv.includes('--cleanup')) {
  await db.pet.deleteMany({
    where: { ownerId: owner.id, name: 'Disposable care browser fixture' },
  });
  console.log('Removed disposable browser fixture.');
} else {
  const pet = await db.pet.create({
    data: {
      ownerId: owner.id,
      name: 'Disposable care browser fixture',
      species: 'Cat',
      records: {
        create: {
          title: 'Disposable visit document',
          category: 'CHECKUP',
          date: new Date('2026-01-01'),
        },
      },
    },
  });
  console.log(pet.id);
}
await db.$disconnect();
