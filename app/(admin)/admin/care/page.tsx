import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { adminOverview } from '@/lib/admin-data';
import { categoryLabels } from '@/lib/validation';
export const metadata = { title: 'Admin care statistics' };
const number = (value: number) => value.toLocaleString('en-US');
export default async function Care() {
  const admin = await requireAdmin();
  const data = await adminOverview(admin.id);
  return (
    <div className="admin-dashboard">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">PETS / CARE STATISTICS</p>
          <h1>A fuller picture of care.</h1>
          <p>Coverage, record mix and recording activity across all accounts.</p>
        </div>
      </header>
      <section className="admin-metrics" aria-label="Care totals">
        {[
          { label: 'Pet profiles', value: number(data.pets) },
          { label: 'Pets with records', value: number(data.caredPets) },
          { label: 'Pets without records', value: number(data.pets - data.caredPets) },
          { label: 'Records per pet', value: (data.records / Math.max(1, data.pets)).toFixed(1) },
        ].map((item) => (
          <article className="panel admin-metric" key={item.label}>
            <div>{item.label}</div>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>
      <div className="admin-charts">
        <section className="panel admin-chart">
          <h2>Care by category</h2>
          <p>{number(data.records)} records across the product.</p>
          <div className="admin-category-list">
            {data.categories.map((item) => (
              <div key={item.category}>
                <span>{categoryLabels[item.category]}</span>
                <strong>
                  {number(item.count)} ·{' '}
                  {Math.round((item.count / Math.max(1, data.records)) * 100)}%
                </strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel admin-chart">
          <h2>Pet family mix</h2>
          <p>Profiles by species.</p>
          <div className="admin-category-list">
            {data.species.map((item) => (
              <div key={item.species}>
                <span>{item.species}</span>
                <strong>{number(item.count)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel admin-chart">
        <h2>Records added by month</h2>
        <p>Last 12 months · UTC · Current month is partial.</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Records added</th>
                <th scope="col">Accounts joined</th>
              </tr>
            </thead>
            <tbody>
              {data.growth.map((item, index) => (
                <tr key={index}>
                  <td>{item.month}</td>
                  <td>{number(item.records)}</td>
                  <td>{number(item.accounts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel admin-chart">
        <h2>Find gaps in onboarding</h2>
        <p>
          {number(data.accounts - data.withPets)} accounts have not added a pet.{' '}
          {number(data.withPets - data.activated)} have profiles but no care records.
        </p>
        <div className="dashboard-actions">
          <Link className="button secondary" href="/admin/accounts?filter=empty">
            Accounts getting started
          </Link>
          <Link className="button secondary" href="/admin/accounts?filter=families">
            Accounts with pets
          </Link>
        </div>
      </section>
      <p className="admin-privacy-note">
        These statistics include fictional seeded data. Activity means records added to the app, not
        clinical visits or logins. Read-only; refreshed on each request.
      </p>
    </div>
  );
}
