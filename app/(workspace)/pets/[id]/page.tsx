import { ActionIcon } from '@/components/action-icon';
import { CareForm } from '@/components/care-form';
import { PhotoInput } from '@/components/photo-input';
import { PetWorkspaceHeader } from '@/components/pet-workspace';
import { PetWorkspaceTabs } from '@/components/pet-workspace-tabs';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Plus, CalendarDays, MapPin, HeartPulse } from 'lucide-react';
import { ownedDb } from '@/lib/owned-db';
import { requireUser } from '@/lib/session';
import { displayDate, dateKey, today } from '@/lib/dates';
import { categories, categoryLabels } from '@/lib/validation';
import { Empty, Notice, PetAvatar, SearchBox } from '@/components/ui';
import { DeleteButton, RecordForm, PetForm } from '@/components/forms';
import { deleteRecordAction } from '@/app/actions';
export default async function PetDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    action?: string;
    editRecord?: string;
    q?: string;
    category?: string;
    notice?: string;
    record?: string;
    tab?: string;
  }>;
}) {
  const db = ownedDb((await requireUser()).id);
  const { id } = await params;
  const query = await searchParams;
  const pet = await db.pet.findUnique({
    where: { id },
    include: {
      records: {
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          attachments: { select: { id: true, name: true } },
          sourceDocument: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!pet) notFound();
  const history =
    query.tab === 'history' ||
    query.action === 'add-record' ||
    !!query.editRecord ||
    !!(query.category || query.q || query.record);
  const editingRecord = query.editRecord
    ? pet.records.find((record) => record.id === query.editRecord)
    : undefined;
  if (query.editRecord && !editingRecord) notFound();
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
      <PetWorkspaceHeader pet={pet} />
      <PetWorkspaceTabs id={id} active={history ? 'history' : 'overview'} />
      {query.action === 'add-record' || editingRecord ? (
        <section className="pet-inline-editor">
          <h2>{editingRecord ? 'Edit medical record' : 'Add medical history'}</h2>
          <RecordForm
            petId={id}
            currentDay={today()}
            cancelHref={`/pets/${id}?tab=history`}
            vaccination={query.category === 'VACCINATION'}
            record={
              editingRecord
                ? {
                    ...editingRecord,
                    date: dateKey(editingRecord.date),
                    provider: editingRecord.provider ?? '',
                    notes: editingRecord.notes ?? '',
                  }
                : undefined
            }
          />
        </section>
      ) : !history ? (
        <div className="pet-overview-grid">
          <section className="panel pet-overview-panel pet-about">
            <h2>About {pet.name}</h2>
            {query.action === 'edit-pet' ? (
              <PetForm
                currentDay={today()}
                cancelHref={`/pets/${id}`}
                pet={{
                  ...pet,
                  breed: pet.breed ?? '',
                  birthDate: dateKey(pet.birthDate),
                  notes: pet.notes ?? '',
                }}
              />
            ) : (
              <>
                <p>
                  {pet.birthDate ? `Born ${displayDate(pet.birthDate)}` : 'Birthday not recorded'}
                </p>
                <p>{pet.notes || 'Add a few details about your pet by editing their profile.'}</p>
                <Link className="text-link" href={`/pets/${id}?action=edit-pet`}>
                  Edit profile details
                </Link>
              </>
            )}
            <div className="about-essentials">
              <h3>Care essentials</h3>
              {query.action === 'edit-essentials' ? (
                <>
                  <CareForm petId={id} operation="essentials" label="Save essentials">
                    <label>
                      Microchip number
                      <input name="microchip" maxLength={100} defaultValue={pet.microchip || ''} />
                    </label>
                    <label>
                      Allergies (leave blank if unknown)
                      <textarea
                        name="allergies"
                        maxLength={2000}
                        defaultValue={pet.allergies || ''}
                      />
                    </label>
                    <label>
                      Emergency contact
                      <input
                        name="emergencyContact"
                        maxLength={300}
                        defaultValue={pet.emergencyContact || ''}
                      />
                    </label>
                    <input type="hidden" name="medications" value={pet.medications || ''} />
                  </CareForm>
                  <Link className="button secondary" href={`/pets/${id}`}>
                    <ActionIcon label="Cancel" /> Done / Cancel
                  </Link>
                </>
              ) : (
                <>
                  <dl className="about-essential-details">
                    <div>
                      <dt>Microchip</dt>
                      <dd>{pet.microchip || 'Not recorded'}</dd>
                    </div>
                    <div>
                      <dt>Allergies</dt>
                      <dd>{pet.allergies || 'Unknown / not recorded'}</dd>
                    </div>
                    <div>
                      <dt>Emergency contact</dt>
                      <dd>{pet.emergencyContact || 'Not recorded'}</dd>
                    </div>
                  </dl>
                  <Link className="text-link" href={`/pets/${id}?action=edit-essentials`}>
                    <ActionIcon label="Edit" /> Manage care essentials
                  </Link>
                </>
              )}
            </div>
          </section>
          <section className="panel pet-overview-panel overview-photo">
            <h2>Profile photo</h2>
            <PetAvatar species={pet.species} large photoUrl={pet.photoUrl} name={pet.name} />
            <p>Choose a JPEG, PNG or WebP photo up to 5 MB.</p>
            <div className="photo-controls">
              <CareForm
                petId={id}
                operation="photo"
                label={pet.photoUrl ? 'Replace photo' : 'Upload photo'}
              >
                <PhotoInput />
              </CareForm>
              {pet.photoUrl && (
                <CareForm petId={id} operation="remove-photo" label="Remove photo">
                  <span className="sr-only">Restore the illustrated avatar.</span>
                </CareForm>
              )}
            </div>
          </section>
          <section className="panel pet-overview-panel">
            <h2>Recent medical history</h2>
            {pet.records.length ? (
              pet.records.slice(0, 3).map((record) => (
                <p key={record.id}>
                  <Link
                    className="text-link"
                    href={`/pets/${id}?tab=history&record=${record.id}#record-${record.id}`}
                  >
                    {record.title}
                  </Link>
                  <br />
                  {displayDate(record.date)} · {categoryLabels[record.category]}
                </p>
              ))
            ) : (
              <p>No medical records yet. Start with their first vaccination or visit.</p>
            )}
            <Link className="text-link" href={`/pets/${id}?tab=history`}>
              View all medical history
            </Link>
          </section>
        </div>
      ) : (
        <>
          <div className="section-heading">
            <div>
              <h2>Medical history</h2>
              <p>
                {pet.records.length} {pet.records.length === 1 ? 'record' : 'records'}. Every visit,
                one story.
              </p>
            </div>
            <div className="dashboard-actions">
              <Link href={`/pets/${id}?tab=history&action=add-record`} className="button primary">
                <Plus size={18} />
                Add a record
              </Link>
            </div>
          </div>
          <form className="filter-bar" action={`/pets/${id}`}>
            <input type="hidden" name="tab" value="history" />
            <SearchBox placeholder="Search records, notes, or clinic" value={query.q} />
            <select
              key={query.category ?? 'all'}
              name="category"
              aria-label="Filter by category"
              defaultValue={query.category ?? ''}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
            <button className="button secondary">
              <ActionIcon label="Search" />
              Search
            </button>
            {(query.q || query.category) && (
              <Link href={`/pets/${id}?tab=history`} className="text-link">
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
                        href={`/pets/${id}?tab=history&editRecord=${record.id}`}
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
                    <div className="record-section">
                      <h4>Source</h4>
                      <p>
                        {record.sourceDocument
                          ? 'Imported from a PDF and reviewed by you.'
                          : `Manually entered record${record.attachments.length ? ' with original documents' : ''}.`}
                      </p>
                      {record.sourceDocument && (
                        <>
                          <p>
                            <a
                              className="text-link"
                              href={`/api/files/${record.sourceDocument.id}#page=${record.sourcePage || 1}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {record.sourceDocument.name} · page {record.sourcePage || 1} ↗
                            </a>
                          </p>
                          {record.sourceQuote && (
                            <blockquote className="record-evidence">
                              {record.sourceQuote}
                            </blockquote>
                          )}
                        </>
                      )}
                      {record.attachments.map((file) => (
                        <p key={file.id}>
                          <Link className="text-link" href={`/api/files/${file.id}`}>
                            {file.name} ↓
                          </Link>
                        </p>
                      ))}
                      <Link className="text-link" href={`/pets/${id}/care`}>
                        Manage documents
                      </Link>
                    </div>
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
                  href={
                    query.q || query.category
                      ? `/pets/${id}?tab=history`
                      : `/pets/${id}?tab=history&action=add-record`
                  }
                  action={query.q || query.category ? 'Clear filters' : 'Add a record'}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
