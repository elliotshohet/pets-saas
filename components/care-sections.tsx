'use client';

import { HeartPulse, Pill, Scale } from 'lucide-react';
import { Children, isValidElement, useSyncExternalStore, type ReactNode } from 'react';

const sections = [
  ['essentials', 'Essentials'],
  ['medications', 'Medications'],
  ['documents', 'Documents'],
  ['observations', 'Weight & notes'],
] as const;

const careIcons = { essentials: HeartPulse, medications: Pill, observations: Scale };

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
}

function selectedSection() {
  const hash = window.location.hash.slice(1);
  return sections.some(([id]) => id === hash) ? hash : 'medications';
}

export function CareSections({ children }: { children: ReactNode }) {
  const selected = useSyncExternalStore(subscribe, selectedSection, () => 'medications');
  return (
    <>
      <nav hidden={selected === 'documents'} className="care-tabs" aria-label="Care sections">
        {sections
          .filter(([id]) => id !== 'documents')
          .map(([id, label]) => {
            const Icon = careIcons[id as keyof typeof careIcons];
            return (
              <a
                key={id}
                href={`#${id}`}
                className={selected === id ? 'button primary' : 'button secondary'}
                aria-current={selected === id ? 'page' : undefined}
              >
                <span className="care-tab-icon">
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                </span>{' '}
                {label}
              </a>
            );
          })}
      </nav>
      {Children.map(children, (child) => {
        if (!isValidElement<{ id?: string }>(child)) return null;
        return <div hidden={child.props.id !== selected}>{child}</div>;
      })}
    </>
  );
}
