'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PawPrint, FileHeart, Heart, Plus } from 'lucide-react';
export function Navigation() {
  const path = usePathname();
  return (
    <>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <PawPrint size={23} />
          </span>
          <span>Pets</span>
        </Link>
        <div className="workspace-label">Your Pet Family</div>
        <nav aria-label="Main navigation">
          {[
            { href: '/', label: 'Overview', Icon: LayoutDashboard },
            { href: '/pets', label: 'My pets', Icon: PawPrint },
            { href: '/records', label: 'Medical history', Icon: FileHeart },
          ].map(({ href, label, Icon }) => {
            const active = href === '/' ? path === '/' : path.startsWith(href);
            return (
              <Link
                href={href}
                key={href}
                className={active ? 'nav-link active' : 'nav-link'}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Heart size={21} />
          <p>
            A little care.
            <br />
            <strong>A happier life together.</strong>
          </p>
          <span>All their care, in one place.</span>
        </div>
        <div className="workspace-user">
          <span className="user-avatar">
            <PawPrint size={17} />
          </span>
          <div>My pet family</div>
        </div>
      </aside>
      {!path.includes('/new') && !path.includes('/edit') && (
        <Link href="/records/new" className="quick-add button primary">
          <Plus size={20} />
          Add record
        </Link>
      )}
    </>
  );
}
