"use client";

import { Icon, IconName } from "@/components/Icon";
import { useMemo, useState, type ReactNode } from "react";

/* ────────────────────────────── Data ────────────────────────────── */

type OpStatus = "Active" | "Degraded" | "Onboarding";

type Operator = {
  name: string;
  mcc: string;
  mnc: string;
  cc: string;
  country: string;
  networkId: string;
  connections: number;
  status: OpStatus;
  capabilities: string[];
};

const OPERATORS: Operator[] = [
  { name: "MTN Nigeria", mcc: "621", mnc: "30", cc: "NG", country: "Nigeria", networkId: "MTN-NG-01", connections: 32, status: "Active", capabilities: ["Charging", "CRBT", "SMS", "USSD", "WhatsApp", "Voice"] },
  { name: "Airtel Nigeria", mcc: "621", mnc: "20", cc: "NG", country: "Nigeria", networkId: "AIRTEL-NG-01", connections: 28, status: "Active", capabilities: ["Charging", "USSD", "WhatsApp"] },
  { name: "Glo Mobile", mcc: "621", mnc: "50", cc: "NG", country: "Nigeria", networkId: "GLO-NG-01", connections: 9, status: "Degraded", capabilities: ["Charging", "SMS"] },
  { name: "9mobile", mcc: "621", mnc: "60", cc: "NG", country: "Nigeria", networkId: "9MOB-NG-01", connections: 6, status: "Active", capabilities: ["Charging", "CRBT", "SMS"] },
  { name: "MTN Ghana", mcc: "620", mnc: "01", cc: "GH", country: "Ghana", networkId: "MTN-GH-01", connections: 5, status: "Active", capabilities: ["Charging", "SMS", "USSD", "CRBT"] },
  { name: "Vodafone Ghana", mcc: "620", mnc: "02", cc: "GH", country: "Ghana", networkId: "VODA-GH-01", connections: 3, status: "Onboarding", capabilities: ["SMS"] },
  { name: "Safaricom", mcc: "639", mnc: "02", cc: "KE", country: "Kenya", networkId: "SAF-KE-01", connections: 1, status: "Active", capabilities: ["Charging", "USSD", "WhatsApp", "SMS", "CRBT"] },
  { name: "Airtel Kenya", mcc: "639", mnc: "03", cc: "KE", country: "Kenya", networkId: "AIRTEL-KE-01", connections: 0, status: "Onboarding", capabilities: ["SMS", "USSD"] },
  { name: "AirtelTigo Ghana", mcc: "620", mnc: "06", cc: "GH", country: "Ghana", networkId: "AT-GH-01", connections: 0, status: "Onboarding", capabilities: ["SMS"] },
  { name: "Telkom Kenya", mcc: "639", mnc: "07", cc: "KE", country: "Kenya", networkId: "TELKOM-KE-01", connections: 0, status: "Onboarding", capabilities: ["SMS", "USSD"] },
  { name: "Vodacom Tanzania", mcc: "640", mnc: "04", cc: "TZ", country: "Tanzania", networkId: "VODA-TZ-01", connections: 0, status: "Onboarding", capabilities: ["Charging"] },
  { name: "Tigo Tanzania", mcc: "640", mnc: "02", cc: "TZ", country: "Tanzania", networkId: "TIGO-TZ-01", connections: 0, status: "Onboarding", capabilities: ["SMS"] }
];

const FILTERS = ["All", "Active", "Degraded", "Onboarding"] as const;
type Filter = (typeof FILTERS)[number];

const PAGE_SIZE = 8;
const MAX_CHIPS = 3;

const STATUS_STYLE: Record<OpStatus, { pill: string; dot: string }> = {
  Active: {
    pill: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-300/20",
    dot: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.85)]"
  },
  Degraded: {
    pill: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-300/20",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)]"
  },
  Onboarding: {
    pill: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/[0.06]",
    dot: "bg-slate-400"
  }
};

const mono = "font-mono";

const card =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(99,102,241,0.12)] " +
  "dark:border-white/[0.08] dark:bg-[#060A17]/90 dark:backdrop-blur-sm dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03]";

/* ────────────────────────────── Small icons ────────────────────────────── */

function Svg({ children, className = "h-4 w-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const PlusIcon = () => (
  <Svg>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
    <path d="M2 3h12l-4.6 5.4V13l-2.8-1.4V8.4z" />
  </svg>
);
const DownloadIcon = () => (
  <Svg className="h-3.5 w-3.5">
    <path d="M8 2.5v8M4.8 7.6 8 10.8l3.2-3.2M3 13h10" />
  </Svg>
);
const EyeIcon = () => (
  <Svg>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="1.9" />
  </Svg>
);
const DotsIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
    <circle cx="3.5" cy="8" r="1.1" />
    <circle cx="8" cy="8" r="1.1" />
    <circle cx="12.5" cy="8" r="1.1" />
  </svg>
);
const GlobeIcon = () => (
  <Svg className="h-[18px] w-[18px]">
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8h12M8 2c2 1.8 2.9 3.8 2.9 6S10 12.2 8 14c-2-1.8-2.9-3.8-2.9-6S6 3.8 8 2z" />
  </Svg>
);
const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <Svg className="h-3.5 w-3.5">
    <path d={dir === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} />
  </Svg>
);

/* ────────────────────────────── Pieces ────────────────────────────── */

function StatCard({
  label,
  value,
  tone = "indigo",
  delta,
  icon,
  index
}: {
  label: string;
  value: number;
  tone?: "indigo" | "teal";
  delta?: string;
  icon: ReactNode;
  index: number;
}) {
  return (
    <div className={`sv-rise ${card} flex items-center gap-4 p-5`} style={{ animationDelay: `${index * 70}ms` }}>
      <span
        className={
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset " +
          (tone === "teal"
            ? "bg-teal-50 text-teal-600 ring-teal-500/20 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-300/20 shadow-[0_0_16px_-4px_rgba(45,212,191,0.4)]"
            : "bg-indigo-50 text-indigo-600 ring-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-300/25 shadow-[0_0_16px_-4px_rgba(129,140,248,0.5)]")
        }
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-light text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[30px] font-light leading-none tabular-nums text-slate-900 dark:text-white">
          {value}
          {delta && (
            <span className={`flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 ${mono}`}>
              <svg viewBox="0 0 12 12" className="h-2 w-2" fill="currentColor" aria-hidden="true">
                <path d="M6 2.5 10.5 9.5h-9z" />
              </svg>
              {delta}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: OpStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function Chip({ children, more = false }: { children: ReactNode; more?: boolean }) {
  return (
    <span
      className={
        "rounded-md px-2 py-1 text-[11px] " +
        (more
          ? `border border-slate-200 bg-white text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400 ${mono}`
          : "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200/60 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-1 dark:ring-inset dark:ring-indigo-300/20")
      }
    >
      {children}
    </span>
  );
}

function IconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100"
    >
      {children}
    </button>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function OperatorHubPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);

  const stats = useMemo(
    () => ({
      operators: OPERATORS.length,
      connections: OPERATORS.reduce((a, o) => a + o.connections, 0),
      countries: new Set(OPERATORS.map((o) => o.cc)).size,
      failed: 0
    }),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OPERATORS.filter((o) => {
      if (filter !== "All" && o.status !== filter) return false;
      if (!q) return true;
      return [o.name, o.country, o.networkId, o.mcc, o.mnc, ...o.capabilities].some((v) =>
        v.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const exportCsv = () => {
    const head = ["Operator", "MCC", "MNC", "Country", "Network ID", "Connections", "Status", "Capabilities"];
    const body = filtered.map((o) =>
      [o.name, o.mcc, o.mnc, o.country, o.networkId, o.connections, o.status, o.capabilities.join("|")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "operators.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-full">
      {/* ── Atmosphere echoing sidebar glow ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[520px] w-[520px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_65%)]" />
        <div className="absolute right-0 top-32 h-[450px] w-[450px] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.04),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.08),transparent_65%)]" />
      </div>

      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .sv-rise { opacity: 0; animation: sv-rise .6s cubic-bezier(.22,1,.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) { .sv-rise { animation: none; opacity: 1; } }
      `}</style>

      <div className="relative mx-auto flex flex-col gap-6 p-5 sm:p-8">
        {/* Header */}
        <header className="sv-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 ${mono}`}>Network</p>
            <h2 className="mt-3 text-[30px] font-light tracking-tight text-slate-900 dark:text-white">
              Operator <span className="font-medium text-indigo-600 dark:text-indigo-400">Hub</span>
            </h2>
            <p className="mt-2 text-[13px] font-light text-slate-500 dark:text-slate-400">
              Manage telecommunications operator integrations and core network capabilities.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 text-[13px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(99,102,241,0.7)] ring-1 ring-white/20 transition-all hover:from-indigo-400 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            <PlusIcon />
            Add new operator
          </button>
        </header>

        {/* Stats */}
        <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard index={0} label="Active operators" value={stats.operators} icon={<Icon name={"operators" as IconName} className="h-[18px] w-[18px]" strokeWidth={1.7} />} />
          <StatCard index={1} label="Total connections" value={stats.connections} delta="6" icon={<Icon name={"connections" as IconName} className="h-[18px] w-[18px]" strokeWidth={1.7} />} />
          <StatCard index={2} label="Countries covered" value={stats.countries} icon={<GlobeIcon />} />
          <StatCard index={3} label="Failed integrations" value={stats.failed} tone="teal" icon={<Icon name={"check" as IconName} className="h-[18px] w-[18px]" strokeWidth={1.7} />} />
        </section>

        {/* Table card */}
        <section className={`sv-rise ${card} overflow-hidden`} style={{ animationDelay: "260ms" }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <label className="relative block w-full max-w-[304px]">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FilterIcon />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Filter operators…"
                  aria-label="Filter operators"
                  className="h-9 w-full rounded-lg border border-slate-200/80 bg-white pl-9 pr-3 text-[12px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-white/15 dark:focus:border-indigo-400 dark:focus:bg-white/[0.05]"
                />
              </label>

              <div role="tablist" aria-label="Status filter" className="inline-flex rounded-lg bg-slate-100 p-[3px] dark:bg-white/[0.04] dark:ring-1 dark:ring-inset dark:ring-white/[0.06]">
                {FILTERS.map((f) => {
                  const on = filter === f;
                  return (
                    <button
                      key={f}
                      role="tab"
                      type="button"
                      aria-selected={on}
                      onClick={() => {
                        setFilter(f);
                        setPage(1);
                      }}
                      className={
                        `h-7 rounded-md px-3 text-[10px] uppercase tracking-[0.1em] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${mono} ` +
                        (on
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 dark:bg-indigo-500 dark:shadow-indigo-500/40"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100")
                      }
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[12px] text-indigo-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-indigo-300 dark:hover:border-indigo-400/30 dark:hover:bg-indigo-400/10"
            >
              <DownloadIcon />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase tracking-[0.1em] text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400">
                  <th className="px-5 py-4 font-normal">Operator · MCC/MNC</th>
                  <th className="px-3 py-4 font-normal">Country</th>
                  <th className="px-3 py-4 font-normal">Network ID</th>
                  <th className="px-3 py-4 font-normal">Connections</th>
                  <th className="px-3 py-4 font-normal">Status</th>
                  <th className="px-3 py-4 font-normal">Capabilities</th>
                  <th className="px-5 py-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {rows.map((o) => {
                  const shown = o.capabilities.slice(0, MAX_CHIPS);
                  const extra = o.capabilities.length - shown.length;
                  return (
                    <tr key={o.networkId} className="transition-colors duration-200 hover:bg-indigo-50/25 dark:hover:bg-white/[0.025]">
                      <td className="px-5 py-4">
                        <p className="text-[13px] text-slate-900 dark:text-white">{o.name}</p>
                        <p className={`mt-1.5 text-[10px] tracking-wide text-slate-400 dark:text-slate-500 ${mono}`}>
                          MCC {o.mcc} · MNC {o.mnc}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <span className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
                          <span className={`rounded bg-slate-100 px-1.5 py-1 text-[8px] font-medium leading-none text-slate-500 dark:bg-white/[0.05] dark:text-slate-400 dark:ring-1 dark:ring-inset dark:ring-white/[0.06] ${mono}`}>
                            {o.cc}
                          </span>
                          {o.country}
                        </span>
                      </td>
                      <td className={`px-3 py-4 text-[11px] tracking-wide text-indigo-600 dark:text-indigo-400 ${mono}`}>{o.networkId}</td>
                      <td className="px-3 py-4 text-[13px] tabular-nums text-slate-800 dark:text-slate-100">{o.connections}</td>
                      <td className="px-3 py-4">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {shown.map((c) => (
                            <Chip key={c}>{c}</Chip>
                          ))}
                          {extra > 0 && <Chip more>+{extra}</Chip>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton label={`View ${o.name}`}>
                            <EyeIcon />
                          </IconButton>
                          <IconButton label={`More actions for ${o.name}`}>
                            <DotsIcon />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-[13px] text-slate-400 dark:text-slate-500">
                      No operators match your filters. Clear the search or choose another status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/[0.06]">
            <p className={`text-[10px] tracking-wide text-slate-500 dark:text-slate-400 ${mono}`}>
              Showing {rows.length} of {filtered.length} operators
            </p>
            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors enabled:hover:border-slate-300 enabled:hover:text-slate-800 disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-500 dark:enabled:hover:border-white/20 dark:enabled:hover:text-slate-200"
              >
                <ChevronIcon dir="left" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-current={p === current ? "page" : undefined}
                  onClick={() => setPage(p)}
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-lg text-[12px] transition-colors " +
                    (p === current
                      ? "bg-indigo-600 font-medium text-white shadow-[0_6px_14px_-6px_rgba(99,102,241,0.6)]"
                      : "border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-200")
                  }
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors enabled:hover:border-slate-300 enabled:hover:text-slate-900 disabled:text-slate-300 disabled:opacity-40 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400 dark:enabled:hover:border-white/20 dark:enabled:hover:text-slate-200"
              >
                <ChevronIcon dir="right" />
              </button>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}