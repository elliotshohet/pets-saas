import { z } from 'zod';
import { today } from './dates';
export const species = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'] as const;
export const categories = ['CHECKUP', 'VACCINATION', 'MEDICATION', 'PROCEDURE', 'OTHER'] as const;
export const categoryLabels: Record<(typeof categories)[number], string> = {
  CHECKUP: 'Checkup',
  VACCINATION: 'Vaccination',
  MEDICATION: 'Medication',
  PROCEDURE: 'Procedure',
  OTHER: 'Other',
};
const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
  .refine((value) => {
    const date = new Date(value + 'T00:00:00Z');
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      value >= '1900-01-01'
    );
  }, 'Enter a real date on or after 1900.');
const optionalDate = z.union([z.literal(''), calendarDate]).transform((value) => value || null);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);
export const petSchema = z.object({
  name: z.string().trim().min(1, 'Enter a pet name.').max(80),
  species: z.enum(species),
  breed: optionalText(100),
  birthDate: optionalDate.refine(
    (value) => !value || value <= today(),
    'Birth date cannot be in the future.',
  ),
  notes: optionalText(2000),
});
export const recordSchema = z.object({
  title: z.string().trim().min(1, 'Enter a record title.').max(120),
  category: z.enum(categories),
  date: calendarDate.refine((value) => value <= today(), 'Record date cannot be in the future.'),
  provider: optionalText(120),
  notes: optionalText(5000),
});
export type ActionState = {
  success?: string;
  values?: Record<string, string>;
  error?: string;
  fields?: Record<string, string[] | undefined>;
};
export function toDate(value: string | null) {
  return value ? new Date(value + 'T00:00:00Z') : null;
}
