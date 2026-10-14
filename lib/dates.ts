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

export function daysUntilBirthday(birth: Date | null, currentDay = today()): number | null {
  if (!birth) return null;
  const dob = dateKey(birth);
  const current = new Date(currentDay + 'T00:00:00Z');
  const month = Number(dob.slice(5, 7)) - 1;
  const day = Number(dob.slice(8, 10));
  const anniversary = (year: number) => {
    // February 29 birthdays fall on February 28 in non-leap years.
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
  };
  let next = anniversary(current.getUTCFullYear());
  if (next < current) next = anniversary(current.getUTCFullYear() + 1);
  return Math.round((next.getTime() - current.getTime()) / 86400000);
}
