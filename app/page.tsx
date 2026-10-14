import Link from 'next/link';
import { getUser } from '@/lib/session';
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Check,
  FileHeart,
  Heart,
  PawPrint,
  FolderOpen,
} from 'lucide-react';
import { Brand } from '@/components/brand';

export const metadata = {
  title: 'Pets · A home for their care',
  description: 'Keep pet records, documents and everyday care together in one simple workspace.',
};

export default async function Landing() {
  const user = await getUser();
  const entryHref = user ? '/dashboard' : '/sign-in';
  return (
    <div className="pet-site">
      <header className="site-nav">
        <Brand />
        <nav aria-label="Website navigation">
          <Link className="site-nav-detail" href="#features">
            Features
          </Link>
          <Link className="site-nav-detail" href="#how-it-works">
            How it works
          </Link>
          <Link className="site-nav-login" href="/sign-in">
            Sign in
          </Link>
          <Link className="site-button site-button-dark" href={entryHref}>
            {user ? 'Your workspace' : 'Get started'} <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="site-hero">
          <div className="site-hero-copy">
            <p className="site-kicker">
              <span /> A LITTLE ORGANIZATION. A LOT OF LOVE.
            </p>
            <h1>
              Big love.
              <br />
              Little details.
              <br />
              <em>All together.</em>
            </h1>
            <p className="site-lead">
              Their last vaccination. Their next checkup. That little thing you wanted to remember.
              Give every part of your pet’s care a home.
            </p>
            <div className="site-hero-actions">
              <Link className="site-button site-button-dark" href={entryHref}>
                {user ? 'Open your workspace' : 'Start your pet’s story'}{' '}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="site-text-link" href="#how-it-works">
                See how it works <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="site-hero-note">
              <Check size={15} aria-hidden="true" /> Free to use <span>·</span> No credit card
              needed
            </p>
          </div>
          <div
            className="site-product-scene"
            aria-label="Illustrative workspace with fictional pet care records"
          >
            <div className="site-scene-heading">
              <PawPrint size={19} aria-hidden="true" /> A HOME FOR THEIR HEALTH STORY{' '}
              <Heart size={18} aria-hidden="true" />
            </div>
            <div className="site-product-card">
              <div className="site-card-top">
                <span>MY PET FAMILY</span>
                <span className="site-demo-label">Sample workspace</span>
              </div>
              <div className="site-profile">
                <div className="site-profile-avatar">
                  <PawPrint size={38} aria-hidden="true" />
                </div>
                <div>
                  <h2>Maple</h2>
                  <p>Golden retriever · Your best friend</p>
                </div>
                <Heart className="site-profile-heart" size={22} aria-hidden="true" />
              </div>
              <div className="site-preview-tabs">
                <span>Overview</span>
                <span className="selected">Care history</span>
                <span>Documents</span>
              </div>
              <div className="site-history-title">
                <h3>Every chapter of care</h3>
                <span>3 records</span>
              </div>
              {[
                {
                  Icon: FileHeart,
                  title: 'Annual wellness visit',
                  detail: 'Checkup · Maple’s care history',
                  tag: 'Checkup',
                  tone: 'green',
                },
                {
                  Icon: Heart,
                  title: 'Vaccination record',
                  detail: 'Original document attached',
                  tag: 'Vaccination',
                  tone: 'peach',
                },
                {
                  Icon: FolderOpen,
                  title: 'A note for next time',
                  detail: 'Everyday observations, remembered',
                  tag: 'Care note',
                  tone: 'blue',
                },
              ].map(({ Icon, title, detail, tag, tone }) => (
                <div className="site-history-row" key={title}>
                  <span className={`site-record-icon ${tone}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{detail}</p>
                  </div>
                  <span className="site-record-tag">{tag}</span>
                </div>
              ))}
              <div className="site-card-bottom">
                <span>
                  <Check size={14} aria-hidden="true" /> Their story, in one place
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </div>
            </div>
            <div className="site-reminder">
              <span className="site-reminder-icon">
                <ClipboardList size={19} aria-hidden="true" />
              </span>
              <div>
                <strong>One less thing to remember.</strong>
                <p>A printable summary for your next vet visit.</p>
              </div>
            </div>
            <p className="site-scene-note">
              A fictional example of what your workspace can become.
            </p>
          </div>
        </section>
        <div className="site-benefit-strip">
          <span>
            <PawPrint size={19} aria-hidden="true" /> Every pet, one workspace
          </span>
          <span>
            <FileHeart size={19} aria-hidden="true" /> Records you can find
          </span>
          <span>
            <ClipboardList size={19} aria-hidden="true" /> Care you can share
          </span>
        </div>
        <section className="site-section" id="features">
          <div className="site-section-heading">
            <div>
              <p className="site-kicker">BUILT AROUND REAL LIFE</p>
              <h2>
                Less scattered.
                <br />
                <em>More together.</em>
              </h2>
            </div>
            <p>
              Good care lives in the details. Keep them close, without adding another complicated
              routine to your day.
            </p>
          </div>
          <div className="site-feature-grid">
            {[
              {
                Icon: PawPrint,
                number: '01',
                title: 'A place for every pet',
                text: 'Photos, birthdays, allergies and everyday notes. The essentials that make caring for each pet a little easier.',
                label: 'Their own little corner',
                tone: 'green',
              },
              {
                Icon: FileHeart,
                number: '02',
                title: 'A history that stays together',
                text: 'Keep checkups, vaccinations and original images alongside your records. Find the right detail before the next visit.',
                label: 'Less searching. More knowing.',
                tone: 'peach',
              },
              {
                Icon: ClipboardList,
                number: '03',
                title: 'Make room for what’s next',
                text: 'Track medications and observations, and take a printable care summary to your appointment.',
                label: 'A little peace of mind',
                tone: 'blue',
              },
            ].map(({ Icon, number, title, text, label, tone }) => (
              <article className={`site-feature ${tone}`} key={number}>
                <div className="site-feature-top">
                  <Icon size={28} aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="site-feature-label">
                  {label}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="site-how site-section" id="how-it-works">
          <div>
            <p className="site-kicker">START SMALL. FEEL ORGANIZED.</p>
            <h2>
              A home for their care,
              <br />
              <em>in three simple steps.</em>
            </h2>
            <Link className="site-text-link" href={entryHref}>
              Let’s get you started <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <ol>
            {[
              [
                'Make yourself at home',
                'Enter your email to open a workspace. New accounts start with a clean slate.',
              ],
              [
                'Introduce your pet family',
                'Add a profile, a photo and the essentials. Give each pet a place of their own.',
              ],
              [
                'Build their story as you go',
                'Add records and documents, keep care notes close at hand.',
              ],
            ].map(([title, text], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="site-faq site-section" id="questions">
          <div>
            <p className="site-kicker">A FEW THINGS TO KNOW</p>
            <h2>
              Before you
              <br />
              <em>settle in.</em>
            </h2>
          </div>
          <div>
            {[
              [
                'Is Pets free to use?',
                'Yes. The current app is free to use, with no subscription or credit card required.',
              ],
              [
                'Can I bring my existing records?',
                'Yes. Upload images to keep original documents with your pet’s records.',
              ],
              [
                'How does signing in work?',
                'Enter your email to open that account’s workspace. This is an email-only demo: emails are not verified, and anyone with access to the site can open an account by entering its email. Please use fictional records.',
              ],
              [
                'Can I share a summary with my vet?',
                'You can print or save a care summary as a PDF, download original documents,. Direct clinic integrations are not currently available.',
              ],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="site-final">
          <PawPrint size={32} aria-hidden="true" />
          <p className="site-kicker">FOR THE ONES WHO MAKE YOUR DAY</p>
          <h2>
            A little care.
            <br />
            <em>A whole lot of together.</em>
          </h2>
          <Link className="site-button site-button-dark" href={entryHref}>
            {user ? 'Go to your workspace' : 'Start your pet’s story'}{' '}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>
            A home for their care.
            <br />
            Made for your pet family.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="#questions">Questions</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Pets</span>
          <span>Local demo · Please use fictional records.</span>
          <Heart size={15} aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
