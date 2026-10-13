import Link from 'next/link';
import { ArrowUpRight, HeartPulse, PawPrint } from 'lucide-react';
import { db } from '@/lib/db';
import { displayDate } from '@/lib/dates';
import { categoryLabels } from '@/lib/validation';
import { Empty, PageHeader, PetCard } from '@/components/ui';
export default async function Dashboard() {
  const [pets, recent, recordCount] = await Promise.all([
    db.pet.findMany({ include: { records: true }, orderBy: { createdAt: 'asc' } }),
    db.medicalRecord.findMany({ include: { pet: true }, orderBy: { updatedAt: 'desc' }, take: 4 }),
    db.medicalRecord.count(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="THEIR HEALTH. YOUR ADVOCACY."
        title="Take charge of their care."
        description="Pet profiles and medical history, all in one place."
        href={pets.length ? '/records/new' : '/pets/new'}
        action={pets.length ? 'Add a record' : 'Add your first pet'}
      />
      <div className="dashboard-actions">
        <Link className="button secondary" href="/pets/new">
          Add a pet
        </Link>
      </div>
      {(!pets.length || !recordCount) && (
        <section className="onboarding panel">
          <h2>A little setup. A clearer care story.</h2>
          <ol>
            <li>
              <Link href="/pets/new">{pets.length ? '✓' : '1.'} Add your first pet</Link>
            </li>
            <li>
              <Link href={pets.length ? '/records/new' : '/pets/new'}>
                {recordCount ? '✓' : '2.'} Add a medical record
              </Link>
            </li>
          </ol>
        </section>
      )}
      <div className="stats">
        <div className="stat">
          <span className="stat-icon green">
            <PawPrint size={22} />
          </span>
          <div>
            <span className="stat-label">Your pet family</span>
            <strong>
              {pets.length}
              <small>{pets.length === 1 ? 'pet' : 'pets'}</small>
            </strong>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon blue">
            <HeartPulse size={22} />
          </span>
          <div>
            <span className="stat-label">Care on record</span>
            <strong>
              {recordCount}
              <small>medical records</small>
            </strong>
          </div>
        </div>
      </div>
      <section>
        <div className="section-heading">
          <div>
            <h2>Meet your little crew</h2>
            <p>A home for every pet’s health story.</p>
          </div>
          <Link href="/pets" className="text-link">
            View all pets <ArrowUpRight size={17} />
          </Link>
        </div>
        {pets.length ? (
          <div className="pet-grid">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="panel">
            <Empty
              title="Every family starts with one."
              description="Add your first pet to start keeping their care in one place."
              href="/pets/new"
              action="Add your first pet"
            />
          </div>
        )}
      </section>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recently updated</h2>
              <p>The latest in their care story.</p>
            </div>
          </div>
          {recent.length ? (
            <div className="activity-list">
              {recent.map((record) => (
                <Link
                  href={`/pets/${record.petId}?record=${record.id}#record-${record.id}`}
                  className="activity"
                  key={record.id}
                >
                  <span className="activity-dot" />
                  <div>
                    <strong>{record.title}</strong>
                    <p>
                      {record.pet.name} · {categoryLabels[record.category]}
                    </p>
                    <small>Record date {displayDate(record.date)}</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty title="A fresh start." description="New medical records will appear here." />
          )}
        </section>
      </div>
    </>
  );
}
