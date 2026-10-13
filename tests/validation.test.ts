import test from 'node:test';
import assert from 'node:assert/strict';
import { petSchema, recordSchema } from '../lib/validation';
import { today, ageLabel } from '../lib/dates';
const pet = { name: ' Maple ', species: 'Dog', breed: '', birthDate: '', notes: '' };
const record = {
  title: 'Wellness visit',
  category: 'CHECKUP',
  date: '2024-02-29',
  provider: '',
  notes: '',
};
test('trims names and normalizes optional fields', () => {
  const parsed = petSchema.parse(pet);
  assert.equal(parsed.name, 'Maple');
  assert.equal(parsed.birthDate, null);
  assert.equal(parsed.notes, null);
});
test('rejects whitespace names and unsupported species', () => {
  assert.equal(petSchema.safeParse({ ...pet, name: '   ' }).success, false);
  assert.equal(petSchema.safeParse({ ...pet, species: 'unrecognized' }).success, false);
});
test('rejects invalid calendar dates and future birthdays', () => {
  for (const birthDate of ['2023-02-29', '2024-02-30', '2024-13-01', '2999-01-01'])
    assert.equal(petSchema.safeParse({ ...pet, birthDate }).success, false, birthDate);
});
test('accepts leap dates and rejects future record dates', () => {
  assert.equal(recordSchema.safeParse(record).success, true);
  assert.equal(recordSchema.safeParse({ ...record, date: '2999-01-01' }).success, false);
});
test('limits long text and rejects missing required data', () => {
  assert.equal(recordSchema.safeParse({ ...record, title: 'x'.repeat(121) }).success, false);
  assert.equal(recordSchema.safeParse({}).success, false);
});
test('workspace date is stable across UTC midnight', () => {
  assert.equal(today(new Date('2026-10-03T02:00:00Z')), '2026-10-02');
});
test('age changes on the birthday, not January 1', () => {
  assert.equal(ageLabel(new Date('2022-10-04'), '2026-10-03'), '3 years old');
  assert.equal(ageLabel(new Date('2022-10-04'), '2026-10-04'), '4 years old');
});
