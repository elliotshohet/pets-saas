'use client';
import { ActionIcon } from '@/components/action-icon';
import { Brand } from './brand';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PawPrint,
  Plus,
  ShieldCheck,
  Users,
  BarChart3,
  ListChecks,
  UserRound,
  LockKeyhole,
  HelpCircle,
} from 'lucide-react';
export function Navigation({
  area = 'workspace',
  pets = [],
  administrator = false,
}: {
  email: string;
  pets?: { id: string; name: string }[];
  area?: 'workspace' | 'admin';
  administrator?: boolean;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const path = usePathname();
  return (
    <>
      <aside className="sidebar">
        <Brand href="/dashboard" />
        {area === 'admin' && <div className="workspace-label">Product administration</div>}
        <nav aria-label="Main navigation">
          {(area === 'admin'
            ? [
                { href: '/admin', label: 'Dashboard', Icon: ShieldCheck },
                { href: '/admin/accounts', label: 'Accounts', Icon: Users },
                { href: '/admin/care', label: 'Care statistics', Icon: BarChart3 },
                { href: '/admin/onboarding', label: 'Onboarding', Icon: ListChecks },
              ]
            : []
          ).map(({ href, label, Icon }) => {
            const active =
              path === href ||
              (!['/dashboard', '/admin'].includes(href) && path.startsWith(href + '/'));
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
          {area === 'workspace' && (
            <>
              <div className="sidebar-section" role="group" aria-labelledby="pet-nav-heading">
                <h2 id="pet-nav-heading" className="sidebar-section-title">
                  Pets
                </h2>
                <div className="pet-nav-list">
                  {pets.map((pet) => {
                    const href = `/pets/${pet.id}`;
                    const active = path === href || path.startsWith(href + '/');
                    return (
                      <Link
                        key={pet.id}
                        href={href}
                        className={active ? 'nav-link active' : 'nav-link'}
                        aria-current={active ? 'page' : undefined}
                      >
                        <PawPrint size={17} aria-hidden="true" />
                        <span>{pet.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href="/pets/new"
                  className={path === '/pets/new' ? 'nav-link active' : 'nav-link'}
                  aria-current={path === '/pets/new' ? 'page' : undefined}
                >
                  <Plus size={19} /> Add pet
                </Link>
              </div>
            </>
          )}
        </nav>
        <section className="sidebar-account" aria-label="Session">
          {area === 'workspace' && (
            <>
              <h2 className="sidebar-section-title">My account</h2>
              <Link href="/account" className="nav-link">
                <UserRound size={18} /> Profile & access
              </Link>
              <Link href="/account#data" className="nav-link">
                <LockKeyhole size={18} /> Data & privacy
              </Link>
              <Link href="/help" className="nav-link">
                <HelpCircle size={18} /> Help & guide
              </Link>
            </>
          )}
          <button
            className="nav-link account-logout"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              setLogoutError('');
              try {
                const result = await fetch('/api/logout', { method: 'POST' });
                if (!result.ok) setLogoutError('Unable to sign out. Please try again.');
                else window.location.replace('/sign-in');
              } catch {
                setLogoutError('Unable to connect. Please try again.');
              } finally {
                setSigningOut(false);
              }
            }}
          >
            <ActionIcon label="Sign out" /> {signingOut ? 'Logging out…' : 'Logout'}
          </button>
          {logoutError && <p role="alert">{logoutError}</p>}
        </section>
        {administrator && area !== 'admin' && (
          <div className="sidebar-admin-footer">
            <Link href="/admin" className="nav-link">
              <ShieldCheck size={18} aria-hidden="true" /> Admin dashboard
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
