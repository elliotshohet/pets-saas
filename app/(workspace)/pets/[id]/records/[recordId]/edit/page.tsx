import { redirect } from 'next/navigation';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;
  redirect(`/pets/${id}?tab=history&editRecord=${encodeURIComponent(recordId)}`);
}
