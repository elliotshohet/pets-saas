import type { adminForecast } from '@/lib/admin-data';
const number = (value: number) => value.toLocaleString('en-US');
export function AdminForecast({
  data,
  synthetic,
}: {
  data: Awaited<ReturnType<typeof adminForecast>>;
  synthetic: number;
}) {
  return (
    <section className="panel admin-chart" aria-label="30-day forecast">
      <div className="admin-section-heading">
        <div>
          <p className="admin-eyebrow">LOOKING AHEAD</p>
          <h2>What could the next 30 days look like?</h2>
          <p>A simple forecast from eight complete weeks of recording activity.</p>
        </div>
        <span className="badge neutral">Estimate</span>
      </div>
      <div className="admin-charts">
        {[
          { label: 'New accounts', forecast: data.accounts },
          { label: 'Records added', forecast: data.records },
        ].map(({ label, forecast }) => (
          <article className="admin-forecast-card" key={label}>
            <h3>{label}</h3>
            {forecast ? (
              <>
                <strong className="admin-forecast-value">{number(forecast.expected)}</strong>
                <p>Expected over the next 30 days</p>
                <p className="admin-forecast-range">
                  Historical pace scenarios: {number(forecast.low)}–{number(forecast.high)}
                </p>
                <p>
                  {forecast.change === null
                    ? 'No prior-period baseline.'
                    : `${forecast.change > 0 ? '+' : ''}${forecast.change}% over the previous four weeks`}{' '}
                  · {number(forecast.recent)} in the latest four weeks
                </p>
              </>
            ) : (
              <p>
                Not enough history. At least 56 days of history and 20 events in that period are
                required.
              </p>
            )}
          </article>
        ))}
      </div>
      <details className="admin-definitions">
        <summary>How the forecast works</summary>
        <p>
          Observation window: {data.start} through {data.end}, UTC. Today is excluded. The latest
          four weekly counts are weighted 1, 2, 3 and 4, averaged, then scaled to 30 days. Scenario
          bounds scale the lowest and highest weekly counts from all eight weeks. They are not
          statistical confidence intervals. This assumes recent recording pace continues; it does
          not model seasonality, campaigns, clinical outcomes or future user behavior.
        </p>
        <p>
          {synthetic
            ? `${number(synthetic)} synthetic accounts are included. This is a demonstration forecast, not evidence of live business growth.`
            : 'Estimates use the current database and may change as records are added or removed.'}{' '}
          Records refer to creation in the app, not visit dates. Refreshing the page recalculates
          the forecast.
        </p>
      </details>
    </section>
  );
}
