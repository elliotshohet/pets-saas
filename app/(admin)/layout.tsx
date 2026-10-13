import { requireAdmin } from '@/lib/session';
import { Navigation } from '@/components/navigation';
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <Navigation email="Administrator" area="admin" />
      <div className="main-shell">
        <div className="topbar">
          <span>
            <span className="status-dot" />
            Product analytics · Account management
          </span>
        </div>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          Made for the ones who make your day. <span>Pets</span>
        </footer>
      </div>
    </>
  );
}
