// Dates for a plan. A plan starts on its shop day (day 0) and runs 7 days.

const DAY = 86400000;
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };

// The most recent `weekday` (0 Sunday … 6 Saturday) on or before `today`.
export function lastWeekday(weekday, today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setDate(d.getDate() - ((d.getDay() - weekday + 7) % 7));
  return iso(d);
}

// Which day of the plan today is: 0-6, or a number outside that range before or after it.
export function dayIndex(start, today = new Date()) {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((t - parse(start)) / DAY);
}

export const shortDay = (start, i) => SHORT[parse(addDays(start, i)).getDay()];
export const longDay = (start, i) => LONG[parse(addDays(start, i)).getDay()];
export function longDate(start, i) {
  const d = parse(addDays(start, i));
  return `${LONG[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
export function shortDate(start, i) {
  const d = parse(addDays(start, i));
  return `${SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}
// "Monday 2 November - Sunday 8 November 2026"
export function range(start) {
  const end = parse(addDays(start, 6));
  return `${longDate(start, 0)} - ${longDate(start, 6)} ${end.getFullYear()}`;
}
