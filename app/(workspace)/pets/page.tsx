import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/session';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, item);
    }
  }
  redirect('/dashboard' + (query.size ? '?' + query.toString() : '') + '');
}
