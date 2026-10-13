import { requireAdmin } from '@/lib/session';
import { activityData } from '@/lib/admin-operations';
import { AdminSection } from '@/components/admin-section';
const kinds = [
  'admin.pet.created',
  'admin.pet.updated',
  'admin.pet.deleted',
  'admin.record.created',
  'admin.record.updated',
  'admin.record.deleted',
  'pet.created',
  'pet.updated',
  'pet.deleted',
  'record.created',
  'record.updated',
  'record.deleted',
  'auth.signup',
  'auth.login',
  'auth.logout',
  'auth.failure',
  'auth.rate_limited',
  'app.error',
];
export const metadata = { title: 'Activity' };
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const params = await searchParams;
  const kind = kinds.includes(params.kind || '') ? params.kind : undefined;
  const events = await activityData((await requireAdmin()).id, kind);
  return (
    <AdminSection
      title="What’s happening in Pets."
      description="Latest 100 tracked application events, newest first."
    >
      <section className="panel admin-chart">
        <form action="/admin/activity" className="admin-filters">
          <label>
            Event type
            <select name="kind" defaultValue={kind || ''}>
              <option value="">All events</option>
              {kinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <button className="button primary">Filter</button>
        </form>
        <div className="admin-category-list">
          {events.map((event) => (
            <div key={event.id}>
              <strong>{event.kind.replaceAll('.', ' · ')}</strong>
              <time dateTime={event.createdAt.toISOString()}>
                {event.createdAt.toISOString().replace('T', ' ').slice(0, 19)} UTC
              </time>
            </div>
          ))}
          {!events.length && (
            <p>
              No tracked events match yet. New browser authentication requests and successful
              pet/record changes will appear here.
            </p>
          )}
        </div>
      </section>
      <p className="admin-privacy-note">
        Tracking begins with this feature; seed history is not backfilled. Events contain action
        labels and timestamps, not clinical text, credentials or session tokens. Recording is
        best-effort and is not a tamper-proof security audit. Direct database edits are not tracked.
      </p>
    </AdminSection>
  );
}
