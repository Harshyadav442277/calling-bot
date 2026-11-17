"use client";

import { useEffect, useRef } from "react";
import { addDays, dayName, dayNumber, weekday } from "@/lib/date";
import { active, onDate } from "@/lib/selectors";
import type { Snapshot } from "@/lib/store";
import { Icon } from "./icons";
import { btn, cx } from "./ui";

/** Horizontal row of date chips with booking counts, like a phone calendar. */
export function DateStrip({
  data,
  value,
  onChange,
  start,
  days = 7,
  showNav = true,
}: {
  data: Snapshot;
  value: string;
  onChange: (d: string) => void;
  start: string;
  days?: number;
  showNav?: boolean;
}) {
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const rowRef = useRef<HTMLDivElement>(null);

  // Keep the selected day in view on narrow screens, without moving the page.
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip) return;
    row.scrollLeft = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
  }, [value, start]);

  return (
    <div className="flex items-center gap-2">
      {showNav && (
        <button className={cx(btn.icon, "shrink-0 max-sm:hidden")} onClick={() => onChange(addDays(value, -1))} aria-label="Previous day">
          <Icon name="left" size={18} />
        </button>
      )}
      <div ref={rowRef} className="scrollbar-none relative -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1">
        {dates.map((d) => {
          const closed = data.profile.closedDays.includes(weekday(d));
          const n = closed ? 0 : active(onDate(data.appointments, d)).length;
          const selected = d === value;
          return (
            <button
              key={d}
              onClick={() => onChange(d)}
              aria-pressed={selected}
              className={cx(
                "flex min-w-[4.25rem] flex-1 flex-col items-center rounded-full px-2 py-2.5 ring-1",
                selected ? "bg-ink text-white ring-ink" : "bg-surface ring-line hover:ring-faint",
                closed && !selected && "text-faint",
              )}
            >
              <span className={cx("text-xs", selected ? "text-white/70" : "text-muted")}>
                {d === data.today ? "Today" : dayName(d)}
              </span>
              <span className="font-display text-xl font-semibold">{dayNumber(d)}</span>
              <span className={cx("tabular text-[11px]", selected ? "text-lime" : "text-muted")}>{closed ? "Closed" : `${n} booked`}</span>
            </button>
          );
        })}
      </div>
      {showNav && (
        <button className={cx(btn.icon, "shrink-0 max-sm:hidden")} onClick={() => onChange(addDays(value, 1))} aria-label="Next day">
          <Icon name="right" size={18} />
        </button>
      )}
    </div>
  );
}
