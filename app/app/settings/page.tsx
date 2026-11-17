"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Avatar, btn, Card, CardTitle, cx, PageHeader, Skeleton } from "@/components/ui";
import { capitalise, CURRENCY, PROFILES } from "@/lib/business";
import { formatHour } from "@/lib/date";
import { resetChanges, updateSettings, useData } from "@/lib/store";
import type { BusinessType } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SettingsPage() {
  const data = useData();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [ownerDraft, setOwnerDraft] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!data) return <Skeleton />;

  const { profile } = data;
  const name = nameDraft ?? data.businessName;
  const owner = ownerDraft ?? data.ownerName;

  const save = () => {
    updateSettings({ businessName: name.trim() || undefined, ownerName: owner.trim() || undefined });
    setNameDraft(null);
    setOwnerDraft(null);
    setSavedAt(true);
  };

  const switchType = (t: BusinessType) => {
    // Keep a custom name, but swap a default name for the other default.
    const usingDefault = data.businessName === profile.defaultName;
    updateSettings({ type: t, businessName: usingDefault ? undefined : data.businessName });
    setNameDraft(null);
  };

  const input =
    "h-12 w-full rounded-2xl bg-paper px-4 text-sm outline-none ring-1 ring-transparent focus:bg-surface focus:ring-2 focus:ring-lilac-deep";

  return (
    <>
      <PageHeader title="Settings" sub="Your business details and how the app talks about your work." />

      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardTitle>Business</CardTitle>
          <p className="mb-2 text-sm font-medium">Type of business</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROFILES) as BusinessType[]).map((t) => (
              <button
                key={t}
                onClick={() => switchType(t)}
                aria-pressed={data.type === t}
                className={cx(
                  "rounded-2xl px-4 py-3 text-left ring-1",
                  data.type === t ? "bg-ink text-white ring-ink" : "bg-surface ring-line hover:ring-faint",
                )}
              >
                <span className="block font-semibold">{PROFILES[t].label}</span>
                <span className={cx("text-xs", data.type === t ? "text-white/70" : "text-muted")}>
                  {capitalise(PROFILES[t].clients)}, {PROFILES[t].staffRolePlural.toLowerCase()}
                </span>
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-medium">Business name</span>
            <input className={input} value={name} onChange={(e) => { setNameDraft(e.target.value); setSavedAt(false); }} />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium">Your first name <span className="font-normal text-muted">(used in the greeting)</span></span>
            <input className={input} value={owner} onChange={(e) => { setOwnerDraft(e.target.value); setSavedAt(false); }} />
          </label>
          <div className="mt-5 flex items-center gap-3">
            <button className={btn.primary} onClick={save} disabled={nameDraft === null && ownerDraft === null}>Save changes</button>
            {savedAt && <span className="inline-flex items-center gap-1.5 text-sm text-ok"><Icon name="check" size={16} /> Saved</span>}
          </div>
        </Card>

        <Card>
          <CardTitle>Opening hours</CardTitle>
          <ul className="divide-y divide-line text-sm">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <li key={d} className="flex justify-between py-2.5">
                <span>{DAYS[d]}</span>
                <span className={cx("tabular", profile.closedDays.includes(d) ? "text-muted" : "font-medium")}>
                  {profile.closedDays.includes(d) ? "Closed" : `${formatHour(profile.open)} to ${formatHour(profile.close)}`}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{profile.staffRolePlural}</CardTitle>
          <ul className="space-y-3">
            {profile.staff.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <Avatar name={s.name} />
                <span>
                  <span className="block font-medium">{s.name}</span>
                  <span className="text-sm text-muted">{s.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{capitalise(profile.services)}</CardTitle>
          <ul className="divide-y divide-line text-sm">
            {profile.catalogue.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="block font-medium">{s.name}</span>
                  <span className="text-xs text-muted">{s.duration} min</span>
                </span>
                <span className="tabular font-semibold">{CURRENCY.format(s.price)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Data on this device</CardTitle>
          <p className="text-sm text-muted">
            The app is showing sample data. Bookings you add and status changes you make are kept in this browser only.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!confirmReset ? (
              <button className={btn.secondary} onClick={() => setConfirmReset(true)}>Clear my changes</button>
            ) : (
              <>
                <span className="text-sm font-medium text-warn">Remove every booking and status change you made?</span>
                <button className={cx(btn.primary, "bg-warn! hover:bg-warn!")} onClick={() => { resetChanges(); setConfirmReset(false); }}>Clear changes</button>
                <button className={btn.ghost} onClick={() => setConfirmReset(false)}>Keep them</button>
              </>
            )}
            <Link href="/terms" className={btn.ghost}>Terms</Link>
            <Link href="/privacy" className={btn.ghost}>Privacy</Link>
          </div>
        </Card>
      </div>
    </>
  );
}
