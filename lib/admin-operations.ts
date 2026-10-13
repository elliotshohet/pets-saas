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
export async function qualityData(userId: string) {
  await assertAdmin(userId);
  const [missingBirth, missingClinic, duplicates, inconsistent, examples] = await Promise.all([
    db.pet.count({ where: { birthDate: null } }),
    db.medicalRecord.count({ where: { OR: [{ provider: null }, { provider: '' }] } }),
    db.$queryRaw<
      { count: number }[]
    >`SELECT count(*)::int AS count FROM (SELECT "petId",lower(trim(title)),date,category FROM "MedicalRecord" GROUP BY "petId",lower(trim(title)),date,category HAVING count(*)>1) x`,
    db.$queryRaw<
      { count: number }[]
    >`SELECT count(*)::int AS count FROM "MedicalRecord" r JOIN "Pet" p ON r."petId"=p.id WHERE r.date < p."birthDate" OR r.date > (CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')::date`,
    db.pet.findMany({
      where: {
        OR: [
          { birthDate: null },
          { records: { some: { OR: [{ provider: null }, { provider: '' }] } } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        owner: { select: { name: true, analyticsId: true } },
        birthDate: true,
        _count: { select: { records: true } },
      },
    }),
  ]);
  return {
    missingBirth,
    missingClinic,
    duplicates: duplicates[0].count,
    inconsistent: inconsistent[0].count,
    examples,
  };
}
export async function activityData(userId: string, kind?: string) {
  await assertAdmin(userId);
  return db.operationalEvent.findMany({
    where: kind ? { kind } : undefined,
    take: 100,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, kind: true, createdAt: true },
  });
}
export async function healthData(userId: string) {
  await assertAdmin(userId);
  const start = performance.now();
  let database = true;
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = false;
  }
  const since = new Date(Date.now() - 86400000);
  const groups = database
    ? await db.operationalEvent.groupBy({
        by: ['kind'],
        where: { createdAt: { gte: since } },
        _count: true,
      })
    : [];
  const first = database
    ? await db.operationalEvent.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      })
    : null;
  return {
    database,
    latency: Math.round(performance.now() - start),
    counts: Object.fromEntries(groups.map((g) => [g.kind, g._count])),
    first: first?.createdAt,
    checkedAt: new Date(),
  };
}
