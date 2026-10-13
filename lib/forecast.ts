export type Forecast = {
  expected: number;
  low: number;
  high: number;
  recent: number;
  previous: number;
  change: number | null;
};
// Eight complete UTC weeks. Recent weeks receive more weight; scenarios are not confidence bounds.
export function forecastWeekly(weeks: number[]): Forecast | null {
  if (weeks.length !== 8 || weeks.some((value) => !Number.isFinite(value) || value < 0))
    return null;
  if (weeks.reduce((sum, value) => sum + value, 0) < 20) return null;
  const recent = weeks.slice(4).reduce((sum, value) => sum + value, 0);
  const previous = weeks.slice(0, 4).reduce((sum, value) => sum + value, 0);
  const weighted = weeks.slice(4).reduce((sum, value, index) => sum + value * (index + 1), 0) / 10;
  return {
    expected: Math.round((weighted * 30) / 7),
    low: Math.floor((Math.min(...weeks) * 30) / 7),
    high: Math.ceil((Math.max(...weeks) * 30) / 7),
    recent,
    previous,
    change: previous ? Math.round(((recent - previous) / previous) * 100) : null,
  };
}
