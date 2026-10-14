import Link from 'next/link';
import { PawPrint, FileHeart, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui';
export const metadata = { title: 'Help & guide' };
export default function HelpPage() {
  return (
    <>
      <PageHeader
        eyebrow="A LITTLE GUIDANCE"
        title="Help & guide"
        description="Keep your pet’s details, care, and documents together."
      />
      <div className="account-grid">
        <section className="panel account-panel">
          <h2>
            <PawPrint size={20} /> Start with your pets
          </h2>
          <p>
            Add a pet from the dashboard or sidebar. Open their Overview to edit the profile, photo,
            microchip, allergies, and emergency contact.
          </p>
          <Link className="text-link" href="/dashboard">
            <ArrowRight size={16} /> Your pets
          </Link>
        </section>
        <section className="panel account-panel">
          <h2>
            <FileHeart size={20} /> Medical history
          </h2>
          <p>
            Add checkups, vaccinations, medications, and procedures with their actual dates. Search
            and filter the history, and record the clinic and notes for each visit.
          </p>
          <p>
            Care contains medication plans and weight or observation logs. Care summary lets you
            choose records to print or save.
          </p>
        </section>
        <section className="panel account-panel">
          <h2>
            <FileText size={20} /> Photos & documents
          </h2>
          <p>
            Upload a JPEG, PNG, or WebP profile photo up to 5 MB from Overview. Attach an image up
            to 10 MB to an existing medical record in Documents. Each pet can have up to 20 files,
            including their photo.
          </p>
          <p>Use Care summary to print or save selected records as a PDF.</p>
        </section>
      </div>
    </>
  );
}
