import { servicesFor } from "./business";
import { addDays, fromMinutes, weekday } from "./date";
import type { Appointment, AppointmentStatus, BusinessProfile } from "./types";

/**
 * Deterministic sample appointments, generated relative to today so the app
 * always has a believable past and future. Every number on every screen is
 * computed from this list, so the views can never disagree.
 * Replace with real data in lib/store.ts.
 */

const FIRST = [
  "Aarav", "Priya", "Rohan", "Ananya", "Kabir", "Meghna", "Ishaan", "Diya", "Arjun", "Sara",
  "Vikram", "Neha", "Rahul", "Tanvi", "Aditya", "Kavya", "Nikhil", "Pooja", "Siddharth", "Riya",
  "Farhan", "Zoya", "Dev", "Aisha", "Karan", "Simran", "Yash", "Nandini", "Manav", "Ira",
];
const LAST = [
  "Sharma", "Iyer", "Mehta", "Kapoor", "Reddy", "Nair", "Khan", "Gupta", "Das", "Joshi",
  "Singh", "Rao", "Fernandes", "Bose", "Pillai", "Malhotra", "Chatterjee", "Desai",
];
const NOTES = {
  salon: ["First visit", "Bring reference photo", "Prefers a quiet chair", "Patch test done last visit", "Prefers an evening slot"],
  clinic: ["First visit", "Bring previous reports", "Requested morning slot", "Needs wheelchair access", "Called to confirm the time"],
};

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

const WEEKDAY_LOAD = [0, 0.4, 0.36, 0.4, 0.44, 0.5, 0.64];

function hourWeight(type: BusinessProfile["type"], hour: number) {
  if (type === "clinic") {
    if (hour === 13) return 0; // lunch
    if (hour >= 10 && hour <= 11) return 1.25;
    if (hour === 17) return 1.15;
    return 0.85;
  }
  if (hour >= 11 && hour <= 12) return 1.2;
  if (hour >= 16 && hour <= 18) return 1.3;
  if (hour === 9) return 0.6;
  return 0.9;
}

export function generateSample(
  profile: BusinessProfile,
  today: string,
  nowMinutes: number,
  // Two full 60-day windows, so the longest analytics range has a real comparison period.
  daysBack = 125,
  daysForward = 21,
): Appointment[] {
  const out: Appointment[] = [];
  const notes = NOTES[profile.type];

  for (let offset = -daysBack; offset <= daysForward; offset++) {
    const date = addDays(today, offset);
    const wd = weekday(date);
    if (profile.closedDays.includes(wd)) continue;

    const r = rng(hash(`${profile.type}:${date}`));
    // Future days fill up as the date gets closer.
    const fill = offset <= 0 ? 1 : Math.max(0.15, 0.85 - offset * 0.07);

    for (const staff of profile.staff) {
      const services = servicesFor(profile, staff.id);
      let t = profile.open * 60;
      while (t < profile.close * 60) {
        const hour = Math.floor(t / 60);
        const p = WEEKDAY_LOAD[wd] * hourWeight(profile.type, hour) * fill;
        if (r() < p) {
          const service = pick(r, services);
          if (t + service.duration > profile.close * 60) {
            t += 15;
            continue;
          }
          const start = fromMinutes(t);
          const end = t + service.duration;
          const roll = r();
          let status: AppointmentStatus = "confirmed";
          const isPast = offset < 0 || (offset === 0 && end <= nowMinutes);
          if (isPast) status = roll < 0.07 ? "cancelled" : roll < 0.12 ? "no-show" : "completed";
          else if (roll < 0.04) status = "cancelled";

          const first = pick(r, FIRST);
          const last = pick(r, LAST);
          const phone = `+91 9${String(Math.floor(r() * 9000) + 1000)}${Math.floor(r() * 10)} ${String(Math.floor(r() * 90000) + 10000)}`;
          // Never booked in the future: lead time reaches back to today or earlier.
          const leadDays = Math.max(offset, 0) + 1 + Math.floor(r() * 8);
          const created = new Date(`${addDays(date, -leadDays)}T00:00:00`);
          created.setHours(9 + Math.floor(r() * 10), Math.floor(r() * 60));

          out.push({
            id: `${profile.type}-${date}-${staff.id}-${start.replace(":", "")}`,
            clientName: `${first} ${last}`,
            phone,
            serviceId: service.id,
            staffId: staff.id,
            date,
            start,
            duration: service.duration,
            status,
            source: r() < 0.78 ? "phone" : "manual",
            notes: r() < 0.12 ? pick(r, notes) : undefined,
            createdAt: created.toISOString(),
          });
          t = end + (r() < 0.5 ? 0 : 15);
        } else {
          t += 15;
        }
      }
    }
  }
  return out;
}
