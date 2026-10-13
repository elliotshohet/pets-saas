import test from 'node:test';
import assert from 'node:assert/strict';
import { forecastWeekly } from '../lib/forecast';
test('flat pace forecasts 30 days with matching scenario bounds', () => {
  const result = forecastWeekly(Array(8).fill(7))!;
  assert.equal(result.expected, 30);
  assert.equal(result.low, 30);
  assert.equal(result.high, 30);
  assert.equal(result.change, 0);
});
test('recent weights respond to growth without extrapolating runaway growth', () => {
  const result = forecastWeekly([7, 7, 7, 7, 7, 14, 21, 28])!;
  assert.equal(result.expected, 90);
  assert.equal(result.change, 150);
  assert.ok(result.low <= result.expected && result.expected <= result.high);
});
test('insufficient or invalid histories are withheld', () => {
  for (const weeks of [
    [],
    Array(8).fill(0),
    Array(8).fill(1),
    [1, 2, 3, 4, 5, 6, 7, NaN],
    [1, 2, 3, 4, 5, 6, 7, -1],
  ])
    assert.equal(forecastWeekly(weeks), null);
  assert.equal(forecastWeekly([0, 0, 0, 0, 7, 7, 7, 7])!.change, null);
});
