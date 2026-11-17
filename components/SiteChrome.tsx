import Link from "next/link";
import { btn, cx, Logo } from "./ui";

export const CONTACT_EMAIL = "support@slotline.example";

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
      <Link href="/"><Logo /></Link>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Site">
        <Link href="/#features" className={btn.ghost}>Features</Link>
        <Link href="/#who" className={btn.ghost}>Who it&apos;s for</Link>
        <Link href="/#terms" className={btn.ghost}>Terms</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className={cx(btn.ghost, "text-ink!")}>Sign in</Link>
        <Link href="/sign-up" className={cx(btn.primary, "h-10! px-4!")}>Create account</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted">Appointment book for salons and clinics.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          <Link href="/terms" className="text-muted hover:text-ink">Terms and Conditions</Link>
          <Link href="/privacy" className="text-muted hover:text-ink">Privacy Policy</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-muted hover:text-ink">{CONTACT_EMAIL}</a>
        </nav>
      </div>
    </footer>
  );
}
