import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { dateKey, today } from '@/lib/dates';
import { PetForm } from '@/components/forms';
import { PageHeader } from '@/components/ui';
export default async function EditPet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await db.pet.findUnique({ where: { id } });
  if (!pet) notFound();
  return (
    <div className="form-page">
      <PageHeader
        eyebrow="THE LITTLE DETAILS"
        title={`Edit ${pet.name}’s profile`}
        description="Keep their information as current as their adventures."
      />
      <PetForm
        currentDay={today()}
        pet={{
          ...pet,
          breed: pet.breed ?? '',
          birthDate: dateKey(pet.birthDate),
          notes: pet.notes ?? '',
        }}
      />
    </div>
  );
}
