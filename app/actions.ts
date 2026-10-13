'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import * as mutations from '@/lib/mutations';
import type { ActionState } from '@/lib/validation';
function failure(error: unknown): ActionState {
  if (error instanceof ZodError)
    return { error: 'Please check the highlighted fields.', fields: error.flatten().fieldErrors };
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ['P2025', 'P2003'].includes(error.code)
  )
    return { error: 'This pet or record no longer exists. Go back and refresh the page.' };
  console.error('Pet workspace mutation failed', error);
  return { error: 'We could not save your changes. Please try again.' };
}
function formValues(form: FormData): Record<string, string> {
  return Object.fromEntries(
    [...form].filter(([key, value]) => !key.startsWith('$ACTION_') && typeof value === 'string'),
  ) as Record<string, string>;
}
function refresh() {
  revalidatePath('/', 'layout');
}
export async function savePetAction(
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  let saved;
  try {
    saved = await mutations.savePet(id, Object.fromEntries(form));
  } catch (error) {
    return { ...failure(error), values: formValues(form) };
  }
  refresh();
  redirect(`/pets/${saved.id}?notice=${id ? 'updated' : 'created'}`);
}
export async function saveRecordAction(
  petId: string,
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    await mutations.saveRecord(petId, id, Object.fromEntries(form));
  } catch (error) {
    return { ...failure(error), values: formValues(form) };
  }
  refresh();
  redirect(`/pets/${petId}?notice=record-saved`);
}
export async function deletePetAction(
  id: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (form.get('confirm') !== 'yes') return { error: 'Please confirm deletion.' };
  try {
    await mutations.deletePet(id);
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect('/pets?notice=deleted');
}
export async function deleteRecordAction(
  petId: string,
  id: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (form.get('confirm') !== 'yes') return { error: 'Please confirm deletion.' };
  try {
    await mutations.deleteRecord(petId, id);
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/pets/${petId}?notice=record-deleted`);
}
