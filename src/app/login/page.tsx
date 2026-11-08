"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/**
 * Design notes
 * - Palette: ink #070B1A, indigo #6366F1 (brand), teal #2DD4BF (accent), slate neutrals.
 * - Type: one family (your app font), regular/medium weights only. Headline is semibold at most.
 * - Motion: one calm page-load sequence, a slow ambient waveform on the brand panel,
 *   and transitions that respond to the user (focus, hover, submit). All of it is
 *   disabled for people who prefer reduced motion.
 */

const BARS = Array.from({ length: 40 }, (_, i) => {
  // Deterministic, smooth-looking heights (no randomness = no hydration mismatch)
  const h = 0.28 + 0.72 * Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.17));
  return { h: Math.round(h * 100) / 100, delay: (i * 0.09).toFixed(2) };
});

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="m4 4 16 16" />}
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="sv-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

const fieldWrap =
  "group relative flex h-11 items-center rounded border border-slate-200 bg-slate-50/70 text-slate-400 " +
  "transition-all duration-300 ease-out hover:border-slate-300 " +
  "focus-within:border-indigo-500 focus-within:bg-white focus-within:text-indigo-600 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] " +
  "dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500 dark:hover:border-slate-700 " +
  "dark:focus-within:border-indigo-400 dark:focus-within:bg-slate-900 dark:focus-within:text-indigo-300 dark:focus-within:shadow-[0_0_0_4px_rgba(129,140,248,0.16)]";

const fieldInput =
  "h-full w-full bg-transparent pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;

    setError(null);
    setStatus("loading");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      // TODO: replace with your real authentication call, e.g.
      // const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      // if (!res.ok) throw new Error("Email or password is incorrect.");
      void email;
      void password;
      await new Promise((r) => setTimeout(r, 1100));

      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Could not sign in. Try again.");
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#05080F]">
      {/* Component-scoped keyframes (no tailwind.config changes needed) */}
      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sv-wave { 0%, 100% { transform: scaleY(0.35); opacity: .45; } 50% { transform: scaleY(1); opacity: .9; } }
        @keyframes sv-drift-a { 0%, 100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,30px,0); } }
        @keyframes sv-drift-b { 0%, 100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-30px,-40px,0); } }
        @keyframes sv-spin { to { transform: rotate(360deg); } }
        @keyframes sv-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .sv-rise { opacity: 0; animation: sv-rise .7s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-fade { opacity: 0; animation: sv-fade 1.2s ease-out forwards; }
        .sv-bar  { transform-origin: center; animation: sv-wave 3.6s ease-in-out infinite; }
        .sv-orb-a { animation: sv-drift-a 22s ease-in-out infinite; }
        .sv-orb-b { animation: sv-drift-b 28s ease-in-out infinite; }
        .sv-spin { animation: sv-spin .8s linear infinite; }
        .sv-shake { animation: sv-shake .35s ease-in-out; }
        @media (prefers-reduced-motion: reduce) {
          .sv-rise, .sv-fade { animation: none; opacity: 1; }
          .sv-bar, .sv-orb-a, .sv-orb-b, .sv-shake { animation: none; }
          .sv-spin { animation-duration: 1.6s; }
        }
      `}</style>

      {/* ───────── Brand panel ───────── */}
      <aside className="relative hidden w-[46%] max-w-[760px] flex-col justify-between overflow-hidden bg-[#070B1A] p-12 text-white lg:flex xl:p-16">
        {/* Ambient light */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="sv-orb-a absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[110px]" />
          <div className="sv-orb-b absolute -bottom-32 right-[-80px] h-[380px] w-[380px] rounded-full bg-teal-400/10 blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at 30% 40%, #000 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, #000 20%, transparent 75%)"
            }}
          />
        </div>

        {/* Logo */}
        <div className="sv-rise relative flex items-center gap-3" style={{ animationDelay: "60ms" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-[0_8px_24px_-8px_rgba(99,102,241,0.8)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2" />
            </svg>
          </div>
          <span className="text-lg font-medium tracking-tight">SmartVoice</span>
        </div>

        {/* Message */}
        <div className="relative max-w-md">
          <h2 className="sv-rise text-[2.35rem] font-medium leading-[1.15] tracking-tight text-white xl:text-[2.6rem]" style={{ animationDelay: "160ms" }}>
            Telecom services, managed with clarity.
          </h2>
          <p className="sv-rise mt-5 text-[15px] leading-relaxed text-slate-400" style={{ animationDelay: "260ms" }}>
            Manage multi-tenant telecommunications services with precision and real-time operational insight.
          </p>

          {/* Signature element: a slow, quiet voice waveform */}
          <div aria-hidden="true" className="sv-fade mt-12 flex h-24 items-center gap-[5px]" style={{ animationDelay: "600ms" }}>
            {BARS.map((b, i) => (
              <span
                key={i}
                className="sv-bar block w-[3px] rounded-full bg-gradient-to-b from-indigo-300 to-teal-300"
                style={{ height: `${b.h * 100}%`, animationDelay: `${b.delay}s` }}
              />
            ))}
          </div>
        </div>

        <p className="sv-fade relative text-sm text-slate-500" style={{ animationDelay: "800ms" }}>
          Trusted by operators worldwide.
        </p>
      </aside>

      {/* ───────── Form panel ───────── */}
      <main className="relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[600px]">
          {/* Compact brand mark for small screens */}
          <div className="sv-rise mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2" />
              </svg>
            </div>
            <span className="text-base font-medium text-slate-900 dark:text-white">SmartVoice</span>
          </div>

          <header className="sv-rise" style={{ animationDelay: "80ms" }}>
            <h1 className="text-[1.75rem] font-medium tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className=" text-[15px] font-light leading-relaxed text-slate-500 dark:text-slate-400">
              Sign in to the SmartVoice console.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate={false} className="mt-9 flex flex-col gap-5">
            {/* Email */}
            <div className="sv-rise flex flex-col gap-2" style={{ animationDelay: "180ms" }}>
              <label htmlFor="email" className="text-sm font-light text-slate-700 dark:text-slate-300">
                Work email
              </label>
              <div className={fieldWrap}>
                <span className="pointer-events-none pl-3.5 pr-2.5 transition-colors duration-300">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={fieldInput}
                />
              </div>
            </div>

            {/* Password */}
            <div className="sv-rise flex flex-col gap-2" style={{ animationDelay: "260ms" }}>
              <label htmlFor="password" className="text-sm font-light text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className={fieldWrap}>
                <span className="pointer-events-none pl-3.5 pr-2.5 transition-colors duration-300">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={fieldInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-200/60 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="sv-rise flex items-center justify-between" style={{ animationDelay: "340ms" }}>
              <label className="group flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                <input type="checkbox" name="remember" className="peer sr-only" />
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-slate-300 bg-white text-transparent transition-all duration-200 group-hover:border-slate-400 peer-checked:border-indigo-500 peer-checked:bg-indigo-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/50 dark:border-slate-700 dark:bg-slate-900">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>
                Remember me
              </label>

              <a
                href="/forgot-password"
                className="rounded text-sm text-indigo-600 transition-colors duration-200 hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Forgot password?
              </a>
            </div>

            {/* Error */}
            <div aria-live="polite" className="-my-1 min-h-0">
              {error && (
                <p
                  key={error}
                  className="sv-shake rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="sv-rise" style={{ animationDelay: "420ms" }}>
              <button
                type="submit"
                disabled={status !== "idle"}
                className={
                  "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded text-sm font-medium text-white " +
                  "shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)] transition-all duration-300 ease-out " +
                  "hover:-translate-y-px hover:shadow-[0_14px_28px_-12px_rgba(79,70,229,0.8)] active:translate-y-0 active:scale-[0.99] " +
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 " +
                  "disabled:cursor-not-allowed disabled:hover:translate-y-0 " +
                  (status === "success" ? "bg-teal-500" : "bg-indigo-600 hover:bg-indigo-500")
                }
              >
                {status === "loading" && (
                  <>
                    <Spinner />
                    <span>Signing in</span>
                  </>
                )}
                {status === "success" && (
                  <>
                    <CheckIcon />
                    <span>Signed in</span>
                  </>
                )}
                {status === "idle" && <span>Login</span>}
              </button>
            </div>
          </form>

          {/* Footer */}
          <footer
            className="sv-rise mt-10 font-light flex items-center justify-between border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500"
            style={{ animationDelay: "500ms" }}
          >
            <p>
              Need help?{" "}
              <a
                href="/support"
                className="rounded text-teal-600 transition-colors duration-200 hover:text-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Contact support
              </a>
            </p>
            {/* <span className="text-xs text-slate-400 dark:text-slate-600">v2.4.0</span> */}
          </footer>
        </div>
      </main>
    </div>
  );
}