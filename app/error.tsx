'use client';
import Link from 'next/link';
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div className="panel empty" role="alert">
      <h1>A small bump in the road.</h1>
      <p>
        We couldn’t load your workspace. Your saved data is still in the database. Retry loading, or
        return to the overview.
      </p>
      <button className="button primary" onClick={retry}>
        Try again
      </button>
      <Link href="/" className="button secondary">
        Back to overview
      </Link>
    </div>
  );
}
