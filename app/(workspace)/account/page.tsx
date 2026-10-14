import Link from 'next/link';
import { UserRound, ShieldCheck, FileHeart, ArrowRight } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { ownedDb } from '@/lib/owned-db';
import { PageHeader } from '@/components/ui';
export const metadata = { title: 'My account' };
export default async function AccountPage() {
  const user = await requireUser();
  const db = ownedDb(user.id);
  const [pets, records] = await Promise.all([db.pet.count(), db.medicalRecord.count()]);
  return (
    <>
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="My account"
        description="Your profile, account access, and pet data."
      />
      <div className="account-grid">
        <section className="panel account-panel" id="profile">
          <h2>
            <UserRound size={20} aria-hidden="true" /> Profile
          </h2>
          <dl className="about-essential-details">
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
          <p>
            Your account is shared across your pet profiles. Pet details are managed in each pet’s
            Overview.
          </p>
          <Link className="text-link" href="/dashboard">
            <ArrowRight size={16} /> Your pets
          </Link>
        </section>
        <section className="panel account-panel" id="access">
          <h2>
            <ShieldCheck size={20} aria-hidden="true" /> Account access
          </h2>
          <p>
            Sign in with your email. Emails are not verified; anyone who can reach this site can
            open an account by entering its email.
          </p>
          <p>
            Sign out using the sidebar when you finish on a shared device. Sessions expire after
            eight hours.
          </p>
        </section>
        <section className="panel account-panel" id="data">
          <h2>
            <FileHeart size={20} aria-hidden="true" /> Data & privacy
          </h2>
          <p>
            {pets} {pets === 1 ? 'pet' : 'pets'} · {records} medical{' '}
            {records === 1 ? 'record' : 'records'} in your workspace.
          </p>
          <p>
            Pet profiles, documents, and medical records belong to your account. Authorized
            administrators can access account information and care records.
          </p>
          <p>
            To export a pet’s selected records, use Care summary. Original documents can be
            downloaded from Documents.
          </p>
          <Link className="text-link" href="/records">
            <ArrowRight size={16} /> Browse your records
          </Link>
        </section>
      </div>
    </>
  );
}
