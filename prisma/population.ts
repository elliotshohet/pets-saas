import type { Prisma } from '@prisma/client';
import { randomBytes, createHash } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { db } from '../lib/db';
import { today } from '../lib/dates';
const first = [
  'Olivia',
  'Liam',
  'Amelia',
  'Noah',
  'Charlotte',
  'Elijah',
  'Sophia',
  'James',
  'Isabella',
  'Lucas',
  'Mia',
  'Mason',
  'Harper',
  'Ethan',
  'Evelyn',
  'Henry',
  'Aria',
  'Leo',
  'Grace',
  'Jack',
  'Chloe',
  'Daniel',
  'Nora',
  'Aiden',
  'Lily',
  'Samuel',
  'Avery',
  'David',
  'Ella',
  'Owen',
  'Victoria',
  'Sebastian',
  'Layla',
  'Gabriel',
  'Zoe',
  'Julian',
  'Riley',
  'Mateo',
  'Natalie',
  'Benjamin',
  'Priya',
  'Arjun',
  'Mei',
  'Kai',
  'Fatima',
  'Omar',
  'Lucia',
  'Diego',
  'Hannah',
  'Adam',
];
const last = [
  'Bennett',
  'Chen',
  'Patel',
  'Rivera',
  'Thompson',
  'Kim',
  'Anderson',
  'Martinez',
  'Nguyen',
  'Wilson',
  'Garcia',
  'Robinson',
  'Lee',
  'Clark',
  'Lewis',
  'Walker',
  'Hall',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Adams',
  'Baker',
  'Nelson',
  'Carter',
  'Mitchell',
  'Perez',
  'Roberts',
  'Turner',
  'Phillips',
  'Campbell',
  'Parker',
  'Evans',
  'Edwards',
  'Collins',
  'Stewart',
  'Morris',
  'Rogers',
  'Reed',
  'Cook',
  'Morgan',
  'Bell',
  'Murphy',
  'Bailey',
  'Cooper',
  'Richardson',
  'Cox',
  'Howard',
];
const names = [
  'Luna',
  'Charlie',
  'Bella',
  'Max',
  'Daisy',
  'Cooper',
  'Lucy',
  'Buddy',
  'Willow',
  'Teddy',
  'Stella',
  'Oliver',
  'Penny',
  'Rocky',
  'Ruby',
  'Winston',
  'Nala',
  'Finn',
  'Coco',
  'Louie',
  'Hazel',
  'Milo',
  'Rosie',
  'Oscar',
  'Maple',
  'Archie',
  'Pepper',
  'Scout',
  'Sophie',
  'Jasper',
  'Olive',
  'Theo',
  'Clover',
  'Benny',
  'Mochi',
  'Simba',
  'Frankie',
  'Harvey',
  'Bonnie',
  'Otis',
];
const breeds: Record<string, string[]> = {
  Dog: [
    'Labrador retriever',
    'Golden retriever',
    'French bulldog',
    'Border collie',
    'Australian shepherd',
    'Beagle',
    'Mixed breed',
    'Cavalier King Charles spaniel',
    'German shepherd',
    'Dachshund',
    'Toy poodle',
    'Shih tzu',
  ],
  Cat: [
    'Domestic shorthair',
    'Domestic longhair',
    'Siamese',
    'Ragdoll',
    'Maine coon',
    'British shorthair',
  ],
  Rabbit: ['Holland lop', 'Mini rex', 'Netherland dwarf'],
  Bird: ['Cockatiel', 'Budgerigar', 'Green-cheeked conure'],
  Other: ['Guinea pig', 'Ferret', 'Leopard gecko'],
};
const clinics = [
  'Willow Veterinary Clinic',
  'Oak Street Animal Hospital',
  'Northside Pet Care',
  'Maplewood Veterinary Center',
  'Cedar Grove Animal Clinic',
  'Parkside Veterinary Group',
  'Lakeshore Animal Hospital',
  'Riverside Pet Wellness',
  'Meadow Exotics Clinic',
  'Harbor Veterinary Care',
  'Pine Ridge Animal Hospital',
  'Sunset Pet Clinic',
];
const visits = [
  {
    category: 'CHECKUP' as const,
    title: 'Annual wellness examination',
    notes:
      'Bright and alert on examination. Appetite and activity normal at home. Preventive care reviewed with owner.',
  },
  {
    category: 'CHECKUP' as const,
    title: 'Weight and nutrition review',
    notes:
      'Body condition reviewed. Discussed portion sizes, daily activity and gradual dietary adjustments. Recheck in three months.',
  },
  {
    category: 'MEDICATION' as const,
    title: 'Parasite prevention refill',
    notes:
      'Preventive medication renewed after review of current weight and history. Owner advised to maintain the monthly schedule.',
  },
  {
    category: 'MEDICATION' as const,
    title: 'Follow-up after treatment',
    notes:
      'Owner reports improved comfort and normal appetite. Treatment course completed. Continue monitoring and contact the clinic if symptoms return.',
  },
  {
    category: 'PROCEDURE' as const,
    title: 'Dental cleaning and oral examination',
    notes:
      'Dental cleaning completed. Recovery uneventful. Home dental care and follow-up instructions reviewed with owner.',
  },
  {
    category: 'OTHER' as const,
    title: 'Routine laboratory results review',
    notes:
      'Screening results reviewed with owner. No immediate change in the care plan. Repeat screening discussed for the next wellness visit.',
  },
];
function rng(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
const id = (key: string) =>
  createHash('sha256')
    .update('pets-community-v1:' + key)
    .digest('hex')
    .slice(0, 25);
export async function seedPopulation() {
  const present = new Set(
    (await db.user.findMany({ where: { isSynthetic: true }, select: { id: true } })).map(
      (user) => user.id,
    ),
  );
  const day = new Date(today() + 'T00:00:00Z');
  const entries: {
    user: Prisma.UserCreateManyInput & { id: string; createdAt: Date; updatedAt: Date };
    pets: Prisma.PetCreateManyInput[];
    records: Prisma.MedicalRecordCreateManyInput[];
  }[] = [];
  for (let index = 0; index < 1000; index++) {
    const userId = id('user:' + index);
    if (present.has(userId)) continue;
    const random = rng(index + 7413);
    const firstname = first[index % first.length],
      surname =
        last[(Math.floor(index / first.length) * 7 + (index % first.length) * 13) % last.length];
    const ageDays = Math.floor(Math.pow((index + 1) / 1000, 1.65) * 345) + 1;
    const joined = new Date(
      day.getTime() - ageDays * 86400000 + Math.floor(random() * 18) * 3600000,
    );
    const petsCount =
      random() < 0.14 ? 0 : random() < 0.55 ? 1 : random() < 0.72 ? 2 : random() < 0.85 ? 3 : 4;
    const pets = [];
    const records = [];
    let lastUpdated = joined;
    for (let p = 0; p < petsCount; p++) {
      const petId = id(`pet:${index}:${p}`);
      const roll = random();
      const species =
        roll < 0.55
          ? 'Dog'
          : roll < 0.89
            ? 'Cat'
            : roll < 0.95
              ? 'Rabbit'
              : roll < 0.98
                ? 'Bird'
                : 'Other';
      const breed = breeds[species][Math.floor(random() * breeds[species].length)];
      const petName = names[(index * 7 + p * 11) % names.length];
      const birth = new Date(day.getTime() - (Math.floor(random() * 3650) + 120) * 86400000);
      const created = new Date(
        joined.getTime() + Math.floor(random() * Math.max(1, ageDays - 1) * 0.25) * 86400000,
      );
      if (birth > created) {
        birth.setTime(created.getTime() - 120 * 86400000);
        birth.setUTCHours(0, 0, 0, 0);
      }
      const recordCount = random() < 0.1 ? 0 : 2 + Math.floor(random() * 9);
      let updated = created;
      for (let v = 0; v < recordCount; v++) {
        const date = new Date(
          created.getTime() +
            Math.floor(random() * Math.max(1, (day.getTime() - created.getTime()) / 86400000)) *
              86400000,
        );
        date.setUTCHours(0, 0, 0, 0);
        const saved = new Date(
          Math.max(created.getTime(), date.getTime()) + Math.floor(random() * 10) * 3600000,
        );
        const vaccine = v === 0;
        let template = visits[Math.floor(random() * visits.length)];
        if (
          ['Bird', 'Other', 'Rabbit'].includes(species) &&
          template.title === 'Dental cleaning and oral examination'
        ) {
          template = {
            category: 'CHECKUP',
            title:
              species === 'Bird'
                ? 'Beak and nail assessment'
                : species === 'Rabbit'
                  ? 'Dental examination'
                  : 'Husbandry and enclosure review',
            notes:
              'Examination completed. Home care reviewed with owner; routine follow-up recommended.',
          };
        }
        if (
          ['Bird', 'Other'].includes(species) &&
          (vaccine || template.title === 'Parasite prevention refill')
        ) {
          template = {
            category: 'CHECKUP',
            title: 'Preventive care plan review',
            notes:
              'Diet, environment and preventive care reviewed with owner. Routine follow-up recommended.',
          };
        }
        const title = vaccine
          ? species === 'Dog'
            ? 'DAPP vaccination'
            : species === 'Cat'
              ? 'FVRCP vaccination'
              : species === 'Rabbit'
                ? 'RHDV2 vaccination'
                : template.title
          : template.title;
        const category =
          vaccine && ['Dog', 'Cat', 'Rabbit'].includes(species)
            ? ('VACCINATION' as const)
            : template.category;
        records.push({
          id: id(`record:${index}:${p}:${v}`),
          petId,
          category,
          title,
          date,
          provider: clinics[Math.floor(random() * clinics.length)],
          notes:
            vaccine && category === 'VACCINATION'
              ? 'Vaccination administered following examination. No immediate reaction observed. Booster schedule reviewed with owner.'
              : template.notes,
          createdAt: saved,
          updatedAt: saved,
        });
        if (saved > updated) updated = saved;
      }
      pets.push({
        id: petId,
        ownerId: userId,
        name: petName,
        species,
        breed,
        birthDate: birth,
        notes: [
          'Enjoys daily walks and enrichment activities.',
          'Indoor companion; regular preventive care.',
          'Nervous during clinic visits; gentle handling helps.',
          'Food-motivated and sociable. Owner monitors appetite and activity.',
        ][Math.floor(random() * 4)],
        createdAt: created,
        updatedAt: updated,
      });
      if (updated > lastUpdated) lastUpdated = updated;
    }
    entries.push({
      user: {
        id: userId,
        name: `${firstname} ${surname}`,
        email: `${firstname.toLowerCase()}.${surname.toLowerCase()}${Math.floor(index / first.length) + 1}@example.test`,
        emailVerified: false,
        role: 'USER',
        isSynthetic: true,
        createdAt: joined,
        updatedAt: lastUpdated,
      },
      pets,
      records,
    });
  }
  if (!entries.length) {
    console.log('Synthetic community already contains 1,000 accounts; preserved.');
    return;
  }
  const accounts: {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (cursor < entries.length) {
        const entry = entries[cursor++];
        accounts.push({
          id: id('auth:' + entry.user.id),
          accountId: entry.user.id,
          providerId: 'credential',
          userId: entry.user.id,
          password: await hashPassword(randomBytes(32).toString('base64url')),
          createdAt: entry.user.createdAt,
          updatedAt: entry.user.createdAt,
        });
      }
    }),
  );
  await db.$transaction(
    async (tx) => {
      await tx.user.createMany({ data: entries.map((entry) => entry.user) });
      await tx.account.createMany({ data: accounts });
      await tx.pet.createMany({ data: entries.flatMap((entry) => entry.pets) });
      const records = entries.flatMap((entry) => entry.records);
      for (let offset = 0; offset < records.length; offset += 1000)
        await tx.medicalRecord.createMany({ data: records.slice(offset, offset + 1000) });
    },
    { timeout: 120000 },
  );
  console.log(
    `Added ${entries.length} synthetic accounts, ${entries.reduce((n, e) => n + e.pets.length, 0)} pets and ${entries.reduce((n, e) => n + e.records.length, 0)} records. No real people or contact addresses used.`,
  );
}
if (process.argv[1]?.endsWith('population.ts'))
  seedPopulation()
    .catch(() => {
      console.error('Synthetic population seed failed.');
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
