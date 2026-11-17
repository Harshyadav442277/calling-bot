import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome";

/**
 * Template legal text. Have it reviewed by a lawyer for your country and
 * business before launch; replace the company name and contact details.
 */
export function LegalPage({ title, updated, intro, sections }: {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <>
      <div className="aura">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-10 md:px-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-ink/60">Last updated {updated}</p>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="text-lg leading-relaxed text-ink/80">{intro}</div>
        <ol className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <li key={s.heading}>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                <span className="tabular mr-3 text-muted">{i + 1}.</span>
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/80">{s.body}</div>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
