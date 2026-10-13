import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { dateKey, today } from '@/lib/dates';
import { RecordForm } from '@/components/forms';
import { PageHeader } from '@/components/ui';
export default async function EditRecord({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;
  const record = await db.medicalRecord.findUnique({
    where: { id: recordId, petId: id },
    include: { pet: true },
  });
  if (!record) notFound();
  return (
    <div className="form-page">
      <PageHeader
        eyebrow={`${record.pet.name.toUpperCase()}’S CARE STORY`}
        title="Edit medical record"
        description="Keep the details that matter, all together."
      />
      <RecordForm
        petId={id}
        currentDay={today()}
        record={{
          ...record,
          date: dateKey(record.date),
          provider: record.provider ?? '',
          notes: record.notes ?? '',
        }}
      />
    </div>
  );
}
