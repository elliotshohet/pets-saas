import { requireUser } from '@/lib/session';
import { ownedDb } from '@/lib/owned-db';
import { Navigation } from '@/components/navigation';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const pets = await ownedDb(user.id).pet.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  return (
    <>
      <Navigation email={user.email} pets={pets} />
      <div className="main-shell">
        <div className="topbar">
          <span>
            <span className="status-dot" />
            Your pet family, cared for.
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
