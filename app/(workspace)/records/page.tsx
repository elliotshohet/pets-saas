import MedicalHistory from '@/components/medical-history';
export const metadata = { title: 'All medical records' };
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <MedicalHistory searchParams={searchParams} />;
}
