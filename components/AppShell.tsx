"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useData } from "@/lib/store";
import { Icon, type IconName } from "./icons";
import { btn, cx, Logo } from "./ui";

const NAV: { href: string; label: string; icon: IconName; match: string[] }[] = [
  { href: "/app", label: "Today", icon: "today", match: ["/app"] },
  { href: "/app/schedule", label: "Schedule", icon: "week", match: ["/app/schedule", "/app/week"] },
  { href: "/app/bookings", label: "Bookings", icon: "list", match: ["/app/bookings"] },
  { href: "/app/analytics", label: "Analytics", icon: "chart", match: ["/app/analytics"] },
  { href: "/app/settings", label: "Settings", icon: "settings", match: ["/app/settings"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const data = useData();
  const isActive = (match: string[]) => match.includes(pathname);
  // The booking form has its own bottom bar on phones, so the tab bar steps aside.
  const composing = pathname === "/app/new";

  return (
    <div className="min-h-dvh lg:pl-64 print:pl-0">
      {/* Laptop and desktop: sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/app" className="px-2">
          <Logo />
        </Link>
        <div className="mt-6 rounded-2xl bg-paper px-3 py-3">
          <p className="truncate text-sm font-semibold">{data?.businessName ?? " "}</p>
          <p className="text-xs text-muted">{data ? data.profile.label : " "}</p>
        </div>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.match) ? "page" : undefined}
              className={cx(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                isActive(n.match) ? "bg-ink text-white" : "text-muted hover:bg-paper hover:text-ink",
              )}
            >
              <Icon name={n.icon} size={18} />
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/app/new"
          className="pill-gradient mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-ink ring-1 ring-ink/5 hover:ring-ink/20"
        >
          <Icon name="plus" size={18} />
          New booking
        </Link>
        <div className="mt-auto space-y-3">
          {data?.isSample && (
            <p className="rounded-2xl bg-lime-soft px-3 py-2.5 text-xs leading-relaxed text-[#56631b]">
              Showing sample data. Real bookings appear here once your phone line is connected.
            </p>
          )}
          <Link href="/" className={cx(btn.ghost, "w-full justify-start! px-3!")}>
            <Icon name="logout" size={18} />
            Sign out
          </Link>
        </div>
      </aside>

      {/* Phone and tablet: top bar */}
      <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
        <Link href="/app" className="min-w-0">
          <Logo className="text-base" />
        </Link>
        <div className="flex items-center gap-2">
          {data?.isSample && (
            <span className="hidden rounded-full bg-lime-soft px-3 py-1 text-xs font-medium text-[#56631b] sm:inline">Sample data</span>
          )}
          {composing ? (
            <Link href="/app" className={btn.icon} aria-label="Close without booking">
              <Icon name="close" size={18} />
            </Link>
          ) : (
            <Link href="/app/new" className={cx(btn.primary, "h-10! px-4!")} aria-label="New booking">
              <Icon name="plus" size={18} />
              <span className="hidden sm:inline">New booking</span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:px-8 lg:pb-12 lg:pt-10 print:max-w-none print:p-0">{children}</main>

      {/* Phone and tablet: floating tab bar */}
      <nav
        aria-label="Main"
        className={cx(
          "no-print fixed inset-x-0 bottom-0 z-30 justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
          composing ? "hidden" : "flex lg:hidden",
        )}
      >
        <div className="flex w-full max-w-md items-center justify-between gap-1 rounded-full bg-ink p-1.5 shadow-[0_12px_32px_-12px_rgba(24,24,31,0.55)]">
          {NAV.map((n) => {
            const active = isActive(n.match);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-label={n.label}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold",
                  active ? "flex-[1.8] bg-white px-3 text-ink" : "flex-1 text-white/70 hover:text-white",
                )}
              >
                <Icon name={n.icon} size={20} />
                {active && <span className="truncate">{n.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
