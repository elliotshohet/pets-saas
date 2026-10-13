import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarFile } from '../lib/calendar';
import { taskStatus } from '../lib/care';
test('calendar escapes user text, folds UTF-8 lines and emits explicit recurring all-day dates', () => {
  const data = calendarFile([
    {
      id: 'test',
      title: 'Dose;\nInjected, text ' + 'é'.repeat(100),
      instructions: null,
      dueDate: new Date('2026-10-13'),
      intervalDays: 7,
    },
  ]);
  assert.match(data, /DTSTART;VALUE=DATE:20261013/);
  assert.match(data, /DTEND;VALUE=DATE:20261014/);
  assert.match(data, /RRULE:FREQ=DAILY;INTERVAL=7/);
  assert.match(data, /Dose\\;\\nInjected\\, text/);
  for (const line of data.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
});
test('reminder statuses use the selected timezone and completion state', () => {
  const task = {
    dueDate: new Date('2026-10-13'),
    timezone: 'America/Los_Angeles',
    completedAt: null,
  };
  assert.equal(taskStatus(task, new Date('2026-10-13T01:00:00Z')), 'Upcoming');
  assert.equal(taskStatus(task, new Date('2026-10-13T12:00:00Z')), 'Due today');
  assert.equal(taskStatus(task, new Date('2026-10-14T12:00:00Z')), 'Overdue');
  assert.equal(taskStatus({ ...task, completedAt: new Date() }, new Date()), 'Completed');
});
