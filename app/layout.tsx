import type { Metadata } from 'next';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Pets · Care, together', template: '%s · Pets' },
  description: 'Pet profiles and private medical records.',
};
export const dynamic = 'force-dynamic';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
