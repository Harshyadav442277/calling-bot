/** Date helpers working on local calendar dates as YYYY-MM-DD strings. */

export function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function weekday(key: string) {
  return fromKey(key).getDay();
}

/** Monday of the week containing `key`. */
export function startOfWeek(key: string) {
  const wd = weekday(key);
  return addDays(key, wd === 0 ? -6 : 1 - wd);
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 14:30 -> "2:30 pm" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatHour(h: number) {
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${suffix}`;
}

const fmtLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
const fmtShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const fmtDayName = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const fmtMonth = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export const formatLong = (key: string) => fmtLong.format(fromKey(key));
export const formatShort = (key: string) => fmtShort.format(fromKey(key));
export const dayName = (key: string) => fmtDayName.format(fromKey(key));
export const dayNumber = (key: string) => fromKey(key).getDate();
export const monthLabel = (key: string) => fmtMonth.format(fromKey(key));

export function relativeDay(key: string, today: string) {
  if (key === today) return "Today";
  if (key === addDays(today, 1)) return "Tomorrow";
  if (key === addDays(today, -1)) return "Yesterday";
  return formatShort(key);
}
