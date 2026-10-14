import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { EmailLogin } from '@/components/email-login';
export default async function Page() {
  const user = await getUser();
  if (user) redirect('/dashboard');
  return <EmailLogin defaultEmail={process.env.ADMIN_EMAIL} />;
}
