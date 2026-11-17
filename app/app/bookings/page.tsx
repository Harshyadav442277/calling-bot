"use client";

import { useState } from "react";
import { AppointmentSheet } from "@/components/AppointmentSheet";
import { Icon } from "@/components/icons";
import { Avatar, btn, cx, PageHeader, Skeleton, StatusBadge } from "@/components/ui";
import { capitalise } from "@/lib/business";
import { formatTime, relativeDay } from "@/lib/date";
import { serviceOf, staffOf } from "@/lib/selectors";
import { useData } from "@/lib/store";
import type { Appointment } from "@/lib/types";

const FILTERS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "no-show", label: "No-show" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];
const PAGE = 25;

const bookedOn = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function BookingsPage() {
  const data = useData();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<Appointment | null>(null);
  if (!data) return <Skeleton />;

  const { profile, today } = data;
  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  const list = data.appointments
    .filter((a) => {
      if (filter === "upcoming") return a.status === "confirmed" && a.date >= today;
      if (filter === "all") return true;
      return a.status === filter;
    })
    .filter((a) => !q || a.clientName.toLowerCase().includes(q) || (digits.length >= 3 && a.phone.replace(/\D/g, "").includes(digits)))
    .sort((a, b) => (filter === "upcoming" ? 0 : b.createdAt.localeCompare(a.createdAt)));

  const shown = list.slice(0, limit);

  return (
    <>
      <PageHeader title="Bookings" sub={`${list.length} ${list.length === 1 ? "booking" : "bookings"}${filter === "upcoming" ? " coming up" : ""}`} />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setLimit(PAGE); }}
              aria-pressed={filter === f.id}
              className={cx(
                "h-9 shrink-0 rounded-full px-4 text-sm font-medium ring-1",
                filter === f.id ? "bg-ink text-white ring-ink" : "bg-surface text-muted ring-line hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">Search by name or phone</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
            placeholder="Search name or phone"
            className="h-11 w-full rounded-full bg-surface pl-11 pr-4 text-sm ring-1 ring-line outline-none placeholder:text-faint focus:ring-2 focus:ring-lilac-deep"
          />
        </label>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl bg-surface p-10 text-center ring-1 ring-line">
          <p className="font-medium">No bookings match.</p>
          <p className="mt-1 text-sm text-muted">Try another filter or clear the search.</p>
        </div>
      ) : (
        <>
          {/* Laptop table */}
          <div className="hidden overflow-hidden rounded-3xl bg-surface ring-1 ring-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">{capitalise(profile.client)}</th>
                  <th scope="col" className="px-3 py-3 font-medium">Appointment</th>
                  <th scope="col" className="hidden px-3 py-3 font-medium xl:table-cell">{capitalise(profile.service)}</th>
                  <th scope="col" className="hidden px-3 py-3 font-medium lg:table-cell">{profile.staffRole}</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Booked</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((a) => (
                  <tr key={a.id} className="cursor-pointer border-t border-line hover:bg-paper" onClick={() => setOpen(a)}>
                    <td className="px-5 py-3">
                      <button className="flex items-center gap-3 text-left" onClick={() => setOpen(a)}>
                        <Avatar name={a.clientName} size="sm" />
                        <span>
                          <span className="block font-medium">{a.clientName}</span>
                          <span className="tabular block text-xs text-muted">{a.phone}</span>
                        </span>
                      </button>
                    </td>
                    <td className="tabular px-3 py-3">
                      {relativeDay(a.date, today)}
                      <span className="block text-xs text-muted">{formatTime(a.start)}</span>
                    </td>
                    <td className="hidden px-3 py-3 xl:table-cell">{serviceOf(profile, a.serviceId)?.name}</td>
                    <td className="hidden px-3 py-3 lg:table-cell">{staffOf(profile, a.staffId)?.name}</td>
                    <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                    <td className="hidden px-5 py-3 text-muted lg:table-cell">
                      <span className="tabular">{bookedOn.format(new Date(a.createdAt))}</span>
                      <span className="block text-xs">{a.source === "phone" ? "By phone" : "By you"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone cards */}
          <ul className="space-y-2 md:hidden">
            {shown.map((a) => (
              <li key={a.id}>
                <button onClick={() => setOpen(a)} className="w-full rounded-3xl bg-surface p-4 text-left ring-1 ring-line">
                  <span className="flex items-center gap-3">
                    <Avatar name={a.clientName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{a.clientName}</span>
                      <span className="tabular block text-xs text-muted">{a.phone}</span>
                    </span>
                    <StatusBadge status={a.status} />
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-paper px-3 py-2 text-sm">
                    <span className="truncate">{serviceOf(profile, a.serviceId)?.name}</span>
                    <span className="tabular shrink-0 font-medium">{relativeDay(a.date, today)}, {formatTime(a.start)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {list.length > limit && (
            <div className="mt-5 text-center">
              <button className={btn.secondary} onClick={() => setLimit((l) => l + PAGE)}>
                Show more ({list.length - limit} left)
              </button>
            </div>
          )}
        </>
      )}

      <AppointmentSheet appt={open} data={data} onClose={() => setOpen(null)} />
    </>
  );
}
