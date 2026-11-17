"use client";

import Link from "next/link";
import { useState } from "react";
import { AppointmentSheet } from "@/components/AppointmentSheet";
import { DateStrip } from "@/components/DateStrip";
import { Icon } from "@/components/icons";
import { Avatar, btn, cx, PageHeader, Segmented, Skeleton, StatusBadge } from "@/components/ui";
import { capitalise } from "@/lib/business";
import { addDays, formatLong, formatTime, fromMinutes, toMinutes, weekday } from "@/lib/date";
import { active, onDate, serviceOf, staffOf } from "@/lib/selectors";
import { useData } from "@/lib/store";
import type { Appointment } from "@/lib/types";

export default function SchedulePage() {
  const data = useData();
  const [picked, setPicked] = useState<string | null>(null);
  const [staffFilter, setStaffFilter] = useState("all");
  const [open, setOpen] = useState<Appointment | null>(null);
  if (!data) return <Skeleton />;

  const { profile } = data;
  const date = picked ?? data.today;
  const closed = profile.closedDays.includes(weekday(date));
  const dayList = onDate(data.appointments, date).filter((a) => staffFilter === "all" || a.staffId === staffFilter);

  const slots: { time: string; items: Appointment[] }[] = [];
  for (let t = profile.open * 60; t < profile.close * 60; t += 30) {
    slots.push({ time: fromMinutes(t), items: dayList.filter((a) => toMinutes(a.start) >= t && toMinutes(a.start) < t + 30) });
  }
  const booked = active(dayList).length;
  const emptySlots = slots.filter((s) => active(s.items).length === 0).length;

  return (
    <>
      <PageHeader
        title="Day sheet"
        sub={formatLong(date)}
        actions={
          <>
            <Segmented items={[{ href: "/app/schedule", label: "Day" }, { href: "/app/week", label: "Week" }]} active="/app/schedule" />
            <button className={cx(btn.icon, "max-md:hidden")} onClick={() => window.print()} aria-label="Print day sheet">
              <Icon name="print" size={18} />
            </button>
          </>
        }
      />

      <div className="no-print space-y-4">
        <DateStrip data={data} value={date} onChange={setPicked} start={addDays(date, -3)} />
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
          {[{ id: "all", name: `All ${profile.staffRolePlural.toLowerCase()}` }, ...profile.staff].map((s) => (
            <button
              key={s.id}
              onClick={() => setStaffFilter(s.id)}
              aria-pressed={staffFilter === s.id}
              className={cx(
                "h-9 shrink-0 rounded-full px-4 text-sm font-medium ring-1",
                staffFilter === s.id ? "bg-ink text-white ring-ink" : "bg-surface text-muted ring-line hover:text-ink",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <p className="tabular mt-5 mb-3 text-sm text-muted">
        {closed ? "Closed on this day." : `${booked} booked, ${emptySlots} of ${slots.length} half-hour slots open`}
      </p>

      {/* Laptop: table like a printed appointment sheet */}
      <div className="hidden overflow-hidden rounded-3xl bg-surface ring-1 ring-line md:block print:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-muted">
            <tr>
              <th scope="col" className="w-28 px-5 py-3 font-medium">Time</th>
              <th scope="col" className="px-3 py-3 font-medium">{capitalise(profile.client)}</th>
              <th scope="col" className="px-3 py-3 font-medium">Phone</th>
              <th scope="col" className="px-3 py-3 font-medium">{capitalise(profile.service)}</th>
              <th scope="col" className="px-3 py-3 font-medium">{profile.staffRole}</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) =>
              s.items.length === 0 ? (
                <tr key={s.time} className="border-t border-line">
                  <th scope="row" className="tabular px-5 py-3 font-semibold">{formatTime(s.time)}</th>
                  <td colSpan={5} className="px-3 py-3 text-faint">
                    {closed ? "Closed" : (
                      <Link href={`/app/new?date=${date}&time=${s.time}`} className="no-print rounded-full px-2 py-1 hover:bg-paper hover:text-ink">
                        Open slot, add booking
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                s.items.map((a, i) => (
                  <tr
                    key={a.id}
                    onClick={() => setOpen(a)}
                    className={cx("cursor-pointer hover:bg-paper", i === 0 && "border-t border-line", a.status === "cancelled" && "text-muted")}
                  >
                    <th scope="row" className="tabular px-5 py-3 font-semibold">{i === 0 ? formatTime(s.time) : ""}</th>
                    <td className="px-3 py-3">
                      <button className="flex items-center gap-2.5 text-left font-medium" onClick={() => setOpen(a)}>
                        <Avatar name={a.clientName} size="sm" />
                        <span>
                          {a.clientName}
                          {a.start !== s.time && <span className="tabular block text-xs font-normal text-muted">from {formatTime(a.start)}</span>}
                        </span>
                      </button>
                    </td>
                    <td className="tabular px-3 py-3 text-muted">{a.phone}</td>
                    <td className="px-3 py-3">{serviceOf(profile, a.serviceId)?.name}<span className="block text-xs text-muted">{a.duration} min</span></td>
                    <td className="px-3 py-3">{staffOf(profile, a.staffId)?.name}</td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* Phone: time rail with cards */}
      <ol className="space-y-1 md:hidden print:hidden">
        {slots.map((s) => (
          <li key={s.time} className="flex gap-3">
            <span className="tabular w-16 shrink-0 pt-3 text-sm font-semibold">{formatTime(s.time)}</span>
            <div className="min-w-0 flex-1 space-y-1.5 border-l border-line py-1.5 pl-3">
              {s.items.length === 0 ? (
                closed ? <p className="py-2 text-sm text-faint">Closed</p> : (
                  <Link href={`/app/new?date=${date}&time=${s.time}`} className="block rounded-2xl border border-dashed border-line px-3 py-2.5 text-sm text-faint">
                    Open slot
                  </Link>
                )
              ) : (
                s.items.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setOpen(a)}
                    className={cx("flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left ring-1 ring-line", a.status === "cancelled" && "opacity-55")}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{a.clientName}</span>
                      <span className="block truncate text-xs text-muted">
                        {formatTime(a.start)}, {serviceOf(profile, a.serviceId)?.name}, {staffOf(profile, a.staffId)?.name}
                      </span>
                    </span>
                    <StatusBadge status={a.status} />
                  </button>
                ))
              )}
            </div>
          </li>
        ))}
      </ol>

      <AppointmentSheet appt={open} data={data} onClose={() => setOpen(null)} />
    </>
  );
}
