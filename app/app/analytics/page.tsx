"use client";

import { useState } from "react";
import { DailyBars, type DayPoint } from "@/components/DailyBars";
import { Card, CardTitle, cx, PageHeader, Skeleton } from "@/components/ui";
import { capitalise, CURRENCY } from "@/lib/business";
import { addDays, dayName, dayNumber, formatHour, formatShort, toMinutes, weekday } from "@/lib/date";
import { revenue, serviceOf } from "@/lib/selectors";
import { useData } from "@/lib/store";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
];

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];
const WD_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Single-hue sequential ramp from lilac-soft to lilac-deep. */
function ramp(t: number) {
  const a = [0xef, 0xeb, 0xfd];
  const b = [0x5b, 0x4b, 0xc4];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export default function AnalyticsPage() {
  const data = useData();
  const [range, setRange] = useState(30);
  if (!data) return <Skeleton />;

  const { profile, today } = data;
  const from = addDays(today, -(range - 1));
  // Past and today only: analytics describe what has happened.
  const inRange = data.appointments.filter((a) => a.date >= from && a.date <= today);
  const prevFrom = addDays(from, -range);
  const prev = data.appointments.filter((a) => a.date >= prevFrom && a.date < from);

  const held = inRange.filter((a) => a.status !== "cancelled");
  const completed = inRange.filter((a) => a.status === "completed");
  const noShows = inRange.filter((a) => a.status === "no-show");
  const cancelled = inRange.filter((a) => a.status === "cancelled");
  const finished = completed.length + noShows.length;
  const byPhone = held.filter((a) => a.source === "phone").length;
  const prevHeld = prev.filter((a) => a.status !== "cancelled").length;
  const change = prevHeld ? Math.round(((held.length - prevHeld) / prevHeld) * 100) : 0;

  const points: DayPoint[] = [];
  for (let d = from; d <= today; d = addDays(d, 1)) {
    if (profile.closedDays.includes(weekday(d))) continue;
    points.push({
      date: d,
      label: range <= 7 ? dayName(d) : `${dayNumber(d)}`,
      full: formatShort(d),
      bookings: held.filter((a) => a.date === d).length,
    });
  }

  // Heatmap: average bookings per weekday and hour.
  const hours = Array.from({ length: profile.close - profile.open }, (_, i) => profile.open + i);
  const openDays = WEEKDAYS.filter((w) => !profile.closedDays.includes(w));
  const dayCount = (w: number) => points.filter((p) => weekday(p.date) === w).length || 1;
  const cell = (w: number, h: number) =>
    held.filter((a) => weekday(a.date) === w && Math.floor(toMinutes(a.start) / 60) === h).length / dayCount(w);
  const heat = openDays.map((w) => hours.map((h) => cell(w, h)));
  const heatMax = Math.max(...heat.flat(), 0.01);
  let peak = { w: openDays[0], h: hours[0], v: 0 };
  heat.forEach((row, i) => row.forEach((v, j) => { if (v > peak.v) peak = { w: openDays[i], h: hours[j], v }; }));

  const services = profile.catalogue
    .map((s) => ({ s, n: held.filter((a) => a.serviceId === s.id).length }))
    .sort((a, b) => b.n - a.n);
  const serviceMax = Math.max(...services.map((x) => x.n), 1);

  const staff = profile.staff.map((s) => {
    const mine = held.filter((a) => a.staffId === s.id);
    return { s, n: mine.length, fees: revenue(profile, mine.filter((a) => a.status === "completed")) };
  });
  const staffMax = Math.max(...staff.map((x) => x.n), 1);

  const outcomes = [
    { label: "Completed", n: completed.length, cls: "bg-ok" },
    { label: "No-show", n: noShows.length, cls: "bg-warn" },
    { label: "Cancelled", n: cancelled.length, cls: "bg-faint" },
  ];
  // Today's still-upcoming bookings have no outcome yet.
  const outcomeTotal = completed.length + noShows.length + cancelled.length;

  return (
    <>
      <PageHeader
        title="Analytics"
        sub={`${formatShort(from)} to ${formatShort(today)}. Sample data.`}
        actions={
          <div className="inline-flex rounded-full bg-surface p-1 ring-1 ring-line" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                aria-pressed={range === r.days}
                className={cx("rounded-full px-4 py-1.5 text-sm font-medium", range === r.days ? "bg-ink text-white" : "text-muted hover:text-ink")}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <section className="aura col-span-2 rounded-3xl p-5 ring-1 ring-line lg:col-span-1">
          <p className="text-sm font-medium text-ink/70">Appointments</p>
          <p className="tabular font-display text-5xl font-semibold tracking-tight">{held.length}</p>
          <p className="mt-1 text-sm text-ink/70">
            {!prevHeld
              ? "No earlier period to compare"
              : change === 0
                ? `Same as the ${range} days before`
                : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% on the ${range} days before`}
          </p>
        </section>
        <Stat label="Fees from completed" value={CURRENCY.format(revenue(profile, completed))} note={`${completed.length} completed`} />
        <Stat label="No-show rate" value={`${pct(noShows.length, finished)}%`} note={`${noShows.length} of ${finished} past visits`} />
        <Stat className="col-span-2 lg:col-span-1" label="Booked by phone" value={`${pct(byPhone, held.length)}%`} note={`${byPhone} of ${held.length} appointments`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <Card className="lg:col-span-2">
          <CardTitle>Appointments per day</CardTitle>
          <DailyBars points={points} />
        </Card>

        <Card>
          <CardTitle>How appointments ended</CardTitle>
          <ul className="space-y-4">
            {outcomes.map((o) => (
              <li key={o.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{o.label}</span>
                  <span className="tabular text-muted"><span className="font-semibold text-ink">{pct(o.n, outcomeTotal)}%</span> ({o.n})</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-paper">
                  <div className={cx("h-2 rounded-full", o.cls)} style={{ width: `${pct(o.n, outcomeTotal)}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">Out of {outcomeTotal} bookings that have ended or were cancelled in this period.</p>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Busiest times</CardTitle>
          <p className="-mt-2 mb-4 text-sm text-muted">
            Average appointments starting in each hour. Busiest: {WD_LABEL[peak.w]} at {formatHour(peak.h)}.
          </p>
          <div className="scrollbar-none overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="w-10" />
                  {hours.map((h) => (
                    <th key={h} scope="col" className="tabular pb-1 text-center font-medium text-muted">{formatHour(h).replace(" ", "")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {openDays.map((w, i) => (
                  <tr key={w}>
                    <th scope="row" className="pr-1 text-left font-medium text-muted">{WD_LABEL[w]}</th>
                    {heat[i].map((v, j) => {
                      const t = v / heatMax;
                      return (
                        <td
                          key={j}
                          title={`${WD_LABEL[w]} ${formatHour(hours[j])}: ${v.toFixed(1)} on average`}
                          className={cx("tabular h-9 rounded-lg text-center font-medium", t > 0.55 ? "text-white" : "text-ink")}
                          style={{ background: v === 0 ? "#f4f3f8" : ramp(0.08 + t * 0.92) }}
                        >
                          {v === 0 ? "" : v.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle>By {profile.staffRole.toLowerCase()}</CardTitle>
          <ul className="space-y-4">
            {staff.map((x) => (
              <li key={x.s.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{x.s.name}</span>
                  <span className="tabular shrink-0 font-semibold">{x.n}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-paper">
                  <div className="h-2 rounded-full bg-ink" style={{ width: `${(x.n / staffMax) * 100}%` }} />
                </div>
                <p className="tabular mt-1 text-xs text-muted">{CURRENCY.format(x.fees)} from completed</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-3">
          <CardTitle>Most booked {profile.services}</CardTitle>
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {services.map((x) => (
              <li key={x.s.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{x.s.name}</span>
                  <span className="tabular shrink-0 text-muted">
                    <span className="font-semibold text-ink">{x.n}</span> ({pct(x.n, held.length)}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-paper">
                  <div className="h-2 rounded-full bg-lilac-deep" style={{ width: `${(x.n / serviceMax) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">
            {capitalise(serviceOf(profile, services[0]?.s.id ?? "")?.name ?? "None")} is the most booked {profile.service} in this period.
          </p>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, note, className }: { label: string; value: string; note: string; className?: string }) {
  return (
    <section className={cx("rounded-3xl bg-surface p-5 ring-1 ring-line", className)}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="tabular mt-1 font-display text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </section>
  );
}
