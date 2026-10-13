import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { adminAccount } from '@/lib/admin-data';
import { adminAccountAction } from '@/app/admin-actions';
import { PetForm, RecordForm } from '@/components/forms';
import { today, dateKey } from '@/lib/dates';
export const metadata = { title: 'Manage account records' };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string; pet?: string; record?: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const account = await adminAccount(admin.id, id);
  if (!account) notFound();
  const pet = query.pet ? account.pets.find((p) => p.id === query.pet) : undefined;
  if (query.pet && !pet) notFound();
  const record = query.record ? pet?.records.find((r) => r.id === query.record) : undefined;
  if (query.record && !record) notFound();
  const recordMode = query.kind === 'record';
  if (recordMode && !pet) notFound();
  const back = `/admin/accounts/${id}`;
  return (
    <div className="admin-dashboard">
      <Link href={back} className="text-link">
        ← {account.label}
      </Link>
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">ADMINISTRATOR EDIT</p>
          <h1>
            {recordMode ? (record ? 'Edit record' : 'Add record') : pet ? 'Edit pet' : 'Add pet'}
          </h1>
          <p>
            Managing {account.label}’s workspace{recordMode ? ` · ${pet!.name}` : ''}.
          </p>
        </div>
      </header>
      {recordMode ? (
        <RecordForm
          petId={pet!.id}
          currentDay={today()}
          record={
            record
              ? {
                  ...record,
                  date: dateKey(record.date),
                  provider: record.provider || '',
                  notes: record.notes || '',
                }
              : undefined
          }
          cancelHref={back}
          saveAction={adminAccountAction.bind(null, id, 'record.save', pet!.id, record?.id ?? null)}
        />
      ) : (
        <PetForm
          currentDay={today()}
          pet={
            pet
              ? {
                  ...pet,
                  breed: pet.breed || '',
                  birthDate: dateKey(pet.birthDate),
                  notes: pet.notes || '',
                }
              : undefined
          }
          cancelHref={back}
          saveAction={adminAccountAction.bind(null, id, 'pet.save', pet?.id ?? null, null)}
        />
      )}
    </div>
  );
}
