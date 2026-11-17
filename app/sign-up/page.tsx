"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLayout, authInput, Divider } from "@/components/AuthLayout";
import { ProviderButtons } from "@/components/Providers";
import { btn, cx } from "@/components/ui";
import { PROFILES } from "@/lib/business";
import { updateSettings } from "@/lib/store";
import type { BusinessType } from "@/lib/types";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [type, setType] = useState<BusinessType>("salon");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [tried, setTried] = useState(false);

  const errors = {
    name: !name.trim() ? "Enter your name." : "",
    business: !business.trim() ? "Enter your business name." : "",
    email: !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email address." : "",
    password: password.length < 8 ? "Use at least 8 characters." : "",
    agreed: !agreed ? "Accept the Terms and Privacy Policy to continue." : "",
  };
  const valid = Object.values(errors).every((e) => !e);
  const err = (k: keyof typeof errors) => (tried && errors[k] ? <span className="mt-1.5 block text-sm text-warn">{errors[k]}</span> : null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    // Design only: the password is never stored. Only display details are kept in this browser.
    updateSettings({ type, businessName: business.trim(), ownerName: name.trim().split(" ")[0] });
    router.push("/app");
  };

  return (
    <AuthLayout>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted">Set up your appointment book in a couple of minutes.</p>

      <div className="mt-8">
        <ProviderButtons verb="Sign up" />
      </div>
      <Divider />

      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Your name</span>
            <input className={authInput} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            {err("name")}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Business name</span>
            <input className={authInput} autoComplete="organization" value={business} onChange={(e) => setBusiness(e.target.value)} />
            {err("business")}
          </label>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Type of business</legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROFILES) as BusinessType[]).map((t) => (
              <label
                key={t}
                className={cx(
                  "flex h-12 cursor-pointer items-center justify-center rounded-2xl text-sm font-semibold ring-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lilac-deep",
                  type === t ? "bg-ink text-white ring-ink" : "bg-surface ring-line hover:ring-faint",
                )}
              >
                <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                {t === "salon" ? "Salon or spa" : "Clinic or small hospital"}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Work email</span>
          <input className={authInput} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {err("email")}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <input className={authInput} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err("password") ?? <span className="mt-1.5 block text-xs text-muted">At least 8 characters.</span>}
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#18181f]" />
          <span className="text-muted">
            I agree to the <Link href="/terms" className="font-semibold text-ink underline underline-offset-4">Terms and Conditions</Link> and the{" "}
            <Link href="/privacy" className="font-semibold text-ink underline underline-offset-4">Privacy Policy</Link>, and I have the right to store my {type === "clinic" ? "patients'" : "clients'"} contact details.
          </span>
        </label>
        {err("agreed")}

        <button type="submit" className={cx(btn.primary, "h-12! w-full")}>Create account</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link href="/sign-in" className="font-semibold text-ink underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
