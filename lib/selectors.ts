import { toMinutes, fromMinutes } from "./date";
import type { Appointment, BusinessProfile } from "./types";

export function serviceOf(p: BusinessProfile, id: string) {
  return p.catalogue.find((s) => s.id === id);
}

export function staffOf(p: BusinessProfile, id: string) {
  return p.staff.find((s) => s.id === id);
}

export function onDate(list: Appointment[], date: string) {
  return list.filter((a) => a.date === date);
}

/** Appointments that still hold a place in the book. */
export function active(list: Appointment[]) {
  return list.filter((a) => a.status !== "cancelled");
}

export function endTime(a: Appointment) {
  return fromMinutes(toMinutes(a.start) + a.duration);
}

export function revenue(p: BusinessProfile, list: Appointment[]) {
  return list.reduce((sum, a) => sum + (serviceOf(p, a.serviceId)?.price ?? 0), 0);
}

/** Free start times for a staff member on a date, at 15-minute steps. */
export function freeStarts(p: BusinessProfile, list: Appointment[], date: string, staffId: string, duration: number, ignoreId?: string) {
  const taken = active(onDate(list, date)).filter((a) => a.staffId === staffId && a.id !== ignoreId);
  const out: string[] = [];
  for (let t = p.open * 60; t + duration <= p.close * 60; t += 15) {
    const clash = taken.some((a) => {
      const s = toMinutes(a.start);
      return t < s + a.duration && s < t + duration;
    });
    if (!clash) out.push(fromMinutes(t));
  }
  return out;
}
