import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { today } from '@/lib/dates';
import { RecordForm } from '@/components/forms';
import { PageHeader } from '@/components/ui';
export default async function NewRecord({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { id } = await params;
  const vaccination = (await searchParams).category === 'VACCINATION';
  const pet = await db.pet.findUnique({ where: { id } });
  if (!pet) notFound();
  return (
    <div className="form-page">
      <PageHeader
        eyebrow={`${pet.name.toUpperCase()}’S CARE STORY`}
        title={vaccination ? 'Add a vaccination' : 'Add a medical record'}
        description="Capture the visit, the details, and anything to follow up on."
      />
      <RecordForm vaccination={vaccination} petId={id} currentDay={today()} />
    </div>
  );
}
