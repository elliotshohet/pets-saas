import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { EmailLogin } from '@/components/email-login';
import { localEmailMode } from '@/lib/local-email-mode';
import { AuthForm } from '@/components/auth-form';
import { db } from '@/lib/db';
export default async function Page() {
  if (await getUser()) redirect('/dashboard');
  if (localEmailMode()) return <EmailLogin defaultEmail={process.env.DEMO_EMAIL} />;
  const localOrigin = ['http://127.0.0.1:3017', 'http://localhost:3017'].includes(
    process.env.BETTER_AUTH_URL || '',
  );
  let demo: { email: string; password: string } | undefined;
  if (
    process.env.NODE_ENV === 'development' &&
    localOrigin &&
    process.env.DEMO_LOGIN_PREFILL === 'true'
  ) {
    const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
    const password = process.env.DEMO_PASSWORD;
    if (email && password) {
      const user = await db.user.findUnique({ where: { email }, select: { role: true } });
      if (user?.role === 'ADMIN') demo = { email, password };
    }
  }
  return <AuthForm demo={demo} />;
}
