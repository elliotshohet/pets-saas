import { db } from '../lib/db';
import { demoOwner } from '../scripts/demo-owner';
export async function seedPhotos() {
  const demo = await demoOwner();
  for (const species of ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'])
    await db.pet.updateMany({
      where: {
        photoUrl: null,
        species,
        OR: [{ ownerId: demo.id }, { owner: { isSynthetic: true } }],
      },
      data: { photoUrl: `/seed-pets/${species.toLowerCase()}.jpg` },
    });
}
