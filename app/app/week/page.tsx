"use client";

import { useState, type ReactNode } from "react";
import { AppointmentSheet } from "@/components/AppointmentSheet";
import { DateStrip } from "@/components/DateStrip";
import { Icon } from "@/components/icons";
import { btn, cx, PageHeader, Segmented, Skeleton, StatusBadge } from "@/components/ui";
import { addDays, dayName, dayNumber, formatHour, formatShort, formatTime, startOfWeek, toMinutes, weekday } from "@/lib/date";
import { active, onDate, serviceOf, staffOf } from "@/lib/selectors";
import { useData } from "@/lib/store";
import type { Appointment } from "@/lib/types";

const PER_CELL = 3;

export default function WeekPage() {
  const data = useData();
  const [weekOffset, setWeekOffset] = useState(0);
  const [mobileDay, setMobileDay] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Appointment | null>(null);
  if (!data) return <Skeleton />;

  const { profile, today } = data;
  const monday = addDays(startOfWeek(today), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter((d) => !profile.closedDays.includes(weekday(d)));
  const hours = Array.from({ length: profile.close - profile.open }, (_, i) => profile.open + i);
  const weekTotal = days.reduce((n, d) => n + active(onDate(data.appointments, d)).length, 0);
  const selected = mobileDay ?? (days.includes(today) ? today : days[0]);

  const inHour = (d: string, h: number) =>
    onDate(data.appointments, d).filter((a) => Math.floor(toMinutes(a.start) / 60) === h);

  const navWeek = (n: number) => {
    setWeekOffset(n);
    setMobileDay(null);
  };

  return (
    <>
      <PageHeader
        title="Week"
        sub={`${formatShort(days[0])} to ${formatShort(days[days.length - 1])}, ${weekTotal} booked`}
        actions={
          <>
            <Segmented items={[{ href: "/app/schedule", label: "Day" }, { href: "/app/week", label: "Week" }]} active="/app/week" />
            <div className="no-print flex items-center gap-1">
              <button className={btn.icon} onClick={() => navWeek(weekOffset - 1)} aria-label="Previous week"><Icon name="left" size={18} /></button>
              <button className={cx(btn.secondary, "h-10! px-4!")} onClick={() => navWeek(0)} disabled={weekOffset === 0}>This week</button>
              <button className={btn.icon} onClick={() => navWeek(weekOffset + 1)} aria-label="Next week"><Icon name="right" size={18} /></button>
            </div>
            <button className={cx(btn.icon, "no-print max-lg:hidden")} onClick={() => window.print()} aria-label="Print week">
              <Icon name="print" size={18} />
            </button>
          </>
        }
      />

      {/* Laptop: weekly grid like a printed weekly planner */}
      <div className="hidden overflow-hidden rounded-3xl bg-surface ring-1 ring-line lg:block print:block">
        <div className="grid" style={{ gridTemplateColumns: `4.5rem repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="border-b border-line bg-paper" />
          {days.map((d) => (
            <div key={d} className={cx("border-b border-l border-line px-3 py-3", d === today ? "bg-ink text-white" : "bg-paper")}>
              <p className={cx("text-xs", d === today ? "text-white/70" : "text-muted")}>{dayName(d)}</p>
              <p className="flex items-baseline justify-between gap-2">
                <span className="font-display text-2xl font-semibold">{dayNumber(d)}</span>
                <span className={cx("tabular text-xs font-medium", d === today ? "text-lime" : "text-muted")}>
                  {active(onDate(data.appointments, d)).length} booked
                </span>
              </p>
            </div>
          ))}
          {hours.map((h) => (
            <Row key={h}>
              <div className="tabular border-t border-line px-3 py-2 text-xs font-semibold text-muted">{formatHour(h)}</div>
              {days.map((d) => {
                const items = inHour(d, h);
                const key = `${d}-${h}`;
                const shown = expanded[key] ? items : items.slice(0, PER_CELL);
                return (
                  <div key={key} className={cx("min-h-14 space-y-1 border-l border-t border-line p-1.5", d < today && "bg-paper/50")}>
                    {items.map((a, i) => (
                      <button
                        key={a.id}
                        onClick={() => setOpen(a)}
                        className={cx(
                          "w-full rounded-lg px-2 py-1 text-left text-xs hover:ring-1 hover:ring-faint",
                          // Extra rows stay hidden on screen until expanded, but always print.
                          i < shown.length ? "block" : "hidden print:block",
                          a.status === "cancelled" ? "text-faint line-through" : a.status === "no-show" ? "bg-warn-soft" : d < today ? "bg-paper" : "bg-lilac-soft",
                        )}
                      >
                        <span className="block truncate font-medium">
                          <span className="tabular text-muted">{a.start}</span> {a.clientName}
                        </span>
                        <span className="tabular block truncate text-[11px] text-muted">{a.phone}</span>
                      </button>
                    ))}
                    {items.length > PER_CELL && (
                      <button
                        className="no-print w-full rounded-lg px-2 py-0.5 text-left text-xs font-medium text-lilac-deep hover:bg-lilac-soft"
                        onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                      >
                        {expanded[key] ? "Show less" : `${items.length - PER_CELL} more`}
                      </button>
                    )}
                  </div>
                );
              })}
            </Row>
          ))}
        </div>
      </div>

      {/* Phone and tablet: pick a day, see its list */}
      <div className="space-y-4 lg:hidden print:hidden">
        <DateStrip data={data} value={selected} onChange={setMobileDay} start={monday} days={7} showNav={false} />
        {hours.map((h) => {
          const items = inHour(selected, h);
          if (items.length === 0) return null;
          return (
            <section key={h}>
              <h2 className="tabular mb-2 text-sm font-semibold text-muted">{formatHour(h)}</h2>
              <ul className="space-y-1.5">
                {items.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => setOpen(a)}
                      className={cx("flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left ring-1 ring-line", a.status === "cancelled" && "opacity-55")}
                    >
                      <span className="tabular w-16 shrink-0 text-sm font-semibold">{formatTime(a.start)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{a.clientName}</span>
                        <span className="block truncate text-xs text-muted">
                          {serviceOf(profile, a.serviceId)?.name}, {staffOf(profile, a.staffId)?.name}
                        </span>
                      </span>
                      <StatusBadge status={a.status} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {active(onDate(data.appointments, selected)).length === 0 && (
          <p className="rounded-3xl bg-surface p-8 text-center text-muted ring-1 ring-line">
            {profile.closedDays.includes(weekday(selected)) ? "Closed on this day." : "Nothing booked on this day yet."}
          </p>
        )}
      </div>

      <AppointmentSheet appt={open} data={data} onClose={() => setOpen(null)} />
    </>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="contents">{children}</div>;
}
