'use client';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
function subscribe(change: () => void) {
  window.addEventListener('hashchange', change);
  window.addEventListener('popstate', change);
  return () => {
    window.removeEventListener('hashchange', change);
    window.removeEventListener('popstate', change);
  };
}
export function PetWorkspaceTabs({
  id,
  active,
}: {
  id: string;
  active: 'overview' | 'history' | 'care';
}) {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  );
  const current = active === 'care' && hash === '#documents' ? 'documents' : active;
  return (
    <nav className="pet-workspace-tabs" aria-label="Pet workspace">
      {[
        { key: 'overview', label: 'Overview', href: `/pets/${id}` },
        { key: 'history', label: 'Medical history', href: `/pets/${id}?tab=history` },
        { key: 'care', label: 'Care', href: `/pets/${id}/care#medications` },
        { key: 'documents', label: 'Documents', href: `/pets/${id}/care#documents` },
      ].map((tab) =>
        active === 'care' && ['care', 'documents'].includes(tab.key) ? (
          <a key={tab.key} href={tab.href} aria-current={current === tab.key ? 'page' : undefined}>
            {tab.label}
          </a>
        ) : (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={current === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ),
      )}
    </nav>
  );
}
