import Link from 'next/link';
import { z } from 'zod';
import { ownedDb } from '@/lib/owned-db';
import { requireUser } from '@/lib/session';
import { categories, categoryLabels } from '@/lib/validation';
import { displayDate } from '@/lib/dates';
import { Empty, PetAvatar } from '@/components/ui';

const filtersSchema = z
  .object({
    q: z.string().trim().max(200).default(''),
    pet: z.string().max(100).default(''),
    category: z.union([z.literal(''), z.enum(categories)]).default(''),
    clinic: z.string().trim().max(120).default(''),
    from: z.union([z.literal(''), z.iso.date()]).default(''),
    to: z.union([z.literal(''), z.iso.date()]).default(''),
  })
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'Start date must be on or before end date.',
  });
export default async function MedicalHistory({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const db = ownedDb((await requireUser()).id);
  const raw = await searchParams;
  const query = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = filtersSchema.safeParse(query);
  const filters = parsed.success ? parsed.data : null;
  const [pets, records] = await Promise.all([
    db.pet.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    filters
      ? db.medicalRecord.findMany({
          where: {
            ...(filters.pet && { petId: filters.pet }),
            ...(filters.category && { category: filters.category }),
            ...(filters.clinic && {
              provider: { contains: filters.clinic, mode: 'insensitive' as const },
            }),
            ...(filters.q && {
              OR: ['title', 'notes', 'provider'].map((field) => ({
                [field]: { contains: filters.q, mode: 'insensitive' },
              })),
            }),
            ...((filters.from || filters.to) && {
              date: {
                ...(filters.from && { gte: new Date(filters.from + 'T00:00:00Z') }),
                ...(filters.to && { lte: new Date(filters.to + 'T00:00:00Z') }),
              },
            }),
          },
          include: { pet: true },
          orderBy: [{ date: 'desc' }, { id: 'asc' }],
        })
      : Promise.resolve([]),
  ]);
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Medical history</h2>
          <p>Every pet’s care, together. Find a visit, a clinic, or a detail you need.</p>
        </div>
        <Link href="/records/new" className="button secondary">
          Add record
        </Link>
      </div>
      <form action="/records" className="panel history-filters">
        <label>
          Search records
          <input name="q" placeholder="Title, notes, or clinic" defaultValue={query.q} />
        </label>
        <label>
          Pet
          <select name="pet" defaultValue={query.pet ?? ''}>
            <option value="">All pets</option>
            {pets.map((pet) => (
              <option value={pet.id} key={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={query.category ?? ''}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Clinic
          <input name="clinic" placeholder="Any clinic" defaultValue={query.clinic} />
        </label>
        <label>
          From
          <input name="from" type="date" defaultValue={query.from} />
        </label>
        <label>
          Through
          <input name="to" type="date" defaultValue={query.to} />
        </label>
        <div className="history-filter-actions">
          <button className="button primary">Apply filters</button>
          <Link href="/records" className="text-link">
            Clear filters
          </Link>
        </div>
      </form>
      {!parsed.success ? (
        <p role="alert" className="notice">
          Check your filters. {parsed.error.issues.map((issue) => issue.message).join(' ')}
        </p>
      ) : (
        <>
          <p className="results-count" role="status">
            {records.length} {records.length === 1 ? 'record' : 'records'} found · Newest first
          </p>
          <div className="records-list">
            {records.length ? (
              records.map((record) => (
                <article className="panel record-card" key={record.id}>
                  <div className="record-top">
                    <PetAvatar
                      species={record.pet.species}
                      photoUrl={record.pet.photoUrl}
                      name={record.pet.name}
                    />
                    <div className="row-content">
                      <Link className="text-link" href={`/pets/${record.petId}`}>
                        {record.pet.name}
                      </Link>
                      <h3>{record.title}</h3>
                    </div>
                    <span className="badge neutral">{categoryLabels[record.category]}</span>
                  </div>
                  <div className="record-meta">
                    <time dateTime={record.date.toISOString().slice(0, 10)}>
                      {displayDate(record.date)}
                    </time>
                    <span>{record.provider || 'Clinic not recorded'}</span>
                  </div>
                  {record.notes && <p className="record-notes">{record.notes}</p>}
                  <div className="history-filter-actions">
                    <Link
                      className="button secondary small"
                      href={`/pets/${record.petId}/records/${record.id}/edit`}
                    >
                      Edit record
                    </Link>
                    <Link
                      className="text-link"
                      href={`/pets/${record.petId}?record=${record.id}#record-${record.id}`}
                    >
                      View visit details
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="panel">
                <Empty
                  title={
                    pets.length
                      ? Object.values(query).some(Boolean)
                        ? 'No matching records'
                        : 'No medical records yet'
                      : 'Add your first pet'
                  }
                  description={
                    pets.length
                      ? Object.values(query).some(Boolean)
                        ? 'Try a wider date range or clear your filters.'
                        : 'Add a visit, vaccination, or other care record to begin their history.'
                      : 'Create a pet profile before adding their medical history.'
                  }
                  href={
                    pets.length
                      ? Object.values(query).some(Boolean)
                        ? '/records'
                        : '/records/new'
                      : '/pets/new'
                  }
                  action={
                    pets.length
                      ? Object.values(query).some(Boolean)
                        ? 'Clear filters'
                        : 'Add a record'
                      : 'Add a pet'
                  }
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
