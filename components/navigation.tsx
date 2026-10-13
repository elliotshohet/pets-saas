'use client';
import { authClient } from '@/lib/auth-client';
import { Brand } from './brand';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PawPrint,
  FileHeart,
  Heart,
  Plus,
  ShieldCheck,
  Users,
  BarChart3,
  ClipboardCheck,
  Activity,
  Server,
  ListChecks,
} from 'lucide-react';
export function Navigation({
  email,
  area = 'workspace',
  pets = [],
}: {
  email: string;
  pets?: { id: string; name: string }[];
  area?: 'workspace' | 'admin';
}) {
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const path = usePathname();
  return (
    <>
      <aside className="sidebar">
        <Brand href="/dashboard" />
        <div className="workspace-label">
          {area === 'admin' ? 'Product administration' : 'Your Pet Family'}
        </div>
        <nav aria-label="Main navigation">
          {(area === 'admin'
            ? [
                { href: '/admin', label: 'Dashboard', Icon: ShieldCheck },
                { href: '/admin/accounts', label: 'Accounts', Icon: Users },
                { href: '/admin/care', label: 'Care statistics', Icon: BarChart3 },
                { href: '/admin/onboarding', label: 'Onboarding', Icon: ListChecks },
                { href: '/admin/data-quality', label: 'Data quality', Icon: ClipboardCheck },
                { href: '/admin/activity', label: 'Activity', Icon: Activity },
                { href: '/admin/system-health', label: 'System health', Icon: Server },
              ]
            : [{ href: '/dashboard', label: 'All pets', Icon: PawPrint }]
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
              <div className="pet-nav-list" role="group" aria-label="Your pets">
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
              <Link
                href="/records"
                className={path === '/records' ? 'nav-link active' : 'nav-link'}
                aria-current={path === '/records' ? 'page' : undefined}
              >
                <FileHeart size={19} /> All records
              </Link>
            </>
          )}
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
          <div>
            {email}
            <button
              className="text-link"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                setLogoutError('');
                try {
                  const result = await authClient.signOut();
                  if (result.error) setLogoutError('Unable to sign out. Please try again.');
                  else window.location.replace('/sign-in');
                } catch {
                  setLogoutError('Unable to connect. Please try again.');
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
            {logoutError && <p role="alert">{logoutError}</p>}
          </div>
        </div>
      </aside>
    </>
  );
}
