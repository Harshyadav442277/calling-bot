"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { DateStrip } from "@/components/DateStrip";
import { Icon } from "@/components/icons";
import { btn, Card, cx, PageHeader, Skeleton } from "@/components/ui";
import { capitalise, CURRENCY, servicesFor } from "@/lib/business";
import { formatLong, formatTime, fromMinutes, weekday } from "@/lib/date";
import { freeStarts } from "@/lib/selectors";
import { addAppointment, useData } from "@/lib/store";

const field =
  "h-12 w-full rounded-2xl bg-paper px-4 text-sm outline-none ring-1 ring-transparent placeholder:text-faint focus:bg-surface focus:ring-2 focus:ring-lilac-deep";

function initialFromUrl() {
  if (typeof window === "undefined") return { date: null, time: null };
  const sp = new URLSearchParams(window.location.search);
  const date = sp.get("date");
  const time = sp.get("time");
  return {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    time: time && /^\d{2}:\d{2}$/.test(time) ? time : null,
  };
}

export default function NewBookingPage() {
  const data = useData();
  const [init] = useState(initialFromUrl);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(init.date);
  const [time, setTime] = useState<string | null>(init.time);
  const [notes, setNotes] = useState("");
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState<{ name: string; date: string; time: string } | null>(null);
  if (!data) return <Skeleton />;

  const { profile } = data;
  const day = date ?? data.today;
  const service = profile.catalogue.find((s) => s.id === serviceId);
  const staffChoices = service ? profile.staff.filter((s) => servicesFor(profile, s.id).some((x) => x.id === service.id)) : profile.staff;
  const staff = staffChoices.find((s) => s.id === staffId) ?? null;
  const closed = profile.closedDays.includes(weekday(day));
  const nowHHMM = fromMinutes(data.nowMinutes);

  // A time is free if the chosen staff member (or anyone, when none chosen) is free.
  const duration = service?.duration ?? 30;
  const freeBy = new Map<string, string[]>();
  for (const s of staffChoices) freeBy.set(s.id, freeStarts(profile, data.appointments, day, s.id, duration));
  const grid: string[] = [];
  for (let t = profile.open * 60; t + duration <= profile.close * 60; t += 30) grid.push(fromMinutes(t));
  const isFree = (t: string) => {
    if (closed || (day === data.today && t <= nowHHMM)) return false;
    const ids = staff ? [staff.id] : staffChoices.map((s) => s.id);
    return ids.some((id) => freeBy.get(id)?.includes(t));
  };
  const groups = [
    { label: "Morning", items: grid.filter((t) => t < "12:00") },
    { label: "Afternoon", items: grid.filter((t) => t >= "12:00" && t < "16:00") },
    { label: "Evening", items: grid.filter((t) => t >= "16:00") },
  ].filter((g) => g.items.length);

  const phoneDigits = phone.replace(/\D/g, "");
  const errors = {
    name: !name.trim() ? `Enter the ${profile.client}'s name.` : "",
    phone: phoneDigits.length < 10 ? "Enter a phone number with at least 10 digits." : "",
    service: !service ? `Choose a ${profile.service}.` : "",
    time: !time || !isFree(time) ? "Choose a free time." : "",
  };
  const valid = !errors.name && !errors.phone && !errors.service && !errors.time;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid || !service || !time) return;
    const assigned = staff ?? staffChoices.find((s) => freeBy.get(s.id)?.includes(time))!;
    addAppointment({
      clientName: name.trim(),
      phone: phone.trim(),
      serviceId: service.id,
      staffId: assigned.id,
      date: day,
      start: time,
      duration: service.duration,
      status: "confirmed",
      source: "manual",
      notes: notes.trim() || undefined,
    });
    setSaved({ name: name.trim(), date: day, time });
  };

  if (saved) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="aura rounded-[2rem] p-8 text-center ring-1 ring-line">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ink text-white"><Icon name="check" size={26} /></span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">Booking added</h1>
          <p className="mt-2 text-ink/70">
            {saved.name}, {formatLong(saved.date)} at {formatTime(saved.time)}.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/app/schedule" className={btn.primary}>Open day sheet</Link>
            <button
              className={btn.secondary}
              onClick={() => {
                setSaved(null); setName(""); setPhone(""); setNotes(""); setTime(null); setTried(false);
              }}
            >
              Add another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const err = (k: keyof typeof errors) => tried && errors[k] ? <p className="mt-1.5 text-sm text-warn">{errors[k]}</p> : null;

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader title="New booking" sub={`For walk-ins and ${profile.clients} who book in person.`} />

      <div className="grid gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold">{capitalise(profile.client)}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Full name</span>
                <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="Priya Sharma" />
                {err("name")}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Phone</span>
                <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="off" placeholder="+91 98765 43210" />
                {err("phone")}
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold">{capitalise(profile.service)}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {profile.catalogue.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => { setServiceId(s.id); setStaffId(null); setTime(null); }}
                  aria-pressed={serviceId === s.id}
                  className={cx(
                    "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1",
                    serviceId === s.id ? "bg-lilac-soft ring-lilac-deep" : "bg-surface ring-line hover:ring-faint",
                  )}
                >
                  <span>
                    <span className="block font-medium">{s.name}</span>
                    <span className="text-xs text-muted">{s.duration} min</span>
                  </span>
                  <span className="tabular text-sm font-semibold">{CURRENCY.format(s.price)}</span>
                </button>
              ))}
            </div>
            {err("service")}

            <h3 className="mt-6 mb-3 text-sm font-medium">{profile.staffRole}</h3>
            <div className="flex flex-wrap gap-2">
              {[{ id: null as string | null, name: "Anyone free" }, ...staffChoices].map((s) => (
                <button
                  type="button"
                  key={s.id ?? "any"}
                  onClick={() => { setStaffId(s.id); setTime(null); }}
                  aria-pressed={staffId === s.id}
                  className={cx(
                    "h-10 rounded-full px-4 text-sm font-medium ring-1",
                    staffId === s.id ? "bg-ink text-white ring-ink" : "bg-surface ring-line hover:ring-faint",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold">Date and time</h2>
            <DateStrip data={data} value={day} onChange={(d) => { setDate(d); setTime(null); }} start={data.today} days={14} showNav={false} />
            <div className="mt-5 space-y-4">
              {closed ? (
                <p className="rounded-2xl bg-paper p-4 text-sm text-muted">Closed on this day. Pick another date.</p>
              ) : (
                groups.map((g) => (
                  <div key={g.label}>
                    <p className="mb-2 text-sm text-muted">{g.label}</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {g.items.map((t) => {
                        const free = isFree(t);
                        return (
                          <button
                            type="button"
                            key={t}
                            disabled={!free}
                            onClick={() => setTime(t)}
                            aria-pressed={time === t}
                            className={cx(
                              "tabular h-11 rounded-full text-sm font-medium ring-1",
                              time === t ? "pill-gradient ring-ink/20" : free ? "bg-surface ring-line hover:ring-faint" : "text-faint line-through ring-transparent",
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            {err("time")}

            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm font-medium">Notes <span className="font-normal text-muted">(optional)</span></span>
              <textarea className={cx(field, "h-24! py-3")} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the team should know" />
            </label>
          </Card>
        </div>

        {/* Summary: sticky card on laptop, sticky bar on phone */}
        <aside className="hidden lg:block">
          <Card className="sticky top-10">
            <h2 className="mb-4 font-display text-lg font-semibold">Summary</h2>
            <dl className="space-y-3 text-sm">
              <Line label={capitalise(profile.client)} value={name.trim() || "Not set"} />
              <Line label={capitalise(profile.service)} value={service?.name ?? "Not set"} />
              <Line label={profile.staffRole} value={staff?.name ?? "Anyone free"} />
              <Line label="When" value={time ? `${formatLong(day)}, ${formatTime(time)}` : "Not set"} />
            </dl>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-muted">Fee, paid at visit</span>
              <span className="tabular font-display text-2xl font-semibold">{service ? CURRENCY.format(service.price) : "—"}</span>
            </div>
            <button type="submit" className={cx(btn.primary, "mt-5 w-full")}>Book appointment</button>
          </Card>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-ink p-1.5 pl-5 text-white shadow-[0_12px_32px_-12px_rgba(24,24,31,0.55)]">
          <span className={cx("min-w-0 truncate text-sm font-medium", tried && !valid && "text-peach")} role={tried && !valid ? "alert" : undefined}>
            {tried && !valid ? "Some details are missing above" : time ? `${formatTime(time)}, ${service?.name ?? ""}` : "Book appointment"}
          </span>
          <button type="submit" className="pill-gradient h-11 shrink-0 rounded-full px-5 text-sm font-semibold text-ink">
            {service ? `Book ${CURRENCY.format(service.price)}` : "Book"}
          </button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </form>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
