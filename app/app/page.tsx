"use client";

import Link from "next/link";
import { useState } from "react";
import { AppointmentSheet } from "@/components/AppointmentSheet";
import { Icon } from "@/components/icons";
import { Avatar, btn, Card, CardTitle, cx, Skeleton, StatusBadge } from "@/components/ui";
import { capitalise, CURRENCY } from "@/lib/business";
import { addDays, dayName, dayNumber, formatLong, formatTime, fromMinutes, startOfWeek, weekday } from "@/lib/date";
import { active, endTime, freeStarts, onDate, revenue, serviceOf, staffOf } from "@/lib/selectors";
import { useData } from "@/lib/store";
import type { Appointment } from "@/lib/types";

export default function TodayPage() {
  const data = useData();
  const [open, setOpen] = useState<Appointment | null>(null);
  if (!data) return <Skeleton />;

  const { profile, today, nowMinutes } = data;
  const now = fromMinutes(nowMinutes);
  const todays = onDate(data.appointments, today);
  const live = active(todays);
  const done = todays.filter((a) => a.status === "completed").length;
  const upcoming = live.filter((a) => a.status === "confirmed" && endTime(a) > now);
  const next = upcoming[0];
  const cancelled = todays.filter((a) => a.status === "cancelled").length;
  const closed = profile.closedDays.includes(weekday(today));

  const nextFree = profile.staff
    .map((s) => ({ s, t: freeStarts(profile, data.appointments, today, s.id, 30).find((t) => t >= now) }))
    .filter((x) => x.t)
    .sort((a, b) => a.t!.localeCompare(b.t!))[0];

  const weekStart = startOfWeek(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    .filter((d) => !profile.closedDays.includes(weekday(d)))
    .map((d) => ({ d, n: active(onDate(data.appointments, d)).length }));
  const weekMax = Math.max(...week.map((w) => w.n), 1);
  const openMinutes = (profile.close - profile.open) * 60;

  const hour = Math.floor(nowMinutes / 60);
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header className="mb-6">
        <p className="text-muted">{greeting}{data.ownerName ? `, ${data.ownerName}` : ""}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{formatLong(today)}</h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-5 lg:col-span-2">
          {/* Day summary */}
          <section className="aura overflow-hidden rounded-[2rem] p-6 ring-1 ring-line md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-ink/70">Booked for today</p>
                <p className="font-display text-7xl font-semibold leading-none tracking-tight md:text-8xl">{live.length}</p>
                <p className="mt-2 text-sm text-ink/70">
                  {closed ? "You're closed today." : `${done} done, ${upcoming.length} still to come${cancelled ? `, ${cancelled} cancelled` : ""}`}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:min-w-72">
                <div className="rounded-2xl bg-white/70 p-4 backdrop-blur">
                  <dt className="text-ink/60">Next free slot</dt>
                  <dd className="mt-1 font-display text-xl font-semibold">{nextFree ? formatTime(nextFree.t!) : "Full"}</dd>
                  {nextFree && <dd className="truncate text-xs text-ink/60">{nextFree.s.name}</dd>}
                </div>
                <div className="rounded-2xl bg-white/70 p-4 backdrop-blur">
                  <dt className="text-ink/60">Expected fees</dt>
                  <dd className="tabular mt-1 font-display text-xl font-semibold">{CURRENCY.format(revenue(profile, live.filter((a) => a.status !== "no-show")))}</dd>
                  <dd className="text-xs text-ink/60">from today&apos;s bookings</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Next appointment */}
          {next && (
            <section className="rounded-[2rem] bg-ink p-5 text-white md:p-6" aria-label="Next appointment">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={next.clientName} />
                  <div className="min-w-0">
                    <p className="text-xs text-white/60">{next.start <= now ? "With you now" : "Next up"}</p>
                    <p className="truncate font-semibold">{next.clientName}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(next)} className="h-9 shrink-0 rounded-full px-4 text-sm font-medium ring-1 ring-white/25 hover:bg-white/10">
                  View details
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                <span className="inline-flex items-center gap-2"><Icon name="clock" size={16} />{formatTime(next.start)} to {formatTime(endTime(next))}</span>
                <span>{serviceOf(profile, next.serviceId)?.name}</span>
                <span>with {staffOf(profile, next.staffId)?.name}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={`tel:${next.phone.replace(/\s/g, "")}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white/12 text-sm font-semibold hover:bg-white/20">
                  <Icon name="phone" size={16} /> Call
                </a>
                <button onClick={() => setOpen(next)} className="pill-gradient inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold text-ink">
                  Open booking
                </button>
              </div>
            </section>
          )}

          {/* Timeline */}
          <Card>
            <CardTitle action={<Link href="/app/schedule" className="text-sm font-medium text-muted hover:text-ink">Full day sheet</Link>}>
              Today&apos;s appointments
            </CardTitle>
            {todays.length === 0 ? (
              <div className="rounded-2xl bg-paper p-8 text-center">
                <p className="font-medium">No appointments today.</p>
                <p className="mt-1 text-sm text-muted">New bookings from your phone line will show up here.</p>
                <Link href="/app/new" className={cx(btn.primary, "mt-4")}>Add a booking</Link>
              </div>
            ) : (
              <ol className="-mx-2">
                {todays.map((a, i) => {
                  const showNow = !closed && a.start > now && (i === 0 || todays[i - 1].start <= now);
                  return (
                    <li key={a.id}>
                      {showNow && (
                        <div className="my-1 flex items-center gap-2 px-2 text-xs font-semibold text-lilac-deep">
                          <span className="tabular w-16 shrink-0">{formatTime(now)}</span>
                          <span className="h-px flex-1 bg-lilac-deep/40" />
                          Now
                        </div>
                      )}
                      <button
                        onClick={() => setOpen(a)}
                        className={cx(
                          "flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left hover:bg-paper",
                          a.status === "cancelled" && "opacity-55",
                        )}
                      >
                        <span className="tabular w-16 shrink-0 text-sm font-semibold">{formatTime(a.start)}</span>
                        <Avatar name={a.clientName} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{a.clientName}</span>
                          <span className="block truncate text-sm text-muted">
                            {serviceOf(profile, a.serviceId)?.name}, {staffOf(profile, a.staffId)?.name}
                          </span>
                        </span>
                        <span className="hidden sm:block"><StatusBadge status={a.status} /></span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle action={<Link href="/app/week" className="text-sm font-medium text-muted hover:text-ink">Week view</Link>}>
              This week
            </CardTitle>
            <ul className="flex h-40 items-end justify-between gap-2" aria-label="Bookings per day this week">
              {week.map((w) => (
                <li key={w.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="tabular text-xs font-semibold">{w.n}</span>
                  <span
                    className={cx("w-full max-w-9 rounded-xl", w.d === today ? "bg-ink" : w.d < today ? "bg-lilac" : "bg-lilac-soft ring-1 ring-inset ring-lilac")}
                    style={{ height: `${Math.max((w.n / weekMax) * 100, 4)}%` }}
                  />
                  <span className={cx("text-xs", w.d === today ? "font-semibold" : "text-muted")}>{dayName(w.d)} {dayNumber(w.d)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle>Today by {profile.staffRole.toLowerCase()}</CardTitle>
            <ul className="space-y-4">
              {profile.staff.map((s) => {
                const mine = live.filter((a) => a.staffId === s.id);
                const mins = mine.reduce((m, a) => m + a.duration, 0);
                const pct = Math.round((mins / openMinutes) * 100);
                return (
                  <li key={s.id}>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted">{mine.length} {mine.length === 1 ? profile.client : profile.clients}, {pct}% of hours booked</p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-paper">
                      <div className="h-2 rounded-full bg-ink" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="bg-lime-soft ring-0">
            <p className="text-sm font-medium">{capitalise(profile.clients)} booked by phone today</p>
            <p className="font-display mt-1 text-4xl font-semibold">{live.filter((a) => a.source === "phone").length}</p>
            <p className="mt-1 text-sm text-muted">of {live.length} on today&apos;s list</p>
          </Card>
        </div>
      </div>

      <AppointmentSheet appt={open} data={data} onClose={() => setOpen(null)} />
    </>
  );
}
