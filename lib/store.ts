"use client";

import { useSyncExternalStore } from "react";
import { PROFILES } from "./business";
import { toKey } from "./date";
import { generateSample } from "./sample";
import type { Appointment, BusinessProfile, BusinessType } from "./types";

/**
 * The only data-access module. Today it serves deterministic sample data plus
 * whatever the owner changes in the browser. To show real bookings, replace
 * `loadAppointments` with a fetch of the real list mapped to `Appointment`.
 */

const KEY = "slotline:v1";

interface Persisted {
  type: BusinessType;
  businessName?: string;
  ownerName?: string;
  added: Partial<Record<BusinessType, Appointment[]>>;
  patches: Partial<Record<BusinessType, Record<string, Partial<Appointment>>>>;
}

export interface Snapshot {
  type: BusinessType;
  profile: BusinessProfile;
  businessName: string;
  ownerName: string;
  appointments: Appointment[];
  today: string;
  nowMinutes: number;
  isSample: boolean;
}

const EMPTY: Persisted = { type: "salon", added: {}, patches: {} };

function read(): Persisted {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Persisted;
    return { ...EMPTY, ...parsed, added: parsed.added ?? {}, patches: parsed.patches ?? {} };
  } catch {
    return { ...EMPTY };
  }
}

let memory: Persisted | null = null;

function state(): Persisted {
  if (!memory) memory = read();
  return memory;
}

function write(next: Persisted) {
  memory = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): keep the change in memory for this visit.
  }
  invalidate();
}

let cache: Snapshot | null = null;
const listeners = new Set<() => void>();

function invalidate() {
  cache = null;
  listeners.forEach((l) => l());
}

function loadAppointments(p: Persisted, profile: BusinessProfile, today: string, nowMinutes: number) {
  const base = generateSample(profile, today, nowMinutes);
  const patches = p.patches[p.type] ?? {};
  const all = [...base, ...(p.added[p.type] ?? [])].map((a) => (patches[a.id] ? { ...a, ...patches[a.id] } : a));
  return all.sort((a, b) => (a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date)));
}

function getSnapshot(): Snapshot {
  if (cache) return cache;
  const p = state();
  const now = new Date();
  const today = toKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const profile = PROFILES[p.type];
  cache = {
    type: p.type,
    profile,
    businessName: p.businessName || profile.defaultName,
    ownerName: p.ownerName || "",
    appointments: loadAppointments(p, profile, today, nowMinutes),
    today,
    nowMinutes,
    isSample: true,
  };
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      memory = null;
      invalidate();
    }
  };
  window.addEventListener("storage", onStorage);
  // Refresh "now" once a minute so past/upcoming stays correct.
  const timer = window.setInterval(invalidate, 60_000);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    window.clearInterval(timer);
  };
}

/** Returns null during server rendering; render a placeholder until it is set. */
export function useData(): Snapshot | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export function addAppointment(input: Omit<Appointment, "id" | "createdAt">) {
  const a: Appointment = { ...input, id: `m-${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
  const p = state();
  write({ ...p, added: { ...p.added, [p.type]: [...(p.added[p.type] ?? []), a] } });
}

export function updateAppointment(id: string, patch: Partial<Appointment>) {
  const p = state();
  const current = p.patches[p.type] ?? {};
  write({ ...p, patches: { ...p.patches, [p.type]: { ...current, [id]: { ...current[id], ...patch } } } });
}

export function updateSettings(patch: Partial<Pick<Persisted, "type" | "businessName" | "ownerName">>) {
  write({ ...state(), ...patch });
}

export function resetChanges() {
  const p = state();
  write({ ...p, added: {}, patches: {} });
}
