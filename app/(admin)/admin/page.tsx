import Link from 'next/link';
import { AdminForecast } from '@/components/admin-forecast';
import { Users, PawPrint, FileHeart, ArrowUpRight } from 'lucide-react';
import { requireAdmin } from '@/lib/session';
import { adminOverview, adminForecast } from '@/lib/admin-data';
import { categoryLabels } from '@/lib/validation';

export const metadata = { title: 'Dashboard' };
const number = (value: number) => value.toLocaleString('en-US');
export default async function Admin() {
  const user = await requireAdmin();
  const [overview, forecast] = await Promise.all([adminOverview(user.id), adminForecast(user.id)]);
  const maxGrowth = Math.max(1, ...overview.growth.map((item) => item.accounts ?? 0));
  const maxSpecies = Math.max(1, ...overview.species.map((item) => item.count ?? 0));
  return (
    <div className="admin-dashboard">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">PETS / OPERATIONS</p>
          <h1>A little care. At every scale.</h1>
          <p>Product insights and account records in one administrator workspace.</p>
        </div>
        <span className="admin-mode">
          <span className="status-dot" />
          Administrator
        </span>
      </header>
      <div className="admin-demo-banner">
        <span className="badge neutral">DEMO WORKSPACE</span>
        <p>
          {number(overview.synthetic)} synthetic accounts with fictional care histories. All metrics
          reflect the database.
        </p>
      </div>
      <section className="admin-metrics" aria-label="Product metrics">
        {[
          {
            label: 'Accounts',
            value: number(overview.accounts),
            detail: `${number(overview.newAccounts)} joined in the last 30 days`,
            Icon: Users,
          },
          {
            label: 'Pets in care',
            value: number(overview.pets),
            detail: `${(overview.pets / Math.max(1, overview.accounts)).toFixed(1)} pets per account`,
            Icon: PawPrint,
          },
          {
            label: 'Medical records',
            value: number(overview.records),
            detail: 'Visits, vaccinations and everyday care',
            Icon: FileHeart,
          },
          {
            label: 'Care coverage',
            value: `${Math.round((overview.caredPets / Math.max(1, overview.pets)) * 100)}%`,
            detail: 'Pets with at least one medical record',
            Icon: ArrowUpRight,
          },
        ].map(({ label, value, detail, Icon }) => (
          <article className="panel admin-metric" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={20} aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>
      <section className="admin-metrics" aria-label="Adoption and engagement metrics">
        {[
          {
            label: 'Profile adoption',
            value: `${Math.round((overview.withPets / Math.max(1, overview.accounts)) * 100)}%`,
            detail: 'Accounts with at least one pet profile',
          },
          {
            label: 'Care activation',
            value: `${Math.round((overview.activated / Math.max(1, overview.accounts)) * 100)}%`,
            detail: 'Accounts with at least one medical record',
          },
          {
            label: 'Recording accounts · 30d',
            value: overview.active === null ? 'Withheld' : number(overview.active),
            detail: 'Accounts that added a record in the last 30 days',
          },
          {
            label: '30-day return rate',
            value: overview.returnRate === null ? 'Not enough data' : `${overview.returnRate}%`,
            detail: 'Of prior-period recording accounts, those recording again this period',
          },
        ].map((item) => (
          <article className="panel admin-metric" key={item.label}>
            <div>{item.label}</div>
            <strong className="admin-usage-value">{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>
      <section className="panel admin-chart admin-onboarding">
        <div className="admin-section-heading">
          <div>
            <h2>Where onboarding slows down</h2>
            <p>Current cumulative adoption, not tracked conversion events.</p>
          </div>
        </div>
        <div className="admin-onboarding-stages">
          {[
            { label: 'Signed up', count: overview.accounts },
            { label: 'Added a pet', count: overview.withPets },
            { label: 'Recorded care', count: overview.activated },
          ].map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{number(item.count)}</strong>
              <span>
                {Math.round((item.count / Math.max(1, overview.accounts)) * 100)}% of accounts
              </span>
            </div>
          ))}
        </div>
      </section>
      <div className="admin-charts">
        <section className="panel admin-chart">
          <div className="admin-section-heading">
            <div>
              <h2>A growing pet family</h2>
              <p>Account registrations · Last 12 months</p>
            </div>
            <span className="badge neutral">Monthly</span>
          </div>
          <div
            className="admin-bars"
            role="img"
            aria-label={overview.growth
              .map((item) => `${item.month}: ${item.accounts ?? 'withheld'} accounts`)
              .join(', ')}
          >
            {overview.growth.map((item, index) => (
              <div className="admin-bar-column" key={index}>
                <span className="admin-bar-value">{item.accounts ?? 'Hidden'}</span>
                <div className="admin-bar-track">
                  <div
                    style={{ height: `${Math.max(1, ((item.accounts ?? 0) / maxGrowth) * 100)}%` }}
                  />
                </div>
                <span>{item.month}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel admin-chart">
          <div className="admin-section-heading">
            <div>
              <h2>Who we care for</h2>
              <p>Every personality has a place here.</p>
            </div>
          </div>
          <div className="admin-species">
            {overview.species.map((item) => (
              <div key={item.species}>
                <div>
                  <span>{item.species}</span>
                  <strong>{item.count === null ? 'Hidden' : number(item.count)}</strong>
                </div>
                <div className="admin-progress">
                  <span style={{ width: `${((item.count ?? 0) / maxSpecies) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel admin-chart">
        <h2>Explore your community</h2>
        <p>Find an account or dig into the care records behind these metrics.</p>
        <div className="dashboard-actions">
          <Link className="button primary" href="/admin/accounts">
            Browse accounts
          </Link>
          <Link className="button secondary" href="/admin/care">
            Care statistics
          </Link>
        </div>
      </section>
      <div className="admin-charts">
        <section className="panel admin-chart">
          <div className="admin-section-heading">
            <div>
              <h2>Care, by chapter</h2>
              <p>Medical records by category</p>
            </div>
          </div>
          <div className="admin-category-list">
            {overview.categories.map((item) => (
              <div key={item.category}>
                <span>{categoryLabels[item.category]}</span>
                <strong>{item.count === null ? 'Hidden' : number(item.count)}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel admin-chart">
          <div className="admin-section-heading">
            <div>
              <h2>Care recorded over time</h2>
              <p>Records added per month · UTC</p>
            </div>
          </div>
          <div className="admin-category-list">
            {overview.growth.map((item, index) => (
              <div key={index}>
                <span>{item.month}</span>
                <strong>{item.records === null ? 'Withheld' : number(item.records)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <AdminForecast data={forecast} synthetic={overview.synthetic} />
      <details className="panel admin-chart admin-definitions">
        <summary>How these metrics are calculated</summary>
        <p>
          Recording activity uses record creation time, not visit dates or logins. Return rate
          compares two consecutive 30-day periods: accounts recording in the previous period that
          also recorded in the current period, divided by previous-period recording accounts.
          Monthly counts use UTC and the current month is partial. No revenue, login activity or
          conversion-event data is inferred.
        </p>
        <p>
          Account names, emails and care histories are available to administrators. Data refreshes
          when this page loads.
        </p>
      </details>
    </div>
  );
}
