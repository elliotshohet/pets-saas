import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { EmailLogin } from '@/components/email-login';
import { localEmailMode } from '@/lib/local-email-mode';
import { AuthForm } from '@/components/auth-form';
export default async function Page() {
  if (await getUser()) redirect('/dashboard');
  return localEmailMode() ? <EmailLogin /> : <AuthForm signup />;
}
