import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./ui";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,1.1fr)]">
      <aside className="aura relative hidden flex-col justify-between p-10 lg:flex">
        <Link href="/"><Logo /></Link>
        <div className="max-w-md">
          <p className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Know who&apos;s coming in, before they walk through the door.
          </p>
          <ul className="mt-8 space-y-3 text-ink/75">
            <li>Phone bookings appear on your day sheet as they&apos;re made.</li>
            <li>Day and week views that fit your phone or your computer.</li>
            <li>Simple charts for your busiest hours and most booked services.</li>
          </ul>
        </div>
        <p className="text-sm text-ink/60">For salons, clinics and other appointment-based businesses.</p>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8 lg:px-16">
        <Link href="/" className="lg:hidden"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}

export const authInput =
  "h-12 w-full rounded-2xl bg-surface px-4 text-sm outline-none ring-1 ring-line placeholder:text-faint focus:ring-2 focus:ring-lilac-deep";

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-line" />
      or with email
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
