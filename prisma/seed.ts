import { seedPhotos } from './seed-photos';
import { seedPopulation } from './population';
import { demoOwner } from '../scripts/demo-owner';
import { db } from '../lib/db';
import { today } from '../lib/dates';
import type { Prisma } from '@prisma/client';
const seedDay = today();
const relative = (days: number) => {
  const date = new Date(seedDay + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};
const clinic = 'Willow Veterinary Clinic';
const vax = (
  name: string,
  days: number,
  extra: Partial<Prisma.MedicalRecordCreateWithoutPetInput> = {},
): Prisma.MedicalRecordCreateWithoutPetInput => ({
  title: `${name} vaccination`,
  category: 'VACCINATION',
  date: relative(days),
  provider: clinic,
  notes: 'Vaccination administered at the clinic.',
  ...extra,
});
const visit = (
  title: string,
  days: number,
  notes: string,
  extra: Partial<Prisma.MedicalRecordCreateWithoutPetInput> = {},
): Prisma.MedicalRecordCreateWithoutPetInput => ({
  title,
  category: 'CHECKUP',
  date: relative(days),
  provider: clinic,
  notes,
  ...extra,
});
const fixtures = [
  {
    name: 'Maple',
    species: 'Dog',
    breed: 'Golden retriever',
    birthDate: new Date('2022-04-12'),
    notes:
      'Spayed female. Walks daily and attends daycare twice a week. Nervous around nail clippers; food rewards help.',
    records: [
      vax('Rabies', -520, {
        title: 'Rabies booster',
      }),
      vax('DAPP', -340),
      vax('Bordetella', -350, {
        notes:
          'Clinic entry: Bordetella vaccination recorded before returning to daycare. No immediate reaction noted.',
      }),
      visit(
        'Annual wellness exam · 29.4 kg',
        -14,
        'Examination: weight 29.4 kg, body condition 5/9. Appetite and activity unchanged. Mild dental tartar noted. Owner to bring missing outside vaccination documentation to the next visit.',
      ),
      visit(
        'Heartworm antigen and tick-borne disease screening',
        -14,
        'Laboratory report: heartworm antigen not detected; tick-borne screening negative. Results reviewed with the owner.',
        { category: 'OTHER' },
      ),
      visit(
        'Right-ear medication course completed',
        -95,
        'Clinic entry: prescribed ear medication course completed. Owner reported no further scratching or odor; ear examination improved.',
        { category: 'MEDICATION' },
      ),
    ],
  },
  {
    name: 'Milo',
    species: 'Dog',
    breed: 'Australian shepherd',
    birthDate: relative(-105),
    notes:
      'Male puppy. Adopted from a foster home; some intake paperwork is still being requested. Puppy class planned.',
    records: [
      vax('DAPP', -35, {
        title: 'DAPP · first documented puppy dose',
      }),
      vax('DAPP', -7, {
        title: 'DAPP · second documented puppy dose',
        notes:
          'Clinic entry: second documented puppy vaccination. Appetite and activity reported as normal.',
      }),
      vax('Bordetella', -7, {
        notes: 'Clinic entry: Bordetella vaccination recorded during the puppy visit.',
      }),
      visit(
        'New puppy exam · 7.2 kg',
        -7,
        'Intake: weight 7.2 kg, body condition 4/9. Eating puppy food well. Owner to request foster vaccination records, including rabies and leptospirosis documentation, before the next review.',
      ),
      visit(
        'Fecal screening · intake sample',
        -6,
        'Laboratory entry: no ova or parasites seen in the submitted sample. Result documented for the next clinic review.',
        { category: 'OTHER' },
      ),
    ],
  },
  {
    name: 'Clover',
    species: 'Cat',
    breed: 'Domestic shorthair',
    birthDate: new Date('2021-09-03'),
    notes: 'Spayed female, indoor only. Quiet carrier and a familiar blanket help with visits.',
    records: [
      vax('FVRCP', -300, {
        provider: 'Cedar Animal Care',
      }),
      vax('Rabies', -300, {
        provider: 'Cedar Animal Care',
      }),
      visit(
        'Dental cleaning and full-mouth radiographs',
        -20,
        'Procedure: pre-anesthetic testing reviewed, dental scaling and polishing completed. Discharge instructions reviewed with the owner. No extraction documented.',
        {
          category: 'PROCEDURE',
          provider: 'Cedar Animal Care',
        },
      ),
    ],
  },
  {
    name: 'Mochi',
    species: 'Rabbit',
    breed: 'Holland lop',
    birthDate: new Date('2024-02-18'),
    notes:
      'Neutered male. Indoor enclosure, supervised exercise, and hay available throughout the day.',
    records: [
      visit(
        'Exotics wellness exam · 1.85 kg',
        -7,
        'Exam: weight 1.85 kg. Owner reports normal appetite and droppings. Teeth, feet, and coat examined. Bring previous clinic records to the next review.',
        { provider: 'Meadow Exotics Clinic' },
      ),
      vax('RHDV2', -370, {
        provider: 'Meadow Exotics Clinic',
        notes: 'Exotics-clinic entry: RHDV2 vaccination recorded. No immediate reaction noted.',
      }),
    ],
  },
];
async function seed() {
  const owner = await demoOwner();
  const reset = process.argv.includes('--reset');
  const result = await db.$transaction(async (tx) => {
    if (!reset && (await tx.pet.count({ where: { ownerId: owner.id } }))) return null;
    // Explicit reset replaces only demo pet data; normal startup preserves existing work.
    if (reset) await tx.pet.deleteMany({ where: { ownerId: owner.id } });
    for (const fixture of fixtures) {
      const { records, ...profile } = fixture;
      await tx.pet.create({
        data: {
          ...profile,
          ownerId: owner.id,
          records: {
            create: records,
          },
        },
      });
    }
    return {
      pets: await tx.pet.count({ where: { ownerId: owner.id } }),
      records: await tx.medicalRecord.count({ where: { pet: { ownerId: owner.id } } }),
    };
  });
  console.log(
    result
      ? `Seeded ${result.pets} pets and ${result.records} medical records.`
      : 'Workspace already has pets; seed skipped. Use --reset to replace demo pet data.',
  );
}
seed()
  .then(() => seedPopulation())
  .then(() => seedPhotos())
  .catch(() => {
    console.error('Database seed failed.');
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
