import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Plus, CalendarDays, MapPin, HeartPulse } from 'lucide-react';
import { db } from '@/lib/db';
import { ageLabel, displayDate } from '@/lib/dates';
import { categories, categoryLabels } from '@/lib/validation';
import { Empty, Notice, PetAvatar, SearchBox } from '@/components/ui';
import { DeleteButton } from '@/components/forms';
import { deletePetAction, deleteRecordAction } from '@/app/actions';
export default async function PetDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; category?: string; notice?: string; record?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const pet = await db.pet.findUnique({
    where: { id },
    include: {
      records: {
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      },
    },
  });
  if (!pet) notFound();
  const records = pet.records.filter(
    (record) =>
      (!query.category || record.category === query.category) &&
      (!query.q ||
        `${record.title} ${record.provider ?? ''} ${record.notes ?? ''}`
          .toLowerCase()
          .includes(query.q.toLowerCase())),
  );
  return (
    <>
      <Link className="back-link" href="/pets">
        <ArrowLeft size={16} />
        All pets
      </Link>
      <Notice value={query.notice} />
      <section className="panel profile">
        <PetAvatar species={pet.species} large />
        <div className="profile-info">
          <p className="eyebrow">
            {pet.species.toUpperCase()} · {ageLabel(pet.birthDate).toUpperCase()}
          </p>
          <h1>{pet.name}</h1>
          <p>
            {pet.breed || 'Breed not recorded'}
            {pet.birthDate ? ` · Born ${displayDate(pet.birthDate)}` : ''}
          </p>
          {pet.notes && <p className="profile-notes">{pet.notes}</p>}
        </div>
        <div className="profile-actions">
          <Link className="button secondary" href={`/pets/${id}/edit`}>
            <Pencil size={16} />
            Edit pet
          </Link>
          <DeleteButton
            action={deletePetAction.bind(null, id)}
            label="Delete pet"
            description={`This permanently deletes ${pet.name} and all ${pet.records.length} medical records. This cannot be undone.`}
          />
        </div>
      </section>
      <div className="section-heading">
        <div>
          <h2>Medical history</h2>
          <p>
            {pet.records.length} {pet.records.length === 1 ? 'record' : 'records'}. Every visit, one
            story.
          </p>
        </div>
        <Link href={`/pets/${id}/records/new`} className="button primary">
          <Plus size={18} />
          Add a record
        </Link>
      </div>
      <form className="filter-bar" action={`/pets/${id}`}>
        <SearchBox placeholder="Search records, notes, or clinic" value={query.q} />
        <select name="category" aria-label="Filter by category" defaultValue={query.category ?? ''}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </select>
        <button className="button secondary">Search</button>
        {(query.q || query.category) && (
          <Link href={`/pets/${id}`} className="text-link">
            Clear filters
          </Link>
        )}
      </form>
      <div className="records-list timeline">
        {records.length ? (
          records.map((record) => (
            <article className="panel record-card" key={record.id} id={`record-${record.id}`}>
              <details open={query.record === record.id || undefined}>
                <summary className="timeline-summary">
                  <span className="category-label">
                    {displayDate(record.date)} · {categoryLabels[record.category]}
                  </span>
                  <strong>{record.title}</strong>
                  <span>{record.provider || 'Clinic not recorded'}</span>
                  <span className="muted">View visit details</span>
                </summary>
                <div className="record-top">
                  <span className="record-symbol">
                    <HeartPulse size={21} />
                  </span>
                  <div className="row-content">
                    <span className="category-label">{categoryLabels[record.category]}</span>
                    <h3>{record.title}</h3>
                  </div>
                  <Link
                    href={`/pets/${id}/records/${record.id}/edit`}
                    className="button secondary small"
                    aria-label={`Edit ${record.title}`}
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                </div>
                <div className="record-meta">
                  <span>
                    <CalendarDays size={15} />
                    {displayDate(record.date)}
                  </span>
                  {record.provider && (
                    <span>
                      <MapPin size={15} />
                      {record.provider}
                    </span>
                  )}
                </div>
                {record.notes && (
                  <div className="record-section">
                    <h4>Visit notes</h4>
                    <p className="record-notes">{record.notes}</p>
                  </div>
                )}
                <div className="record-bottom">
                  <DeleteButton
                    action={deleteRecordAction.bind(null, id, record.id)}
                    label="Delete record"
                    description={`Permanently delete “${record.title}”? This cannot be undone.`}
                  />
                </div>
              </details>
            </article>
          ))
        ) : (
          <div className="panel">
            <Empty
              title={
                query.q || query.category ? 'No matching records.' : 'Their story starts here.'
              }
              description={
                query.q || query.category
                  ? 'Try another search or clear the category filter.'
                  : 'Add their first visit, vaccination, or other care record.'
              }
              href={query.q || query.category ? `/pets/${id}` : `/pets/${id}/records/new`}
              action={query.q || query.category ? 'Clear filters' : 'Add a record'}
            />
          </div>
        )}
      </div>
    </>
  );
}
