export function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-dashboard">
      <header className="admin-heading">
        <div>
          <p className="admin-eyebrow">PETS / OPERATIONS</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      {children}
    </div>
  );
}
export function AdminMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="panel admin-metric">
      <div>{label}</div>
      <strong className="admin-usage-value">
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </strong>
    </article>
  );
}
