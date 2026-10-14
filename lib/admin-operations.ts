import { db } from './db';
import { assertAdmin } from './admin-access';
export async function onboardingData(userId: string) {
  await assertAdmin(userId);
  const [total, noPets, noRecords, delays] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { pets: { none: {} } } }),
    db.user.count({
      where: { pets: { some: {} }, NOT: { pets: { some: { records: { some: {} } } } } },
    }),
    db.$queryRaw<
      { hours: number | null }[]
    >`SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY greatest(0,extract(epoch FROM (first_record - joined))/3600)) AS hours FROM (SELECT u."createdAt" AS joined, min(r."createdAt") AS first_record FROM "User" u JOIN "Pet" p ON p."ownerId"=u.id JOIN "MedicalRecord" r ON r."petId"=p.id GROUP BY u.id) x`,
  ]);
  return {
    total,
    noPets,
    noRecords,
    activated: total - noPets - noRecords,
    medianHours: delays[0]?.hours,
  };
}
