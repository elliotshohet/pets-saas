import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { qualityData } from '@/lib/admin-operations';
import { AdminSection, AdminMetric } from '@/components/admin-section';
export const metadata = { title: 'Data quality' };
export default async function Page() {
  const data = await qualityData((await requireAdmin()).id);
  return (
    <AdminSection
      title="Keep the care story clear."
      description="Read-only checks for missing details and records worth reviewing."
    >
      <section className="admin-metrics">
        <AdminMetric label="Missing birthdays" value={data.missingBirth} />
        <AdminMetric label="Missing clinics" value={data.missingClinic} />
        <AdminMetric label="Possible duplicate groups" value={data.duplicates} />
        <AdminMetric label="Inconsistent record dates" value={data.inconsistent} />
      </section>
      <section className="panel admin-chart">
        <h2>Profiles to review</h2>
        <p>
          Latest 20 profiles with missing birthday or clinic information. Optional fields are
          completeness suggestions, not validation errors.
        </p>
        <div className="admin-category-list">
          {data.examples.map((pet, index) => (
            <div key={index}>
              <span>
                {pet.name} · {pet.owner.name}
                {!pet.birthDate ? ' · Birthday missing' : ''}
              </span>
              <Link className="text-link" href={`/admin/accounts/${pet.owner.analyticsId}`}>
                Review account
              </Link>
            </div>
          ))}
          {!data.examples.length && <p>No missing birthday or clinic information found.</p>}
        </div>
      </section>
      <section className="panel admin-chart">
        <h2>Check definitions</h2>
        <p>
          Possible duplicates share a pet, normalized title, category and calendar date. A group may
          represent legitimate repeated care; nothing is merged or deleted automatically.
          Inconsistent dates are records before the pet’s birth or after today in the workspace
          timezone.
        </p>
      </section>
    </AdminSection>
  );
}
