'use server';
import { requireUser } from '@/lib/session';
import { careOperation } from '@/lib/care';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
export async function careAction(
  petId: string,
  operation: string,
  _state: { error?: string; success?: string },
  form: FormData,
): Promise<{ error?: string; success?: string }> {
  const user = await requireUser();
  try {
    await careOperation(user.id, petId, operation, form);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      return { error: 'This pet, record or care item is unavailable.' };
    return {
      error:
        error instanceof Error &&
        /^(Choose |Use |Unsupported |Select |Limit |Enter |Confirm )/.test(error.message)
          ? error.message
          : 'Check the dates, required fields and input limits.',
    };
  }
  revalidatePath('/', 'layout');
  return { success: 'Saved.' };
}
