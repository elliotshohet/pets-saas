import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { MemberForm } from '@/components/member-form';
export const metadata = { title: 'Edit member' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const member = await db.user.findUnique({ where: { analyticsId: id } });
  if (!member || member.role !== 'USER') notFound();
  return (
    <div className="admin-dashboard">
      <MemberForm alias={id} name={member.name} email={member.email} />
    </div>
  );
}
