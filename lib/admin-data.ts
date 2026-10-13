import { db } from './db';
import { assertAdmin } from './admin-access';
import type { Prisma } from '@prisma/client';
const month = (date: Date) => date.toISOString().slice(0, 7);
export async function adminOverview(userId: string) {
  await assertAdmin(userId);
  const now = new Date(),
    since = new Date(now.getTime() - 30 * 86400000),
    previous = new Date(now.getTime() - 60 * 86400000);
  const [
    accounts,
    synthetic,
    pets,
    records,
    newAccounts,
    caredPets,
    withPets,
    activated,
    active,
    previousActive,
    species,
    categories,
    growth,
    repeat,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isSynthetic: true } }),
    db.pet.count(),
    db.medicalRecord.count(),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.pet.count({ where: { records: { some: {} } } }),
    db.user.count({ where: { pets: { some: {} } } }),
    db.user.count({ where: { pets: { some: { records: { some: {} } } } } }),
    db.user.count({
      where: { pets: { some: { records: { some: { createdAt: { gte: since } } } } } },
    }),
    db.user.count({
      where: { pets: { some: { records: { some: { createdAt: { gte: previous, lt: since } } } } } },
    }),
    db.pet.groupBy({ by: ['species'], _count: true, orderBy: { _count: { species: 'desc' } } }),
    db.medicalRecord.groupBy({ by: ['category'], _count: true }),
    db.$queryRaw<{ month: string; accounts: number; records: number }[]>`
   WITH months AS (SELECT generate_series(date_trunc('month',CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - interval '11 months',date_trunc('month',CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),interval '1 month') AS month)
   SELECT to_char(month,'Mon') AS month,
    (SELECT count(*)::int FROM "User" WHERE "createdAt">=month AND "createdAt"<month+interval '1 month') AS accounts,
    (SELECT count(*)::int FROM "MedicalRecord" WHERE "createdAt">=month AND "createdAt"<month+interval '1 month') AS records
   FROM months ORDER BY months.month`,
    db.user.count({
      where: {
        AND: [
          { pets: { some: { records: { some: { createdAt: { gte: previous, lt: since } } } } } },
          { pets: { some: { records: { some: { createdAt: { gte: since } } } } } },
        ],
      },
    }),
  ]);
  return {
    accounts,
    synthetic,
    pets,
    records,
    newAccounts,
    caredPets,
    withPets,
    activated,
    active,
    previousActive,
    repeat,
    returnRate: previousActive > 0 ? Math.round((repeat / previousActive) * 100) : null,
    species: species.map((item) => ({ species: item.species, count: item._count })),
    categories: categories.map((item) => ({
      category: item.category,
      count: item._count,
    })),
    growth: growth.map((item) => ({
      month: item.month,
      accounts: item.accounts,
      records: item.records,
    })),
    updatedAt: now.toISOString(),
  };
}
export async function adminAccounts(userId: string, q: string, filter: string, page: number) {
  await assertAdmin(userId);
  const normalized = q.trim();
  const where: Prisma.UserWhereInput = {
    ...(normalized
      ? {
          OR: [
            { name: { contains: normalized, mode: 'insensitive' } },
            { email: { contains: normalized, mode: 'insensitive' } },
            { analyticsId: { startsWith: normalized.toLowerCase() } },
          ],
        }
      : {}),
    ...(filter === 'families'
      ? { pets: { some: {} } }
      : filter === 'empty'
        ? { pets: { none: {} } }
        : filter === 'unrecorded'
          ? { pets: { some: {} }, NOT: { pets: { some: { records: { some: {} } } } } }
          : filter === 'activated'
            ? { pets: { some: { records: { some: {} } } } }
            : {}),
  };
  const total = await db.user.count({ where });
  const current = Math.min(page, Math.max(1, Math.ceil(total / 20)));
  const rows = await db.user.findMany({
    where,
    skip: (current - 1) * 20,
    take: 20,
    orderBy: [{ createdAt: 'desc' }, { analyticsId: 'asc' }],
    select: {
      analyticsId: true,
      name: true,
      email: true,
      isSynthetic: true,
      createdAt: true,
      _count: { select: { pets: true } },
    },
  });
  return {
    total,
    current,
    users: rows.map((row) => ({
      id: row.analyticsId,
      label: row.name,
      email: row.email,
      isSynthetic: row.isSynthetic,
      joinedMonth: month(row.createdAt),
      petCount: row._count.pets,
    })),
  };
}
export async function adminAccount(userId: string, id: string) {
  await assertAdmin(userId);
  const row = await db.user.findUnique({
    where: { analyticsId: id },
    select: {
      analyticsId: true,
      name: true,
      email: true,
      isSynthetic: true,
      createdAt: true,
      _count: { select: { pets: true } },
      pets: {
        include: { records: { orderBy: { date: 'desc' } }, _count: { select: { records: true } } },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.analyticsId,
    label: row.name,
    email: row.email,
    isSynthetic: row.isSynthetic,
    joinedMonth: month(row.createdAt),
    petCount: row._count.pets,
    pets: row.pets,
    recordCount: row.pets.reduce((total, pet) => total + pet._count.records, 0),
    petsWithRecords: row.pets.filter((pet) => pet._count.records > 0).length,
  };
}

export async function adminForecast(userId: string) {
  await assertAdmin(userId);
  const rows = await db.$queryRaw<{ week: Date; accounts: number; records: number }[]>`
    WITH weeks AS (
      SELECT generate_series(date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - interval '56 days',
      date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - interval '7 days', interval '7 days') AS week
    )
    SELECT week,
      (SELECT count(*)::int FROM "User" WHERE "createdAt" >= week AND "createdAt" < week + interval '7 days') AS accounts,
      (SELECT count(*)::int FROM "MedicalRecord" WHERE "createdAt" >= week AND "createdAt" < week + interval '7 days') AS records
    FROM weeks ORDER BY week`;
  const [users, records] = await Promise.all([
    db.user.aggregate({ _min: { createdAt: true } }),
    db.medicalRecord.aggregate({ _min: { createdAt: true } }),
  ]);
  const { forecastWeekly } = await import('./forecast');
  const start = rows[0]?.week;
  return {
    accounts:
      start && users._min.createdAt && users._min.createdAt <= start
        ? forecastWeekly(rows.map((row) => row.accounts))
        : null,
    records:
      start && records._min.createdAt && records._min.createdAt <= start
        ? forecastWeekly(rows.map((row) => row.records))
        : null,
    start: start?.toISOString().slice(0, 10),
    end: rows[7]
      ? new Date(rows[7].week.getTime() + 6 * 86400000).toISOString().slice(0, 10)
      : undefined,
  };
}
