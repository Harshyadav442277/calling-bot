"use client";

import { useEffect, useRef, useState } from "react";
import { capitalise, CURRENCY } from "@/lib/business";
import { formatLong, formatTime, fromMinutes, weekday } from "@/lib/date";
import { endTime, freeStarts, serviceOf, staffOf } from "@/lib/selectors";
import { DateStrip } from "./DateStrip";
import { updateAppointment, type Snapshot } from "@/lib/store";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { Icon } from "./icons";
import { Avatar, btn, cx, StatusBadge } from "./ui";

/** Slide-over on laptop, bottom sheet on phone. */
type Props = { appt: Appointment | null; data: Snapshot; onClose: () => void };

export function AppointmentSheet(props: Props) {
  // Keyed by id so local state (the cancel prompt) resets for each appointment.
  return props.appt ? <Sheet key={props.appt.id} {...props} appt={props.appt} /> : null;
}

function Sheet({ appt, data, onClose }: Props & { appt: Appointment }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [moving, setMoving] = useState(false);
  const [newDate, setNewDate] = useState(appt.date);
  const [newTime, setNewTime] = useState<string | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Read the live version so status changes show immediately.
  const a = data.appointments.find((x) => x.id === appt.id) ?? appt;
  const service = serviceOf(data.profile, a.serviceId);
  const staff = staffOf(data.profile, a.staffId);
  const isPast = a.date < data.today || (a.date === data.today && a.start <= `${String(Math.floor(data.nowMinutes / 60)).padStart(2, "0")}:${String(data.nowMinutes % 60).padStart(2, "0")}`);

  const nowHHMM = fromMinutes(data.nowMinutes);
  const moveClosed = data.profile.closedDays.includes(weekday(newDate));
  const moveTimes = moveClosed
    ? []
    : freeStarts(data.profile, data.appointments, newDate, a.staffId, a.duration, a.id).filter(
        (t) => t.endsWith(":00") || t.endsWith(":30") ? newDate !== data.today || t > nowHHMM : false,
      );

  const set = (status: AppointmentStatus) => {
    updateAppointment(a.id, { status });
    setConfirmCancel(false);
  };

  return (
    <div className="no-print fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button className="absolute inset-0 bg-ink/30" aria-label="Close" onClick={onClose} tabIndex={-1} />
      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[2rem] bg-surface p-6 md:inset-y-3 md:left-auto md:right-3 md:max-h-none md:w-[420px] md:rounded-[2rem]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line md:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={a.clientName} size="lg" />
            <div>
              <h2 id="sheet-title" className="font-display text-xl font-semibold tracking-tight">{a.clientName}</h2>
              <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="tabular text-sm text-muted hover:text-ink">{a.phone}</a>
            </div>
          </div>
          <button ref={closeRef} className={btn.icon} onClick={onClose} aria-label="Close details">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <StatusBadge status={a.status} />
          <span className="text-xs text-muted">{a.source === "phone" ? "Booked by phone" : "Added by you"}</span>
        </div>

        <dl className="mt-5 divide-y divide-line rounded-2xl bg-paper px-4 text-sm">
          <Row label={capitalise(data.profile.service)} value={service?.name ?? "Unknown"} />
          <Row label={data.profile.staffRole} value={staff?.name ?? "Any"} />
          <Row label="Date" value={formatLong(a.date)} />
          <Row label="Time" value={`${formatTime(a.start)} to ${formatTime(endTime(a))}`} />
          <Row label="Fee" value={service ? CURRENCY.format(service.price) : "Not set"} />
          {a.notes && <Row label="Notes" value={a.notes} />}
        </dl>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <a href={`tel:${a.phone.replace(/\s/g, "")}`} className={cx(btn.secondary, "col-span-2")}>
            <Icon name="phone" size={16} />
            Call {data.profile.client}
          </a>
          {a.status === "confirmed" && isPast && (
            <>
              <button className={btn.primary} onClick={() => set("completed")}>Mark completed</button>
              <button className={btn.secondary} onClick={() => set("no-show")}>Mark no-show</button>
            </>
          )}
          {a.status === "confirmed" && !isPast && !confirmCancel && !moving && (
            <>
              <button className={btn.secondary} onClick={() => { setMoving(true); setNewDate(a.date); setNewTime(null); }}>
                Reschedule
              </button>
              <button className={cx(btn.secondary, "text-warn!")} onClick={() => setConfirmCancel(true)}>
                Cancel booking
              </button>
            </>
          )}
          {moving && (
            <div className="col-span-2 rounded-2xl bg-paper p-4">
              <p className="mb-3 text-sm font-medium">New date and time with {staff?.name}</p>
              <DateStrip data={data} value={newDate} onChange={(d) => { setNewDate(d); setNewTime(null); }} start={data.today} days={14} showNav={false} />
              {moveTimes.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No free time on this day. Pick another date.</p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {moveTimes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewTime(t)}
                      aria-pressed={newTime === t}
                      className={cx(
                        "tabular h-10 rounded-full text-sm font-medium ring-1",
                        newTime === t ? "pill-gradient ring-ink/20" : t === a.start && newDate === a.date ? "bg-lilac-soft ring-lilac" : "bg-surface ring-line hover:ring-faint",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  className={cx(btn.primary, "h-10!")}
                  disabled={!newTime || (newTime === a.start && newDate === a.date)}
                  onClick={() => { updateAppointment(a.id, { date: newDate, start: newTime! }); setMoving(false); }}
                >
                  Move booking
                </button>
                <button className={cx(btn.ghost, "h-10!")} onClick={() => setMoving(false)}>Back</button>
              </div>
            </div>
          )}
          {confirmCancel && (
            <div className="col-span-2 rounded-2xl bg-warn-soft p-4 text-sm">
              <p className="font-medium text-warn">Cancel this booking? The slot becomes free for others.</p>
              <div className="mt-3 flex gap-2">
                <button className={cx(btn.primary, "h-10! bg-warn! hover:bg-warn!")} onClick={() => set("cancelled")}>Cancel booking</button>
                <button className={cx(btn.ghost, "h-10!")} onClick={() => setConfirmCancel(false)}>Keep it</button>
              </div>
            </div>
          )}
          {a.status !== "confirmed" && (
            <button className={cx(btn.ghost, "col-span-2")} onClick={() => set("confirmed")}>
              Restore as confirmed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
