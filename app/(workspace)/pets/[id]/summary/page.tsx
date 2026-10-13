import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { accessPet } from '@/lib/care';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/dates';
import { PrintButton } from '@/components/care-form';
export const metadata = { title: 'Care summary' };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ records?: string | string[]; selected?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  let pet;
  try {
    pet = await accessPet(user.id, id);
  } catch {
    notFound();
  }
  const query = await searchParams;
  const selected = typeof query.records === 'string' ? [query.records] : query.records || [];
  const all = await db.medicalRecord.findMany({
    where: { petId: id },
    include: { attachments: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  });
  const medications = await db.medicationPlan.findMany({
    where: { petId: id },
    orderBy: { createdAt: 'asc' },
  });
  const records = query.selected ? all.filter((r) => selected.includes(r.id)) : all;
  return (
    <div className="care-page care-summary">
      <Link className="text-link no-print" href={`/pets/${id}/care`}>
        ← Care organizer
      </Link>
      <header className="page-header">
        <div>
          <h1>{pet.name}’s care summary</h1>
          <p>
            {pet.species} · {pet.breed || 'Breed unknown'} · Born{' '}
            {dateKey(pet.birthDate) || 'Unknown'}
          </p>
        </div>
        <PrintButton />
      </header>
      <section className="panel admin-chart">
        <h2>Care essentials</h2>
        <p>Microchip: {pet.microchip || 'Not recorded'}</p>
        <p>Emergency contact: {pet.emergencyContact || 'Not recorded'}</p>
        <p>Allergies: {pet.allergies || 'Unknown / not recorded'}</p>
        <p>Current medications: {pet.medications || 'Not recorded'}</p>
        <p>{pet.notes}</p>
      </section>
      <section className="panel admin-chart">
        <h2>Current medication plan</h2>
        {!medications.length && <p>No structured medications recorded.</p>}
        {medications.map((m) => (
          <article className="care-item" key={m.id}>
            <h3>{m.name}</h3>
            <p>
              {m.dose} · {m.frequency}
            </p>
            <p>{m.instructions}</p>
          </article>
        ))}
      </section>
      <form className="panel admin-chart no-print" method="GET">
        <h2>Choose records to include</h2>
        <input name="selected" type="hidden" value="1" />
        {all.map((r) => (
          <label className="summary-select" key={r.id}>
            <input
              type="checkbox"
              name="records"
              value={r.id}
              defaultChecked={!query.selected || selected.includes(r.id)}
            />
            {dateKey(r.date)} · {r.title}
          </label>
        ))}
        <button className="button secondary">Update summary</button>
      </form>
      <section className="panel admin-chart">
        <h2>Selected medical history</h2>
        {!records.length && <p>No records selected.</p>}
        {records.map((r) => (
          <article key={r.id} className="care-item">
            <h3>{r.title}</h3>
            <p>
              {dateKey(r.date)} · {r.category} · {r.provider || 'Clinic not recorded'}
            </p>
            <p>{r.notes}</p>
            <p>
              Source: manually entered
              {r.attachments.length ? ' with original documents attached' : ''}
            </p>
            {r.attachments.map((a) => (
              <p key={a.id}>
                {a.name}{' '}
                <Link className="no-print text-link" href={`/api/files/${a.id}`}>
                  Download original
                </Link>
              </p>
            ))}
          </article>
        ))}
      </section>
      <p>
        Owner-maintained information. Dates and medication instructions should be confirmed with
        your veterinarian. Generated {new Date().toISOString().slice(0, 10)}.
      </p>
    </div>
  );
}
