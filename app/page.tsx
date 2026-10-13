import Link from 'next/link';
import { getUser } from '@/lib/session';
import { localEmailMode } from '@/lib/local-email-mode';
import { ArrowUpRight, Check, FileHeart, Heart, PawPrint, Search } from 'lucide-react';
import { Brand } from '@/components/brand';

export const metadata = {
  title: 'A home for their health story',
  description:
    'Bring pet profiles and medical history together. A little organization, a lot more care.',
};
export default async function Landing() {
  const user = await getUser();
  const entryHref = user ? '/dashboard' : '/sign-up';
  const localDemo = localEmailMode();
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand />
        <nav aria-label="Website navigation">
          <Link className="landing-feature-link" href="#features">
            Why Pets?
          </Link>
          <Link className="landing-pricing-link" href="#pricing">
            Pricing
          </Link>
          <Link className="button primary" href={entryHref}>
            {user ? 'Go to dashboard' : 'Get started'} <ArrowUpRight size={17} />
          </Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">
              <Heart size={16} /> FOR THE ONES WHO MAKE YOUR DAY
            </p>
            <h1>
              Their whole story.
              <br />
              <span>A little closer.</span>
            </h1>
            <p className="landing-intro">
              From the first checkup to everyday care. Give your pet’s health history a home, so you
              can spend less time searching and more time together.
            </p>
            <div className="landing-cta-row">
              <Link className="button primary" href={entryHref}>
                {user ? 'Go to dashboard' : 'Get started'} <ArrowUpRight size={19} />
              </Link>
              <Link className="landing-secondary-link" href="#features">
                Take a look <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
          <div
            className="landing-preview"
            aria-label="Illustrative pet profile with fictional sample records"
          >
            <div className="landing-orbit orbit-one" />
            <div className="landing-orbit orbit-two" />
            <span className="landing-floating-heart">
              <Heart size={30} aria-hidden="true" />
            </span>
            <div className="landing-profile-preview">
              <span className="landing-preview-label">A PEEK AT YOUR PET FAMILY</span>
              <div className="landing-preview-pet">
                <span className="landing-pet-avatar">
                  <PawPrint size={37} />
                </span>
                <div>
                  <h2>Meet Maple.</h2>
                  <p>Golden retriever · Professional best friend</p>
                </div>
              </div>
              <div className="landing-preview-stats">
                <span>
                  <strong>One profile</strong>All their essentials
                </span>
                <span>
                  <strong>A clear history</strong>Every chapter of care
                </span>
              </div>
              <h3>Little moments. Lasting care.</h3>
              {[
                ['Annual wellness visit', 'Checkup · Feeling good'],
                ['A healthy start', 'Vaccination · Added to history'],
                ['Everyday care notes', 'Your observations, remembered'],
              ].map(([title, note]) => (
                <div className="landing-preview-record" key={title}>
                  <span>
                    <Check size={17} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{note}</p>
                  </div>
                </div>
              ))}
              <p className="landing-preview-caption">
                Fictional example · Your workspace starts fresh
              </p>
            </div>
            <div className="landing-floating-note">
              <PawPrint size={19} />
              <span>
                A little care.
                <br />
                <strong>A happier life together.</strong>
              </span>
            </div>
          </div>
        </section>
        <section id="features" className="landing-features">
          <p className="landing-eyebrow">LESS SCATTERED. MORE TOGETHER.</p>
          <h2>A clearer picture of their care.</h2>
          <p className="landing-section-intro">
            The details that matter, right where you need them.
          </p>
          <div className="landing-feature-grid">
            {[
              {
                Icon: PawPrint,
                title: 'Every pet has a place.',
                text: 'Keep profiles, birthdays and the little notes that make each member of your pet family unique.',
              },
              {
                Icon: FileHeart,
                title: 'Their history, together.',
                text: 'Add checkups, vaccinations and treatments with dates, clinic details and your own notes.',
              },
              {
                Icon: Search,
                title: 'Find the moment that matters.',
                text: 'Search and filter your records. Spend less time piecing together the last visit or looking for a detail.',
              },
            ].map(({ Icon, title, text }) => (
              <article key={title}>
                <span className="landing-feature-icon">
                  <Icon size={25} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="pricing" className="landing-pricing" aria-labelledby="pricing-title">
          <div>
            <p className="landing-eyebrow">GOOD CARE SHOULD BE SIMPLE</p>
            <h2 id="pricing-title">Free for life.</h2>
            <p>Your pet’s story deserves a home. Keep it here without a subscription.</p>
          </div>
          <article className="landing-price-card">
            <span className="badge neutral">One plan. Everything included.</span>
            <h3>Pets, for your whole family.</h3>
            <p className="landing-price">
              $0 <span>forever</span>
            </p>
            <p>No subscription. No credit card required.</p>
            <ul>
              {[
                'Pet profiles and photo uploads',
                'Medical records and private documents',
                'Care reminders and calendar export',
                'Medication plans, weight and observation logs',
                'Printable care summaries',
              ].map((feature) => (
                <li key={feature}>
                  <Check size={18} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link className="button primary" href={entryHref}>
              {user ? 'Go to dashboard' : 'Get started for free'} <ArrowUpRight size={18} />
            </Link>
          </article>
        </section>
        <section className="landing-bottom-cta">
          <PawPrint size={34} aria-hidden="true" />
          <h2>Made for your pet family.</h2>
          <p>Start with an account. Add your first pet. Build their story, one record at a time.</p>
          <Link className="button primary" href={entryHref}>
            {user ? 'Go to dashboard' : 'Let’s get started'} <ArrowUpRight size={18} />
          </Link>
        </section>
        <section className="landing-faq" aria-label="Common questions">
          <h2>A few things to know.</h2>
          <details>
            <summary>How much does Pets cost?</summary>
            <p>
              Pets is free for life. All current features are included, with no subscription or
              credit card required.
            </p>
          </details>
          <details>
            <summary>How do I get started?</summary>
            <p>
              Open the login page to get started.{' '}
              {localDemo
                ? 'This local demo accepts an email without verification.'
                : 'Create an account with your name, email and a password of 12–128 characters.'}{' '}
              Your new workspace starts empty; add a pet, then add their care records.
            </p>
          </details>
          <details>
            <summary>Who can see my records?</summary>
            <p>
              Member operations are scoped to the selected account.{' '}
              {localDemo &&
                'In this local email-only demo, anyone can open any account by entering its email.'}{' '}
              Authorized product administrators can view account information and care records.
            </p>
          </details>
          <details>
            <summary>Does Pets connect to my veterinarian?</summary>
            <p>
              Records are added manually. You can upload documents and set your own care reminders.
              Clinic connections and automatic email/push delivery are not available.
            </p>
          </details>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand />
        <p>Made for the ones who make your day.</p>
        <nav aria-label="Footer navigation">
          <Link href={entryHref}>{user ? 'Dashboard' : 'Get started'}</Link>
          <Link href={user ? '/pets' : entryHref}>{user ? 'My pets' : 'Sign up'}</Link>
        </nav>
        <small>Local prototype · Please use fictional records.</small>
      </footer>
    </div>
  );
}
