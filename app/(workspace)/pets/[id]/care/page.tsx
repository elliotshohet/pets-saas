import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { accessPet, taskStatus } from '@/lib/care';
import { db } from '@/lib/db';
import { today, dateKey } from '@/lib/dates';
import { PhotoInput } from '@/components/photo-input';
import { CareForm } from '@/components/care-form';
export const metadata = { title: 'Care organizer' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  let pet;
  try {
    pet = await accessPet(user.id, id);
  } catch {
    notFound();
  }
  const [records, files, tasks, logs, medications] = await Promise.all([
    db.medicalRecord.findMany({
      where: { petId: id },
      select: { id: true, title: true },
      orderBy: { date: 'desc' },
    }),
    db.petMedia.findMany({
      where: { petId: id, kind: 'DOCUMENT' },
      select: { id: true, name: true, record: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.careTask.findMany({ where: { petId: id }, orderBy: { dueDate: 'asc' } }),
    db.careLog.findMany({
      where: { petId: id },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 60,
    }),
    db.medicationPlan.findMany({ where: { petId: id }, orderBy: { createdAt: 'desc' } }),
  ]);
  const weights = logs.filter((l) => l.weightKg != null).reverse();
  const firstWeightTime = weights[0]?.date.getTime() || 0;
  const lastWeightTime = weights[weights.length - 1]?.date.getTime() || firstWeightTime;
  const xFor = (value: Date) =>
    20 +
    ((value.getTime() - firstWeightTime) * 460) /
      Math.max(86400000, lastWeightTime - firstWeightTime);
  const min = Math.min(...weights.map((l) => l.weightKg!)),
    max = Math.max(...weights.map((l) => l.weightKg!));
  return (
    <div className="care-page">
      <Link className="text-link" href={`/pets/${id}`}>
        ← {pet.name}
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">CARE ORGANIZER</p>
          <h1>{pet.name}’s everyday care.</h1>
          <p className="subtitle">
            Your records, schedules and observations. No automatic clinical advice.
          </p>
        </div>
        <Link className="button primary" href={`/pets/${id}/summary`}>
          Care summary
        </Link>
      </header>
      <nav className="care-tabs" aria-label="Care sections">
        {[
          ['photos', 'Photo'],
          ['essentials', 'Essentials'],
          ['medications', 'Medications'],
          ['documents', 'Documents'],
          ['reminders', 'Reminders'],
          ['observations', 'Weight & notes'],
        ].map(([anchor, label]) => (
          <Link className="button secondary" key={anchor} href={`#${anchor}`}>
            {label}
          </Link>
        ))}
      </nav>
      <section id="photos" className="panel admin-chart">
        <h2>Profile photo</h2>
        {pet.photoUrl?.startsWith('/seed-pets/') && (
          <p>Illustrative stock photo for fictional seed data.</p>
        )}
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
        <p>JPEG, PNG or WebP, up to 5 MB. Images are resized and metadata is removed.</p>
        <CareForm petId={id} operation="photo" label="Upload / replace photo">
          <PhotoInput />
        </CareForm>
        {pet.photoUrl && (
          <CareForm petId={id} operation="remove-photo" label="Remove photo">
            <span>Restore the illustrated avatar.</span>
          </CareForm>
        )}
      </section>
      <section id="essentials" className="panel admin-chart">
        <h2>Care essentials</h2>
        <CareForm petId={id} operation="essentials" label="Save essentials">
          <label>
            Microchip number
            <input name="microchip" maxLength={100} defaultValue={pet.microchip || ''} />
          </label>
          <label>
            Emergency contact
            <input
              name="emergencyContact"
              maxLength={300}
              defaultValue={pet.emergencyContact || ''}
            />
          </label>
          <label>
            Allergies (leave blank if unknown)
            <textarea name="allergies" maxLength={2000} defaultValue={pet.allergies || ''} />
          </label>
          <label>
            Additional medication notes (optional)
            <textarea name="medications" maxLength={2000} defaultValue={pet.medications || ''} />
          </label>
        </CareForm>
      </section>
      <section id="medications" className="panel admin-chart">
        <h2>Current medication plan</h2>
        <p>
          Copy your veterinarian’s prescribed dose and frequency; this app does not choose
          treatments. Add a medication reminder separately below.
        </p>
        <CareForm petId={id} operation="medication" label="Add medication">
          <label>
            Name
            <input name="name" required maxLength={120} />
          </label>
          <label>
            Prescribed dose
            <input name="dose" required maxLength={120} />
          </label>
          <label>
            Frequency
            <input name="frequency" required maxLength={120} />
          </label>
          <label>
            Instructions
            <textarea name="instructions" maxLength={2000} />
          </label>
        </CareForm>
        {medications.map((m) => (
          <article className="care-item" key={m.id}>
            <h3>{m.name}</h3>
            <p>
              {m.dose} · {m.frequency}
            </p>
            <p>{m.instructions}</p>
            <CareForm petId={id} operation="delete-medication" label="Remove medication">
              <input type="hidden" name="id" value={m.id} />
              <label>
                <input type="checkbox" name="confirm" value="yes" required /> Confirm removal from
                current plan
              </label>
            </CareForm>
          </article>
        ))}
      </section>
      <section id="documents" className="panel admin-chart">
        <h2>Original documents</h2>
        <p>
          Private downloads. Attach PDF or image files to a medical record (10 MB each, 20 files per
          pet including the photo).
        </p>
        {records.length ? (
          <CareForm petId={id} operation="document" label="Attach document">
            <label>
              Medical record
              <select name="recordId" required>
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Document title
              <input name="title" maxLength={120} required />
            </label>
            <label>
              Original file
              <input
                name="file"
                type="file"
                required
                accept="application/pdf,image/jpeg,image/png,image/webp"
              />
            </label>
          </CareForm>
        ) : (
          <Link href={`/pets/${id}/records/new`} className="text-link">
            Add a medical record first
          </Link>
        )}
        {files.map((file) => (
          <article className="care-item" key={file.id}>
            <Link className="text-link" href={`/api/files/${file.id}`}>
              {file.name} ↓
            </Link>
            <p>Source: user-uploaded document · {file.record?.title}</p>
            <CareForm petId={id} operation="remove-document" label="Delete document">
              <input type="hidden" name="id" value={file.id} />
              <label>
                <input type="checkbox" name="confirm" value="yes" required /> Confirm permanent
                document deletion
              </label>
            </CareForm>
          </article>
        ))}
      </section>
      <section id="reminders" className="panel admin-chart">
        <h2>Reminders and schedules</h2>
        <p>
          Enter due dates and instructions from your care plan. Notifications appear here and on
          your dashboard; email and push delivery are not enabled.
        </p>
        <Link className="text-link" href={`/api/pets/${id}/calendar`}>
          Download calendar (.ics)
        </Link>
        <CareForm petId={id} operation="task" label="Add reminder">
          <label>
            Reminder title
            <input name="title" required maxLength={120} />
          </label>
          <label>
            Type
            <select name="kind">
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="VACCINATION">Vaccination</option>
              <option value="MEDICATION">Medication</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label>
            Due date
            <input name="dueDate" type="date" required defaultValue={today()} />
          </label>
          <label>
            Timezone
            <input name="timezone" required defaultValue="America/Los_Angeles" />
          </label>
          <label>
            Repeat every N days (optional)
            <input name="intervalDays" type="number" min={1} max={3650} />
          </label>
          <label>
            Instructions / prescribed dose
            <textarea name="instructions" maxLength={2000} />
          </label>
        </CareForm>
        {tasks.map((task) => (
          <article key={task.id} className="care-item">
            <h3>{task.title}</h3>
            <p>
              {taskStatus(task)} · {dateKey(task.dueDate)} · {task.timezone}
              {task.intervalDays ? ` · Every ${task.intervalDays} days` : ''}
            </p>
            <p>{task.instructions}</p>
            {!task.completedAt && (
              <div className="care-task-actions">
                <CareForm
                  petId={id}
                  operation="complete"
                  label={task.intervalDays ? 'Complete & schedule next' : 'Complete'}
                >
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="scheduledDate" value={dateKey(task.dueDate)} />
                </CareForm>
                <CareForm petId={id} operation="snooze" label="Snooze / reschedule">
                  <input type="hidden" name="id" value={task.id} />
                  <label>
                    New due date
                    <input
                      name="dueDate"
                      type="date"
                      required
                      defaultValue={dateKey(task.dueDate)}
                    />
                  </label>
                </CareForm>
              </div>
            )}
            <CareForm petId={id} operation="delete-task" label="Delete reminder">
              <input type="hidden" name="id" value={task.id} />
              <label>
                <input type="checkbox" name="confirm" value="yes" required /> Confirm reminder
                deletion
              </label>
            </CareForm>
          </article>
        ))}
      </section>
      <section id="observations" className="panel admin-chart">
        <h2>Weight and observations</h2>
        <CareForm petId={id} operation="log" label="Add observation">
          <label>
            Date
            <input name="date" type="date" max={today()} defaultValue={today()} required />
          </label>
          <label>
            Weight (kg, optional)
            <input name="weightKg" type="number" min="0.001" max="1000" step="0.001" />
          </label>
          <label>
            Observation (optional)
            <textarea name="observation" maxLength={2000} />
          </label>
        </CareForm>
        <p>Latest 60 entries. Values are owner-entered observations, not diagnoses.</p>
        {weights.length > 0 && (
          <figure>
            <svg
              className="weight-chart"
              viewBox="0 0 500 160"
              role="img"
              aria-label={`Weight trend: ${weights.map((l) => `${dateKey(l.date)}: ${l.weightKg} kg`).join(', ')}`}
            >
              <line x1="20" y1="140" x2="480" y2="140" stroke="#eeded8" />
              <polyline
                fill="none"
                stroke="#ff542e"
                strokeWidth="3"
                points={weights
                  .map(
                    (l) =>
                      `${xFor(l.date)},${130 - ((l.weightKg! - min) * 110) / Math.max(0.1, max - min)}`,
                  )
                  .join(' ')}
              />
              {weights.map((l) => (
                <circle
                  key={l.id}
                  cx={xFor(l.date)}
                  cy={130 - ((l.weightKg! - min) * 110) / Math.max(0.1, max - min)}
                  r="4"
                  fill="#500014"
                />
              ))}
            </svg>
            <figcaption>
              {dateKey(weights[0].date)} – {dateKey(weights[weights.length - 1].date)} · {min}–{max}{' '}
              kg
            </figcaption>
          </figure>
        )}
        {logs.map((log) => (
          <article key={log.id} className="care-item">
            <p>
              {dateKey(log.date)}
              {log.weightKg != null ? ` · ${log.weightKg} kg` : ''}
            </p>
            <p>{log.observation}</p>
            <CareForm petId={id} operation="delete-log" label="Delete observation">
              <input type="hidden" name="id" value={log.id} />
              <label>
                <input type="checkbox" name="confirm" value="yes" required /> Confirm observation
                deletion
              </label>
            </CareForm>
          </article>
        ))}
      </section>
    </div>
  );
}
