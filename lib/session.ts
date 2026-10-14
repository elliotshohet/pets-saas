import 'server-only';
import { cookies } from 'next/headers';
import { isAdmin } from './admin-access';
import { notFound, redirect } from 'next/navigation';
import { emailSessionUser } from './email-access';
import { EMAIL_COOKIE } from './email-cookie';
export async function getUser() {
  return emailSessionUser((await cookies()).get(EMAIL_COOKIE)?.value);
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/sign-in');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!(await isAdmin(user.id))) notFound();
  return user;
}
