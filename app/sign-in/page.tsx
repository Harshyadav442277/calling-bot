"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLayout, authInput, Divider } from "@/components/AuthLayout";
import { ProviderButtons } from "@/components/Providers";
import { btn, cx } from "@/components/ui";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [resetNote, setResetNote] = useState(false);

  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    // Design only: nothing is sent or stored. Wire real sign-in here.
    if (emailOk && password) router.push("/app");
  };

  return (
    <AuthLayout>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-muted">Welcome back. Pick up where you left off.</p>

      <div className="mt-8">
        <ProviderButtons verb="Sign in" />
      </div>
      <Divider />

      <form onSubmit={submit} noValidate className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input className={authInput} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {tried && !emailOk && <span className="mt-1.5 block text-sm text-warn">Enter the email you signed up with.</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
            Password
            <button type="button" className="font-normal text-muted hover:text-ink" onClick={() => setResetNote(true)}>Forgot password?</button>
          </span>
          <input className={authInput} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {tried && !password && <span className="mt-1.5 block text-sm text-warn">Enter your password.</span>}
        </label>
        {resetNote && (
          <p className="rounded-2xl bg-lilac-soft p-3 text-sm text-lilac-deep" role="status">
            Password reset isn&apos;t available yet. Use one of the sign-in buttons above instead.
          </p>
        )}
        <button type="submit" className={cx(btn.primary, "h-12! w-full")}>Sign in</button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New here? <Link href="/sign-up" className="font-semibold text-ink underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
