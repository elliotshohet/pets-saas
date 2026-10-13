'use server';
import { requireAdmin } from '@/lib/session';
import { mutateAdminAccount, type AdminOperation } from '@/lib/admin-mutations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import type { ActionState } from '@/lib/validation';
export async function adminAccountAction(
  alias: string,
  operation: AdminOperation,
  petId: string | null,
  recordId: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!['pet.save', 'pet.delete', 'record.save', 'record.delete'].includes(operation))
    return { error: 'Invalid operation.' };
  if (operation.endsWith('delete') && form.get('confirm') !== 'yes')
    return { error: 'Please confirm deletion.' };
  try {
    await mutateAdminAccount(admin.id, alias, operation, petId, recordId, Object.fromEntries(form));
  } catch (error) {
    if (error instanceof ZodError)
      return {
        error: 'Please check the highlighted fields.',
        fields: error.flatten().fieldErrors,
        values: Object.fromEntries(
          [...form].filter(
            ([key, value]) =>
              [
                'name',
                'species',
                'breed',
                'birthDate',
                'notes',
                'title',
                'category',
                'date',
                'provider',
              ].includes(key) && typeof value === 'string',
          ),
        ) as Record<string, string>,
      };
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2025', 'P2003'].includes(error.code)
    )
      return { error: 'This account, pet or record no longer exists.' };
    console.error('Administrator account mutation failed');
    return { error: 'Unable to save changes. Please try again.' };
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/accounts/${alias}`);
}
