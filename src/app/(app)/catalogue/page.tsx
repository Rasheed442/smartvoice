"use client";

import { useMemo, useState, type ReactNode } from "react";

/* ────────────────────────────── Data ────────────────────────────── */

type Category = "Entertainment" | "Business" | "Social";
type IconKey = "music" | "briefcase" | "cake" | "voicemail" | "headphones" | "chat" | "mic" | "gift" | "bolt";

type Service = {
  code: string;
  name: string;
  description: string;
  category: Category;
  icon: IconKey;
  /** Card header gradient */
  from: string;
  to: string;
  capabilities: string[];
  status: "Active" | "Draft";
};

const SERVICES: Service[] = [
  {
    code: "PROD-NT-01",
    name: "NameTune",
    description: "Personalised caller tune service allowing users to create custom audio messages.",
    category: "Entertainment",
    icon: "music",
    from: "#8B5CF6",
    to: "#5B4CE6",
    capabilities: ["Charging", "CRBT Provisioning", "Audio Gen"],
    status: "Active"
  },
  {
    code: "PROD-SB-01",
    name: "SmartBiz",
    description: "Professional audio promotions, greetings, and missed-call follow-up for businesses.",
    category: "Business",
    icon: "briefcase",
    from: "#1E2433",
    to: "#05070D",
    capabilities: ["Charging", "USSD Integration", "SMS Notifications"],
    status: "Active"
  },
  {
    code: "PROD-BH-01",
    name: "BdayHype",
    description: "Personalised birthday hype experience created by the celebrant for their network.",
    category: "Social",
    icon: "cake",
    from: "#C026D3",
    to: "#6D2BD6",
    capabilities: ["WhatsApp API", "Audio Gen", "Subscription Mgr"],
    status: "Active"
  },
  {
    code: "PROD-VM-01",
    name: "VoiceMail Plus",
    description: "Visual voicemail with transcription and smart call-back reminders for subscribers.",
    category: "Business",
    icon: "voicemail",
    from: "#5B4CE6",
    to: "#1D56D8",
    capabilities: ["Charging", "Audio Gen", "SMS Notifications"],
    status: "Active"
  },
  {
    code: "PROD-RS-01",
    name: "RingStory",
    description: "Rotating caller tunes drawn from trending artists, refreshed weekly per subscriber.",
    category: "Entertainment",
    icon: "headphones",
    from: "#7C3AED",
    to: "#4C1D95",
    capabilities: ["Charging", "CRBT Provisioning"],
    status: "Active"
  },
  {
    code: "PROD-CL-01",
    name: "ChatLine",
    description: "Group voice rooms and WhatsApp bridges that connect friends across networks.",
    category: "Social",
    icon: "chat",
    from: "#8B5CF6",
    to: "#C026D3",
    capabilities: ["WhatsApp API", "Subscription Mgr", "Charging"],
    status: "Active"
  },
  {
    code: "PROD-VC-01",
    name: "VoiceCards",
    description: "Send recorded greetings with a personal message for holidays and special occasions.",
    category: "Social",
    icon: "gift",
    from: "#D946EF",
    to: "#7C3AED",
    capabilities: ["Audio Gen", "SMS Notifications", "Charging"],
    status: "Active"
  },
  {
    code: "PROD-PD-01",
    name: "PodCast Drop",
    description: "Daily short audio briefings delivered to subscribers by call or voice note.",
    category: "Entertainment",
    icon: "mic",
    from: "#6366F1",
    to: "#7C3AED",
    capabilities: ["Charging", "Audio Gen", "Subscription Mgr"],
    status: "Draft"
  },
  {
    code: "PROD-QR-01",
    name: "QuickReach",
    description: "Priority call routing and instant callbacks for small business owners.",
    category: "Business",
    icon: "bolt",
    from: "#243B6B",
    to: "#0B1220",
    capabilities: ["Charging", "USSD Integration"],
    status: "Active"
  }
];

const TABS: ("All services" | Category)[] = ["All services", "Entertainment", "Business", "Social"];
const PAGE_SIZE = 6;
const mono = "font-mono";

/* ────────────────────────────── Icons ────────────────────────────── */

const ICONS: Record<IconKey, ReactNode> = {
  music: <path d="M6 12.2V4.3l6-1.3v7.9M6 12.2a1.7 1.7 0 1 1-1.7-1.7c.6 0 1.2.3 1.7.8Zm6-1.3a1.7 1.7 0 1 1-1.7-1.7c.6 0 1.2.3 1.7.8Z" />,
  briefcase: (
    <>
      <rect x="2" y="5" width="12" height="8" rx="1.6" />
      <path d="M6 5V3.8C6 3.4 6.4 3 6.8 3h2.4c.4 0 .8.4.8.8V5M2 8.5h12" />
    </>
  ),
  cake: (
    <>
      <path d="M3 13h10v-3.2c0-.6-.5-1-1-1H4c-.6 0-1 .4-1 1zM3 11.3c1 .8 1.7.8 2.7 0s1.7-.8 2.7 0 1.7.8 2.7 0 1.7-.8 2.7 0" />
      <path d="M8 8.8V6M8 4.2c.6-.5.6-1 0-1.6-.6.6-.6 1.1 0 1.6Z" />
    </>
  ),
  voicemail: (
    <>
      <circle cx="4.8" cy="8.5" r="2.3" />
      <circle cx="11.2" cy="8.5" r="2.3" />
      <path d="M4.8 10.8h6.4" />
    </>
  ),
  headphones: (
    <>
      <path d="M2.8 10V8a5.2 5.2 0 0 1 10.4 0v2" />
      <rect x="2" y="9.5" width="3" height="4" rx="1.2" />
      <rect x="11" y="9.5" width="3" height="4" rx="1.2" />
    </>
  ),
  chat: (
    <>
      <path d="M6.2 3C3.9 3 2 4.5 2 6.4c0 1 .5 1.9 1.4 2.5L3 10.6l1.9-1c.4.1.9.2 1.3.2 2.3 0 4.2-1.5 4.2-3.4S8.5 3 6.2 3Z" />
      <path d="M10.5 7c2 .2 3.5 1.5 3.5 3.1 0 .9-.5 1.700-1.3 2.200l.3 1.600-1.700-.9c-.4.1-.8.200-1.200.200-1.300 0-2.400-.5-3-1.300" />
    </>
  ),
  mic: (
    <>
      <rect x="6" y="2" width="4" height="7" rx="2" />
      <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2M5.8 14h4.4" />
    </>
  ),
  gift: (
    <>
      <rect x="2.5" y="6" width="11" height="3" rx="0.8" />
      <path d="M3.5 9v4.2h9V9M8 6v7.2M8 6c-1.600 0-3-.5-3-1.800S6.400 2.700 8 6Zm0 0c1.600 0 3-.5 3-1.800S9.600 2.700 8 6Z" />
    </>
  ),
  bolt: <path d="M9 2 3.800 9h3.700L7 14l5.200-7H8.500Z" />
};

function ServiceIcon({ name }: { name: IconKey }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "left" ? "M10 3.500 5.500 8l4.500 4.500" : "M6 3.500 10.500 8 6 12.500"} />
  </svg>
);

/* ────────────────────────────── Card ────────────────────────────── */

function ServiceCard({ s, index }: { s: Service; index: number }) {
  return (
    <article
      className="sv-rise overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-[0_1px_2px_rgba(30,27,75,0.04),0_14px_34px_-18px_rgba(79,70,229,0.28)] transition-transform duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-[#0A0F1E] dark:shadow-none"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Gradient header */}
      <div
        className="relative flex h-[190px] flex-col justify-between p-[18px]"
        style={{ background: `linear-gradient(135deg, ${s.from} 0%, ${s.to} 100%)` }}
      >
        <div className="flex items-start justify-between">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
            <ServiceIcon name={s.icon} />
          </span>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded bg-white/20 px-2 py-1 text-[9px] tracking-wide text-white ${mono}`}>{s.code}</span>
            <span className={`rounded-full border border-white/30 px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-white/80 ${mono}`}>
              {s.category}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-[20px] font-medium tracking-tight text-white">{s.name}</h3>
          <p className="mt-1.5 max-w-[92%] text-[12px] font-light leading-[1.55] text-white/75">{s.description}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-[18px] pb-[18px] pt-4">
        <p className={`text-[9px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 ${mono}`}>
          Required capabilities
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.capabilities.map((c) => (
            <span
              key={c}
              className="rounded-md bg-violet-50 px-2 py-1 text-[10px] text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span
            className={
              "flex items-center gap-1.5 text-[11px] " +
              (s.status === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")
            }
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {s.status}
          </span>
          <button
            type="button"
            aria-label={`Configure ${s.name}`}
            className="h-8 rounded-lg bg-[#12111F] px-3.5 text-[11px] text-white transition-colors hover:bg-[#241f3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Configure service
          </button>
        </div>
      </div>
    </article>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function ProductCataloguePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All services");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (tab === "All services" ? SERVICES : SERVICES.filter((s) => s.category === tab)),
    [tab]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="relative bg-[#F7F6FC] dark:bg-transparent">
      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .sv-rise { opacity: 0; animation: sv-rise .55s cubic-bezier(.22,1,.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) { .sv-rise { animation: none; opacity: 1; } }
      `}</style>

      <div className="relative mx-auto flex flex-col gap-6 p-5 sm:p-6">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-[9px] uppercase tracking-[0.3em] text-violet-500 ${mono}`}>Value-added services</p>
            <h2 className="mt-2.5 text-[26px] font-light tracking-tight text-slate-900 dark:text-white">
              Product <span className="font-medium text-violet-600">Catalogue</span>
            </h2>
            <p className="mt-2 text-[12px] font-light text-slate-500 dark:text-slate-400">
              Define and manage the Value-Added Services offered on the platform.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded bg-violet-700 px-4 text-[12px] text-white cursor-pointer transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
          >
            <span aria-hidden="true" className="text-[18px] leading-none">+</span>
            Create new service
          </button>
        </header>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="Service category"
          className="inline-flex w-fit max-w-full overflow-x-auto rounded-xl bg-white p-1 shadow-[0_1px_2px_rgba(30,27,75,0.04),0_8px_22px_-14px_rgba(79,70,229,0.25)] dark:bg-slate-900"
        >
          {TABS.map((t) => {
            const on = tab === t;
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={
                  "h-8 shrink-0 rounded cursor-pointer px-4 text-[12px] outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-violet-500/40 " +
                  (on
                    ? "bg-violet-600 to-violet-600 text-white "
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white")
                }
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {visible.length > 0 ? (
          <section
            key={`${tab}-${current}`}
            aria-label="Services"
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {visible.map((s, i) => (
              <ServiceCard key={s.code} s={s} index={i} />
            ))}
          </section>
        ) : (
          <p className="rounded-2xl bg-white py-16 text-center text-[13px] text-slate-400 dark:bg-slate-900">
            No services in this category yet. Create one to get started.
          </p>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <nav
            aria-label="Pagination"
            className="mx-auto mt-1 flex items-center gap-1 rounded-xl bg-white p-1.5 shadow-[0_1px_2px_rgba(30,27,75,0.04),0_8px_22px_-14px_rgba(79,70,229,0.25)] dark:bg-slate-900"
          >
            <button
              type="button"
              aria-label="Previous page"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
              className="flex h-8 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors enabled:hover:bg-slate-50 enabled:hover:text-slate-800 disabled:opacity-50 dark:enabled:hover:bg-slate-800"
            >
              <Chevron dir="left" />
            </button>
            <span className={`px-3 text-[10px] tabular-nums text-slate-600 dark:text-slate-300 ${mono}`} aria-live="polite">
              {current} / {pages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
              className="flex h-8 w-9 items-center justify-center rounded-lg text-slate-800 transition-colors enabled:hover:bg-slate-50 disabled:text-slate-300 dark:text-slate-200 dark:enabled:hover:bg-slate-800"
            >
              <Chevron dir="right" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}