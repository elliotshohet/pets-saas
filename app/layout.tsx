import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Pets · Care, together', template: '%s · Pets' },
  description: 'A little care, all in one place. Pet profiles and medical records.',
};
export const dynamic = 'force-dynamic';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation />
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
      </body>
    </html>
  );
}
