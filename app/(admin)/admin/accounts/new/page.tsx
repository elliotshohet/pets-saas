import { requireAdmin } from '@/lib/session';
import { MemberForm } from '@/components/member-form';
export const metadata = { title: 'Create member' };
export default async function Page() {
  await requireAdmin();
  return (
    <div className="admin-dashboard">
      <MemberForm />
    </div>
  );
}
