import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { btn, cx } from "@/components/ui";

const FEATURES = [
  {
    title: "Today, at a glance",
    body: "How many are booked, who is next, the next free slot and what the day should bring in. Open it between appointments.",
  },
  {
    title: "A day sheet you can print",
    body: "Every half hour from opening to closing with name, phone and service, like the paper book at your front desk.",
  },
  {
    title: "The week in one grid",
    body: "Monday to Saturday side by side with a count for each day. On a phone, swipe between days instead.",
  },
  {
    title: "Charts that answer real questions",
    body: "Your busiest hours, most booked services, no-show rate and how each member of staff is doing.",
  },
];

const TERMS = [
  "You must be 18 or over and authorised to act for the business you register.",
  "You are responsible for the client and patient details stored in your account, and for having their permission to keep them.",
  "We use your data only to run the service. We do not sell it.",
  "You can export or delete your data at any time by writing to us.",
  "The service is provided as is during early access. Booking errors must be checked against your own records.",
];

export default function Home() {
  return (
    <>
      <div className="aura">
        <SiteHeader />
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-16">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Your appointment book, on every screen.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
              Bookings made over the phone land here as they happen. See who is coming and when, how full the week is,
              and which hours keep you busiest, from the phone at your counter or the computer in your office.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className={cx(btn.primary, "h-12! px-7!")}>Create account</Link>
              <Link href="/sign-in" className={cx(btn.secondary, "h-12! px-7!")}>Sign in</Link>
            </div>
            <p className="mt-4 text-sm text-ink/60">
              By creating an account you agree to our <Link href="/terms" className="underline underline-offset-4">Terms</Link> and{" "}
              <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
            </p>
          </div>

          <ProductPreview />
        </section>
      </div>

      <main>
        <section id="who" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 md:px-8">
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">Made for places that run on appointments</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] bg-peach-soft p-7">
              <h3 className="font-display text-2xl font-semibold">Salons and spas</h3>
              <p className="mt-3 text-ink/75">
                Stylists, services and clients. See each stylist&apos;s day, spot the gaps you can fill and which services sell.
              </p>
            </div>
            <div className="rounded-[2rem] bg-lilac-soft p-7">
              <h3 className="font-display text-2xl font-semibold">Clinics and small hospitals</h3>
              <p className="mt-3 text-ink/75">
                Doctors, visit types and patients. Keep the front desk and every doctor working from the same list.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-8 bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
            <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">What you see when you sign in</h2>
            <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="border-t border-line pt-6">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="terms" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Before you sign up</h2>
              <p className="mt-4 max-w-md leading-relaxed text-muted">
                The main points of our terms. The full Terms and Conditions and Privacy Policy apply, and you accept them when you
                create an account.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/terms" className={btn.primary}>Read the Terms</Link>
                <Link href="/privacy" className={btn.secondary}>Privacy Policy</Link>
              </div>
            </div>
            <ul className="divide-y divide-line rounded-[2rem] bg-surface px-6 ring-1 ring-line">
              {TERMS.map((t) => (
                <li key={t} className="flex gap-4 py-5">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-lilac-deep" aria-hidden="true" />
                  <p className="leading-relaxed">{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/** A static picture of the Today screen. Example figures, not real data. */
function ProductPreview() {
  const rows = [
    ["10:00 am", "Kavya Nair", "Haircut & blow-dry"],
    ["10:45 am", "Rahul Mehta", "Beard trim"],
    ["11:30 am", "Simran Kapoor", "Hair colour"],
  ];
  return (
    <figure className="mx-auto w-full max-w-sm" aria-label="Example of the Today screen">
      <div className="rounded-[2.5rem] bg-ink p-2.5 shadow-[0_40px_80px_-40px_rgba(24,24,31,0.6)]">
        <div className="rounded-[2rem] bg-paper p-4">
          <p className="text-xs text-muted">Good morning</p>
          <p className="font-display text-xl font-semibold">Today</p>
          <div className="aura mt-3 rounded-3xl p-4 ring-1 ring-line">
            <p className="text-xs text-ink/70">Booked for today</p>
            <p className="font-display text-5xl font-semibold leading-none">18</p>
            <p className="mt-1 text-xs text-ink/70">4 done, 14 still to come</p>
          </div>
          <div className="mt-3 rounded-3xl bg-ink p-4 text-white">
            <p className="text-[11px] text-white/60">Next up</p>
            <p className="font-semibold">Kavya Nair</p>
            <p className="text-xs text-white/70">10:00 am, Haircut &amp; blow-dry</p>
            <div className="pill-gradient mt-3 rounded-full py-2 text-center text-xs font-semibold text-ink">Open booking</div>
          </div>
          <ul className="mt-3 space-y-1 rounded-3xl bg-surface p-2">
            {rows.map(([t, n, s]) => (
              <li key={n} className="flex items-center gap-3 rounded-2xl px-2 py-2">
                <span className="w-14 text-[11px] font-semibold">{t}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">{n}</span>
                  <span className="block truncate text-[11px] text-muted">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-ink/55">Example screen with sample figures</figcaption>
    </figure>
  );
}
