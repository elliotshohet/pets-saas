import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Pets home">
      <span className="brand-mark">
        <PawPrint size={23} aria-hidden="true" />
      </span>
      <span>Pets</span>
    </Link>
  );
}
