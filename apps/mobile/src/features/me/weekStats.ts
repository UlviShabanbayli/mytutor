/** Days of the week that reached the daily goal. */
export const goalDays = (perDay: number[], goal: number) => perDay.filter((n) => n >= goal).length;

/** The value the chart's full height stands for: room above the goal line and the best day. */
export const chartMax = (perDay: number[], goal: number) => Math.max(goal * 1.5, ...perDay);

const DAY_MS = 24 * 3_600_000;
const BAKU_OFFSET_MS = 4 * 3_600_000;

/** The weekday (Monday = 0) of a day of the world, which counts days in Baku time. */
export const bakuWeekday = (iso: string) =>
  (Math.floor((Date.parse(iso) + BAKU_OFFSET_MS) / DAY_MS) + 3) % 7;
