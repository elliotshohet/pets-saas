import { requireAdmin } from '@/lib/session';
import { healthData } from '@/lib/admin-operations';
import { AdminSection, AdminMetric } from '@/components/admin-section';
export const metadata = { title: 'System health' };
export default async function Page() {
  const data = await healthData((await requireAdmin()).id);
  return (
    <AdminSection
      title="A pulse on the product."
      description="Live checks and tracked errors, without exposing credentials."
    >
      <section className="admin-metrics">
        <AdminMetric label="Database probe" value={data.database ? 'Connected' : 'Unavailable'} />
        <AdminMetric label="Probe and query time" value={`${data.latency} ms`} />
        <AdminMetric label="Auth failures · 24h" value={data.counts['auth.failure'] || 0} />
        <AdminMetric label="Tracked app errors · 24h" value={data.counts['app.error'] || 0} />
      </section>
      <section className="panel admin-chart">
        <h2>Authentication signals</h2>
        <div className="admin-category-list">
          <div>
            <span>Successful sign-ins · 24h</span>
            <strong>{data.counts['auth.login'] || 0}</strong>
          </div>
          <div>
            <span>Rate-limited requests · 24h</span>
            <strong>{data.counts['auth.rate_limited'] || 0}</strong>
          </div>
          <div>
            <span>Successful signups · 24h</span>
            <strong>{data.counts['auth.signup'] || 0}</strong>
          </div>
        </div>
      </section>
      <section className="panel admin-chart">
        <h2>Monitoring scope</h2>
        <p>
          Checked {data.checkedAt.toISOString()}. Refresh to check again. This page reaching you
          confirms that the application answered this request; it does not establish uptime.
        </p>
        <p>
          {data.first
            ? `Earliest retained tracked event: ${data.first.toISOString()}.`
            : 'No events have been tracked yet.'}{' '}
          Zero means no retained events in the window, not proof that no errors occurred. Only auth
          HTTP requests and unexpected member mutation errors are instrumented; infrastructure,
          rendering and unhandled process errors are not comprehensively monitored. A complete
          database outage may prevent authentication and this page from loading.
        </p>
      </section>
    </AdminSection>
  );
}
