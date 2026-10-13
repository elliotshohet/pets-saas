// Calendar dates are stored as PostgreSQL DATE and serialized as YYYY-MM-DD.
// A fixed workspace timezone prevents server/browser timezone disagreements.
export const WORKSPACE_TIMEZONE = 'America/Los_Angeles';
export function today(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WORKSPACE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function dateKey(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : '';
}
export function displayDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date + 'T00:00:00Z') : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}
export function ageLabel(birth: Date | null, currentDay = today()): string {
  if (!birth) return 'Age not recorded';
  const dob = dateKey(birth);
  let years = Number(currentDay.slice(0, 4)) - Number(dob.slice(0, 4));
  if (currentDay.slice(5) < dob.slice(5)) years--;
  return years < 1 ? 'Under 1 year' : `${years} ${years === 1 ? 'year' : 'years'} old`;
}
