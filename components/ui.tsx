import Link from "next/link";
import type { ReactNode } from "react";
import type { AppointmentStatus } from "@/lib/types";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 h-11 text-sm font-semibold text-white hover:bg-ink-2 disabled:opacity-40 disabled:pointer-events-none",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-surface px-5 h-11 text-sm font-semibold text-ink ring-1 ring-line hover:ring-faint disabled:opacity-40",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full px-4 h-10 text-sm font-medium text-muted hover:text-ink hover:bg-surface",
  icon: "inline-flex size-10 items-center justify-center rounded-full bg-surface ring-1 ring-line text-ink hover:ring-faint",
};

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight", className)}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect width="26" height="26" rx="8" fill={dark ? "#fff" : "#18181f"} />
        <rect x="6" y="8" width="14" height="3" rx="1.5" fill={dark ? "#18181f" : "#fff"} />
        <rect x="6" y="15" width="8" height="3" rx="1.5" fill="#dcea95" />
      </svg>
      Slotline
    </span>
  );
}

const AVATAR_TONES = ["bg-lilac-soft text-lilac-deep", "bg-peach-soft text-[#9a4a26]", "bg-lime-soft text-[#56631b]"];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const parts = name.replace(/^Dr\.\s*/, "").split(" ");
  const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const dims = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-14 text-lg" : "size-10 text-sm";
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", dims, AVATAR_TONES[h % 3])}
      aria-hidden="true"
    >
      {initials.toUpperCase()}
    </span>
  );
}

const STATUS: Record<AppointmentStatus, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-lilac-soft text-lilac-deep" },
  completed: { label: "Completed", cls: "bg-ok-soft text-ok" },
  cancelled: { label: "Cancelled", cls: "bg-paper text-muted line-through decoration-1" },
  "no-show": { label: "No-show", cls: "bg-warn-soft text-warn" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS[status];
  return <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium", s.cls)}>{s.label}</span>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-3xl bg-surface p-5 ring-1 ring-line", className)}>{children}</section>;
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function Segmented({ items, active }: { items: { href: string; label: string }[]; active: string }) {
  return (
    <div className="inline-flex rounded-full bg-surface p-1 ring-1 ring-line">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={cx(
            "rounded-full px-4 py-1.5 text-sm font-medium",
            i.href === active ? "bg-ink text-white" : "text-muted hover:text-ink",
          )}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-56 rounded-2xl bg-line/60" />
      <div className="h-40 rounded-3xl bg-line/40" />
      <div className="h-64 rounded-3xl bg-line/40" />
    </div>
  );
}
