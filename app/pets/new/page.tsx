import { PetForm } from '@/components/forms';
import { PageHeader } from '@/components/ui';
import { today } from '@/lib/dates';
export const metadata = { title: 'Add a pet' };
export default function NewPet() {
  return (
    <div className="form-page">
      <PageHeader
        eyebrow="A NEW CHAPTER"
        title="Meet the newest family member."
        description="Start with the basics. You can add more details anytime."
      />
      <PetForm currentDay={today()} />
    </div>
  );
}
