import test from 'node:test';
import assert from 'node:assert/strict';
import { daysUntilBirthday } from '../lib/dates';
const birthday = (date: string) => new Date(date + 'T00:00:00Z');
test('birthday countdown handles today, tomorrow, and year rollover', () => {
  assert.equal(daysUntilBirthday(null, '2026-10-13'), null);
  assert.equal(daysUntilBirthday(birthday('2020-10-13'), '2026-10-13'), 0);
  assert.equal(daysUntilBirthday(birthday('2020-10-14'), '2026-10-13'), 1);
  assert.equal(daysUntilBirthday(birthday('2020-01-01'), '2026-12-31'), 1);
  assert.equal(daysUntilBirthday(birthday('2020-10-31'), '2026-10-13'), 18);
});
test('leap-day birthdays use February 28 in non-leap years', () => {
  assert.equal(daysUntilBirthday(birthday('2020-02-29'), '2027-02-28'), 0);
  assert.equal(daysUntilBirthday(birthday('2020-02-29'), '2028-02-28'), 1);
});
