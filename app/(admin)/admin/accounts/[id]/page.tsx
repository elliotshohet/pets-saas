import Link from 'next/link';
import Image from 'next/image';
import { DeleteButton } from '@/components/forms';
import { adminAccountAction } from '@/app/admin-actions';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { adminAccount } from '@/lib/admin-data';
export const metadata = { title: 'Account details' };
export default async function Account({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const account = await adminAccount(admin.id, id);
  if (!account) notFound();
  return (
    <div className="admin-dashboard">
      <Link className="text-link" href="/admin/accounts">
        ← Account directory
      </Link>
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">ACCOUNT DETAILS</p>
          <h1>{account.label}</h1>
          <p>
            {account.email} · Joined {account.joinedMonth}
          </p>
        </div>
        <Link className="button primary" href={`/admin/accounts/${id}/manage`}>
          Add pet
        </Link>
      </header>
      <div className="admin-demo-banner">
        Administrators can manage this account’s pets and care records.{' '}
        {account.isSynthetic ? 'Synthetic account.' : ''}
      </div>
      <section className="admin-metrics" aria-label="Account usage metrics">
        {[
          { label: 'Pet profiles', value: account.petCount },
          { label: 'Medical records', value: account.recordCount },
          { label: 'Profiles with records', value: account.petsWithRecords },
          {
            label: 'Onboarding',
            value: account.recordCount
              ? 'Recording care'
              : account.petCount
                ? 'Profile added'
                : 'Getting started',
          },
        ].map((item) => (
          <article className="panel admin-metric" key={item.label}>
            <div>{item.label}</div>
            <strong className="admin-usage-value">{item.value}</strong>
          </article>
        ))}
      </section>
      {account.pets.map((pet) => (
        <section className="panel admin-chart admin-pet-detail" key={pet.id}>
          {pet.photoUrl && (
            <Image
              unoptimized
              width={140}
              height={140}
              className="care-photo"
              src={pet.photoUrl}
              alt={pet.name}
            />
          )}
          <h2>{pet.name}</h2>
          <div className="dashboard-actions">
            <Link className="button secondary" href={`/pets/${pet.id}/care`}>
              Care organizer
            </Link>
            <Link className="button secondary" href={`/admin/accounts/${id}/manage?pet=${pet.id}`}>
              Edit pet
            </Link>
            <Link
              className="button primary"
              href={`/admin/accounts/${id}/manage?kind=record&pet=${pet.id}`}
            >
              Add record
            </Link>
            <DeleteButton
              label="Delete pet"
              description="This permanently deletes this pet and all its medical records."
              action={adminAccountAction.bind(null, id, 'pet.delete', pet.id, null)}
            />
          </div>
          <p>
            {pet.species} · {pet.breed || 'Breed not specified'}
            {pet.birthDate ? ` · Born ${pet.birthDate.toISOString().slice(0, 10)}` : ''}
          </p>
          {pet.notes && <p>{pet.notes}</p>}
          <h3>Medical history</h3>
          {!pet.records.length && <p>No records yet.</p>}
          {pet.records.map((record) => (
            <article key={record.id} className="admin-privacy-note admin-record-detail">
              <strong>{record.title}</strong>
              <p>
                {record.date.toISOString().slice(0, 10)} · {record.category}{' '}
                {record.provider && `· ${record.provider}`}
              </p>
              {record.notes && <p>{record.notes}</p>}
              <div className="dashboard-actions">
                <Link
                  className="button secondary"
                  href={`/admin/accounts/${id}/manage?kind=record&pet=${pet.id}&record=${record.id}`}
                >
                  Edit record
                </Link>
                <DeleteButton
                  label="Delete record"
                  description="This permanently deletes this medical record."
                  action={adminAccountAction.bind(null, id, 'record.delete', pet.id, record.id)}
                />
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
