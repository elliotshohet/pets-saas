import { redirect } from 'next/navigation';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { id } = await params;
  const { category } = await searchParams;
  const query = new URLSearchParams({ tab: 'history', action: 'add-record' });
  if (category) query.set('category', category);
  redirect(`/pets/${id}?${query}`);
}
