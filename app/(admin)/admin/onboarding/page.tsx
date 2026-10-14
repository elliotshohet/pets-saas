import { ActionIcon } from '@/components/action-icon';
import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { onboardingData } from '@/lib/admin-operations';
import { AdminSection, AdminMetric } from '@/components/admin-section';
export const metadata = { title: 'Onboarding' };
export default async function Page() {
  const data = await onboardingData((await requireAdmin()).id);
  return (
    <AdminSection
      title="Help the first steps happen."
      description="A snapshot of accounts progressing from signup to recording care."
    >
      <section className="admin-metrics">
        <AdminMetric label="Signed up" value={data.total} />
        <AdminMetric label="No pet yet" value={data.noPets} />
        <AdminMetric label="Pets, no records" value={data.noRecords} />
        <AdminMetric label="Recording care" value={data.activated} />
      </section>
      <section className="panel admin-chart">
        <h2>Time to first record</h2>
        <p>
          {data.medianHours == null
            ? 'No completed onboarding journeys yet.'
            : `Median: ${data.medianHours.toFixed(1)} hours after signup, among accounts with a record.`}
        </p>
        <p>
          This uses current profiles and earliest surviving record creation times. Deleted records
          can change the result; synthetic account histories are included. It is not an event-based
          conversion funnel.
        </p>
      </section>
      <section className="panel admin-chart">
        <h2>Where to focus</h2>
        <p>
          Review accounts that have not created a profile, then check families that have not started
          a care history.
        </p>
        <div className="dashboard-actions">
          <Link className="button primary" href="/admin/accounts?filter=empty">
            <ActionIcon label="No pets yet" />
            No pets yet
          </Link>
          <Link className="button secondary" href="/admin/accounts?filter=unrecorded">
            <ActionIcon label="Pets without records" />
            Pets without records
          </Link>
          <Link className="button secondary" href="/admin/accounts?filter=activated">
            <ActionIcon label="Recording care" />
            Recording care
          </Link>
        </div>
      </section>
    </AdminSection>
  );
}
