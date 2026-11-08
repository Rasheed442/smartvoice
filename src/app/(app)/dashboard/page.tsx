"use client";

import { Icon, IconName } from "@/components/Icon";
import { useEffect, useState, type PointerEvent, type ReactNode } from "react";

/* ────────────────────────────── Data ────────────────────────────── */

type Stat = {
  label: string;
  value: number;
  decimals: number;
  suffix?: string;
  delta: string;
  context?: string;
  tone: "good" | "bad" | "muted";
  trend?: "up" | "down";
  icon: IconName;
  from: string;
  to: string;
  spark: number[];
};

const STATS: Stat[] = [
  {
    label: "Total Tenants",
    value: 24,
    decimals: 0,
    delta: "+2",
    context: "This month",
    tone: "good",
    trend: "up",
    icon: "tenants",
    from: "#818CF8",
    to: "#4F46E5",
    spark: [18, 18, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24]
  },
  {
    label: "Active Subscribers",
    value: 842.6,
    decimals: 1,
    suffix: "K",
    delta: "12.4%",
    context: "vs last month",
    tone: "good",
    trend: "up",
    icon: "subscribers",
    from: "#34D399",
    to: "#059669",
    spark: [701, 712, 725, 738, 751, 765, 780, 798, 812, 826, 838, 842.6]
  },
  {
    label: "Provisioning Success",
    value: 98.2,
    decimals: 1,
    suffix: "%",
    delta: "Last 24h",
    tone: "muted",
    icon: "check",
    from: "#2DD4BF",
    to: "#0D9488",
    spark: [97.1, 97.8, 97.4, 98.0, 97.6, 98.3, 98.1, 98.5, 98.0, 98.4, 98.1, 98.2]
  },
  {
    label: "Failed Transactions",
    value: 142,
    decimals: 0,
    delta: "12",
    context: "vs yesterday",
    tone: "bad",
    trend: "up",
    icon: "alert",
    from: "#FB7185",
    to: "#E11D48",
    spark: [96, 110, 104, 120, 118, 131, 125, 138, 129, 135, 130, 142]
  }
];

const PILL = {
  good: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  bad: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
  muted:
    "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/30"
};

const RANGES = [
  { key: "7", label: "7D" },
  { key: "30", label: "30D" },
  { key: "90", label: "90D" }
];

/** Net new subscribers per bucket (K). Totals are derived from TOTAL_SUBS. */
const SERIES: Record<string, { labels: string[]; added: number[]; unit: string }> = {
  "7": {
    labels: ["Nov 17", "Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22", "Nov 23"],
    added: [3.1, 2.8, 3.7, 3.2, 2.5, 2.4, 1.7],
    unit: "per day"
  },
  "30": {
    labels: ["Nov 4", "Nov 8", "Nov 12", "Nov 16", "Nov 20", "Nov 23"],
    added: [17.9, 19.6, 18.4, 16.2, 13.1, 7.8],
    unit: "per 4 days"
  },
  "90": {
    labels: ["Sep 7", "Sep 21", "Oct 5", "Oct 19", "Nov 2", "Nov 16", "Nov 23"],
    added: [22.4, 23.9, 21.7, 24.6, 25.8, 22.5, 11.3],
    unit: "per 2 weeks"
  }
};

const TOTAL_SUBS = 842.6;

const STATUS = [
  { label: "Active", pct: 75, color: "#14B8A6" },
  { label: "Pending", pct: 15, color: "#6366F1" },
  { label: "Suspended", pct: 7, color: "#F59E0B" },
  { label: "Expired", pct: 3, color: "#94A3B8" }
];

type Health = {
  group: string;
  name: string;
  icon: IconName;
  metric: string;
  metricLabel: string;
  last: string;
  state: "ok" | "warn";
  /** One character per recent check: o = healthy, w = degraded */
  history: string;
};

const hist = (warn: number[] = []) =>
  Array.from({ length: 30 }, (_, i) => (warn.includes(i) ? "w" : "o")).join("");

const HEALTH: Health[] = [
  { group: "Charging", name: "MTN-NG Direct", icon: "subscriptions", metric: "124 ms", metricLabel: "Latency", last: "2m ago", state: "ok", history: hist([9]) },
  { group: "CRBT / CMS", name: "Huawei CRBT v3", icon: "catalogue", metric: "99.98%", metricLabel: "Uptime", last: "15s ago", state: "ok", history: hist() },
  { group: "DS-SDP", name: "Ericsson SDP", icon: "operators", metric: "100%", metricLabel: "Success rate", last: "5m ago", state: "ok", history: hist([21]) },
  { group: "SMS gateway", name: "SMPP Node 1", icon: "connections", metric: "Slow", metricLabel: "Response time", last: "10s ago", state: "warn", history: hist([14, 22, 25, 26, 27, 28, 29]) },
  { group: "WhatsApp", name: "Meta Cloud API", icon: "subscribers", metric: "42", metricLabel: "Active sessions", last: "1m ago", state: "ok", history: hist() },
  { group: "Audio generation", name: "SmartVoice AI", icon: "wave", metric: "0", metricLabel: "In queue", last: "30m ago", state: "ok", history: hist([4]) }
];

const ACTIVITY: {
  who: string;
  what: string;
  when: string;
  category: string;
  icon: IconName;
  chip: string;
}[] = [
  {
    who: "Tenant Alpha",
    what: "Provisioned 12 new SIP trunks",
    when: "2m ago",
    category: "Provisioning",
    icon: "connections",
    chip: "bg-indigo-50 text-indigo-600 ring-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20"
  },
  {
    who: "Tenant Beta",
    what: "Updated call routing rules",
    when: "18m ago",
    category: "Routing",
    icon: "settings",
    chip: "bg-violet-50 text-violet-600 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20"
  },
  {
    who: "System",
    what: "Nightly backup completed",
    when: "1h ago",
    category: "System",
    icon: "check",
    chip: "bg-emerald-50 text-emerald-600 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"
  },
  {
    who: "Tenant Gamma",
    what: "Enabled failover gateway",
    when: "3h ago",
    category: "Failover",
    icon: "operators",
    chip: "bg-teal-50 text-teal-600 ring-teal-600/10 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20"
  }
];

/* ────────────────────────────── Helpers ────────────────────────────── */

function useCountUp(target: number, decimals: number, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value.toFixed(decimals);
}

/** Smooth path through points using horizontal-tangent cubic curves */
function smoothPath(xs: number[], ys: number[]) {
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const mx = (xs[i - 1] + xs[i]) / 2;
    d += ` C${mx},${ys[i - 1]} ${mx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return d;
}

const card =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.10)] " +
  "dark:border-slate-800 dark:bg-[#0A0F1E] dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.02]";

function Arrow({ up = true }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={`h-3 w-3 ${up ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
    </svg>
  );
}

function Pill({ tone, children }: { tone: keyof typeof PILL; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-light ring-1 ring-inset ${PILL[tone]}`}>
      {children}
    </span>
  );
}

/* ────────────────────────────── Stat card ────────────────────────────── */

/**
 * Divider visibility per cell for the three layouts:
 * 1 column (default) → horizontal lines between rows
 * 2 columns (sm)      → one vertical + one horizontal
 * 4 columns (xl)      → vertical lines only
 */
const DIVIDERS = [
  { h: "hidden", v: "hidden" },
  { h: "block sm:hidden", v: "hidden sm:block" },
  { h: "block xl:hidden", v: "hidden xl:block" },
  { h: "block xl:hidden", v: "hidden sm:block" }
];

function StatCell({ stat, index }: { stat: Stat; index: number }) {
  const shown = useCountUp(stat.value, stat.decimals);
  const d = DIVIDERS[index];
  const line = "pointer-events-none absolute bg-slate-200/90 dark:bg-slate-800";

  return (
    <div className="group relative p-6 transition-colors duration-300 hover:bg-slate-50/60 dark:hover:bg-white/[0.012]">
      {/* Inset dividers: they stop short of the card edges */}
      <span aria-hidden="true" className={`${line} inset-y-5 left-0 w-px ${d.v}`} />
      <span aria-hidden="true" className={`${line} inset-x-5 top-0 h-px ${d.h}`} />

      {/* Accent hairline along the top edge of each cell */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${stat.from}, ${stat.to} 45%, transparent 100%)` }}
        />
        {/* Slow light that travels along the line */}
        <span
          className="sv-sweep absolute inset-y-0 left-0 w-2/5"
          style={{
            background: `linear-gradient(90deg, transparent, ${stat.from}, ${stat.to}, transparent)`,
            animationDelay: `${index * 0.7}s`
          }}
        />
      </div>

      <div className="flex items-start justify-between">
        <p className="text-sm font-light text-slate-500 dark:text-slate-400">{stat.label}</p>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${stat.to}12`,
            color: stat.to,
            boxShadow: `inset 0 0 0 1px ${stat.to}26`
          }}
        >
          <Icon name={stat.icon} className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </span>
      </div>

      <p className="mt-5 text-[34px] font-medium leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
        {shown}
        {stat.suffix}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <Pill tone={stat.tone}>
          {stat.trend && <Arrow up={stat.trend === "up"} />}
          {stat.delta}
        </Pill>
        {stat.context && (
          <span className="text-xs text-slate-400 dark:text-slate-500">{stat.context}</span>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────── Growth chart ────────────────────────────── */

const W = 720;
const H = 320;
const PL = 46;
const PR = 16;
const PT = 16;
const PB = 34;

function GrowthChart({ range }: { range: string }) {
  const { labels, added } = SERIES[range];
  const [hover, setHover] = useState<number | null>(null);

  const n = added.length;
  const sum = added.reduce((a, b) => a + b, 0);
  const startTotal = TOTAL_SUBS - sum;
  const avg = sum / n;
  const max = Math.max(...added);
  const step = max <= 5 ? 1 : max <= 15 ? 5 : 10;
  const hi = Math.ceil((max * 1.12) / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= hi; t += step) ticks.push(t);

  const yOf = (v: number) => PT + (1 - v / hi) * (H - PT - PB);
  const slot = (W - PL - PR) / n;
  const barW = Math.min(48, slot * 0.5);
  const cx = (i: number) => PL + slot * i + slot / 2;
  const last = n - 1;
  const active = hover ?? last;

  const cumulative = (i: number) =>
    startTotal + added.slice(0, i + 1).reduce((a, b) => a + b, 0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.min(n - 1, Math.max(0, Math.floor((x - PL) / slot)));
    setHover(idx);
  };

  return (
    <div
      className="relative w-full touch-pan-y"
      style={{ aspectRatio: `${W} / ${H}` }}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Net new subscribers per period">
        <defs>
          <linearGradient id="sv-bar-on" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="sv-bar-off" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* Grid + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PL}
              x2={W - PR}
              y1={yOf(t)}
              y2={yOf(t)}
              className={t === 0 ? "stroke-slate-200 dark:stroke-slate-700" : "stroke-slate-200/80 dark:stroke-slate-800"}
              strokeWidth="1"
              strokeDasharray={t === 0 ? undefined : "2 6"}
            />
            <text x={PL - 12} y={yOf(t) + 4} textAnchor="end" className="fill-slate-400 dark:fill-slate-500" fontSize="11.5">
              {t}K
            </text>
          </g>
        ))}

        {/* Hover column highlight */}
        {labels.map((_, i) => (
          <rect
            key={i}
            x={PL + slot * i + 4}
            y={PT}
            width={slot - 8}
            height={H - PT - PB}
            rx="12"
            className="fill-slate-100/80 dark:fill-slate-800/40"
            style={{ opacity: hover === i ? 1 : 0, transition: "opacity 200ms" }}
          />
        ))}

        {/* Bars (re-keyed so they grow again when the range changes) */}
        <g key={range}>
          {added.map((v, i) => {
            const isActive = active === i;
            return (
              <rect
                key={i}
                x={cx(i) - barW / 2}
                y={yOf(v)}
                width={barW}
                height={H - PB - yOf(v)}
                rx={Math.min(12, barW / 2)}
                fill={isActive ? "url(#sv-bar-on)" : "url(#sv-bar-off)"}
                className="sv-grow"
                style={{
                  animationDelay: `${i * 70}ms`,
                  filter: isActive ? "drop-shadow(0 8px 14px rgba(99,102,241,0.38))" : "none",
                  transition: "filter 250ms"
                }}
              />
            );
          })}
        </g>

        {/* Average reference line */}
        <g>
          <line
            x1={PL}
            x2={W - PR}
            y1={yOf(avg)}
            y2={yOf(avg)}
            className="stroke-indigo-400/70 dark:stroke-indigo-300/50"
            strokeWidth="1.25"
            strokeDasharray="5 5"
          />
          <rect
            x={W - PR - 74}
            y={yOf(avg) - 11}
            width="74"
            height="22"
            rx="11"
            className="fill-white stroke-indigo-200 dark:fill-[#0A0F1E] dark:stroke-indigo-400/30"
          />
          <text x={W - PR - 37} y={yOf(avg) + 4} textAnchor="middle" className="fill-indigo-600 dark:fill-indigo-300" fontSize="11" fontWeight="500">
            Avg {avg.toFixed(1)}K
          </text>
        </g>

        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={l}
            x={cx(i)}
            y={H - 9}
            textAnchor="middle"
            className={`transition-colors duration-200 ${active === i ? "fill-slate-800 dark:fill-slate-100" : "fill-slate-400 dark:fill-slate-500"}`}
            fontSize="11.5"
            fontWeight={active === i ? 500 : 400}
          >
            {l}
          </text>
        ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-[#0D1324]"
          style={{
            left: `${Math.min(86, Math.max(14, (cx(hover) / W) * 100))}%`,
            top: `${(yOf(added[hover]) / H) * 100}%`
          }}
        >
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{labels[hover]}</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-slate-900 dark:text-white">
            +{added[hover].toFixed(1)}K <span className="font-normal text-slate-500 dark:text-slate-400">net new</span>
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-slate-400 dark:text-slate-500">
            Total {cumulative(hover).toFixed(1)}K
          </p>
        </div>
      )}
    </div>
  );
}

function RangeSwitch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const idx = Math.max(0, RANGES.findIndex((r) => r.key === value));
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="relative grid grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-slate-700"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
      {RANGES.map((r) => (
        <button
          key={r.key}
          role="tab"
          type="button"
          aria-selected={value === r.key}
          onClick={() => onChange(r.key)}
          className={
            "relative z-10 h-8 w-14 rounded-lg text-xs font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
            (value === r.key
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200")
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────────── Donut ────────────────────────────── */

function StatusDonut() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const R = 78;
  const C = 2 * Math.PI * R;
  const GAP = 3;
  let cum = 0;

  const focus = active !== null ? STATUS[active] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[210px] w-[210px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label="Subscription status distribution">
          <circle cx="100" cy="100" r={R} fill="none" strokeWidth="22" className="stroke-slate-100 dark:stroke-slate-800/70" />
          {STATUS.map((s, i) => {
            const len = (s.pct / 100) * C - GAP;
            const offset = (cum / 100) * C;
            cum += s.pct;
            return (
              <circle
                key={s.label}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={active === i ? 25 : 22}
                strokeDasharray={`${mounted ? len : 0} ${C}`}
                strokeDashoffset={-offset}
                opacity={active === null || active === i ? 1 : 0.28}
                style={{
                  transition: `stroke-dasharray 900ms cubic-bezier(.22,1,.36,1) ${i * 120}ms, stroke-width 200ms, opacity 200ms`
                }}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[28px] font-medium leading-none tabular-nums text-slate-900 dark:text-white">
            {focus ? `${focus.pct}%` : `${TOTAL_SUBS}K`}
          </span>
          <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {focus ? focus.label : "Total subscribers"}
          </span>
        </div>
      </div>

      <ul className="mt-8 w-full space-y-1">
        {STATUS.map((s, i) => (
          <li
            key={s.label}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            className={
              "rounded-xl px-3 py-2.5 transition-colors duration-200 " +
              (active === i ? "bg-slate-50 dark:bg-slate-800/40" : "")
            }
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="flex items-baseline gap-3 tabular-nums">
                <span className="text-slate-900 dark:text-white">{((TOTAL_SUBS * s.pct) / 100).toFixed(1)}K</span>
                <span className="w-9 text-right text-xs text-slate-400 dark:text-slate-500">{s.pct}%</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${s.pct}%` : "0%",
                  backgroundColor: s.color,
                  transition: `width 1000ms cubic-bezier(.22,1,.36,1) ${300 + i * 120}ms`
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────── Health cell ────────────────────────────── */

function HealthCell({ h, index }: { h: Health; index: number }) {
  const ok = h.state === "ok";
  return (
    <div
      className={
        "sv-rise p-5 " +
        (ok ? "bg-white dark:bg-[#0A0F1E]" : "bg-amber-50/60 dark:bg-[#14110A]")
      }
      style={{ animationDelay: `${660 + index * 60}ms` }}
    >
      {/* Identity + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset " +
              (ok
                ? "bg-slate-50 text-slate-500 ring-slate-200/80 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/60"
                : "bg-amber-100/70 text-amber-600 ring-amber-300/50 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20")
            }
          >
            <Icon name={h.icon} className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-medium text-slate-900 dark:text-white">{h.name}</p>
            <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{h.group}</p>
          </div>
        </div>

        <span
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset " +
            (ok
              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"
              : "bg-amber-100/80 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20")
          }
        >
          <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
          {ok ? "Operational" : "Degraded"}
        </span>
      </div>

      {/* Key metric */}
      <div className="mt-5 flex items-baseline gap-2">
        <span
          className={
            "text-[22px] font-medium leading-none tabular-nums " +
            (ok ? "text-slate-900 dark:text-white" : "text-amber-700 dark:text-amber-300")
          }
        >
          {h.metric}
        </span>
        <span className="text-[13px] text-slate-500 dark:text-slate-400">{h.metricLabel}</span>
      </div>

      {/* Recent check history */}
      <div className="mt-4 flex h-7 items-stretch gap-[3px]" role="img" aria-label={`Last 30 checks for ${h.name}`}>
        {h.history.split("").map((c, i) => (
          <span
            key={i}
            title={c === "o" ? "Healthy" : "Degraded"}
            className={
              "sv-bar flex-1 rounded-[3px] " +
              (c === "o" ? "bg-emerald-400/80 dark:bg-emerald-400/60" : "bg-amber-400")
            }
            style={{ animationDelay: `${700 + index * 60 + i * 14}ms` }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>Last 30 checks</span>
        <span>Checked {h.last}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function DashboardPage() {
  const [range, setRange] = useState("30");

  const series = SERIES[range];
  const netNew = series.added.reduce((a, b) => a + b, 0);
  const growth = (netNew / (TOTAL_SUBS - netNew)) * 100;
  const avgAdded = netNew / series.added.length;
  const peakIdx = series.added.indexOf(Math.max(...series.added));
  const okCount = HEALTH.filter((h) => h.state === "ok").length;

  return (
    <div className="relative">
      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sv-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes sv-sweep { 0% { transform: translateX(-100%); opacity: 0; } 15% { opacity: 1; } 75% { opacity: 1; } 100% { transform: translateX(250%); opacity: 0; } }
        .sv-sweep { animation: sv-sweep 5s cubic-bezier(.4,0,.2,1) infinite; }
        @keyframes sv-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .sv-grow { transform-box: fill-box; transform-origin: 50% 100%; animation: sv-grow .8s cubic-bezier(.22,1,.36,1) backwards; }
        @keyframes sv-bar { from { transform: scaleY(0.15); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        .sv-bar { transform-origin: bottom; animation: sv-bar .55s cubic-bezier(.22,1,.36,1) backwards; }
        .sv-rise { opacity: 0; animation: sv-rise .7s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-fade { opacity: 0; animation: sv-fade 1.1s ease-out .45s forwards; }
        .sv-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: sv-draw 1.3s cubic-bezier(.22,1,.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .sv-rise, .sv-fade { animation: none; opacity: 1; }
          .sv-draw { animation: none; stroke-dashoffset: 0; }
          .sv-bar, .sv-grow { animation: none; }
          .sv-sweep { animation: none; opacity: 0; }
        }
      `}</style>

      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.09),transparent_70%)] dark:bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto flex  flex-col gap-8 p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="sv-rise flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
              Platform Overview
            </h2>
            <p className="mt-1 text-[15px] font-light text-slate-500 dark:text-slate-400">
              Real-time health and business activity across the platform.
            </p>
          </div>
          <p className="rounded border border-slate-300 bg-white/70 px-3 py-1.5 text-xs text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            Updated just now
          </p>
        </header>

        {/* Stats */}
        <section
          aria-label="Key metrics"
          className={`sv-rise ${card} grid grid-cols-1 overflow-hidden sm:grid-cols-2 xl:grid-cols-4`}
          style={{ animationDelay: "120ms" }}
        >
          {STATS.map((s, i) => (
            <StatCell key={s.label} stat={s} index={i} />
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className={`sv-rise ${card} p-6 xl:col-span-8`} style={{ animationDelay: "420ms" }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-[14px] font-light text-slate-500 dark:text-white">Subscriber Growth</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[30px] font-medium leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {TOTAL_SUBS.toFixed(1)}K
                  </span>
                  <Pill tone="good">
                    <Arrow />
                    {growth.toFixed(1)}%
                  </Pill>
                </div>
              </div>
              <RangeSwitch value={range} onChange={setRange} />
            </div>

            {/* Period summary */}
            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60 dark:divide-slate-800 dark:border-slate-800 dark:bg-white/[0.015]">
              {[
                { k: "Net new", v: `+${netNew.toFixed(1)}K`, s: "this period" },
                { k: "Average", v: `${avgAdded.toFixed(1)}K`, s: series.unit },
                { k: "Best period", v: `+${series.added[peakIdx].toFixed(1)}K`, s: series.labels[peakIdx] }
              ].map((m) => (
                <div key={m.k} className="px-4 py-3">
                  <p className="text-[14px] text-slate-400 dark:text-slate-500">{m.k}</p>
                  <p className="mt-1 text-[17px] font-medium tabular-nums text-slate-900 dark:text-white">{m.v}</p>
                  <p className="mt-0.5 text-[14px] text-slate-400 dark:text-slate-500">{m.s}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <GrowthChart range={range} />
            </div>
          </div>

          <div className={`sv-rise ${card} p-6 xl:col-span-4`} style={{ animationDelay: "500ms" }}>
            <div className="mb-6">
              <h3 className="text-[14px] font-light text-slate-500 dark:text-white">Subscription Status</h3>
              <p className="mt-2 text-[17px] font-light text-slate-900 dark:text-white">
                Share of subscribers by state
              </p>
            </div>
            <StatusDonut />
          </div>
        </section>

        {/* Operational health */}
        <section
          aria-label="Operational health"
          className={`sv-rise ${card} overflow-hidden`}
          style={{ animationDelay: "580ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-light text-slate-900 dark:text-white">Operational Health</h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Status of connected services and gateways
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-3 text-xs text-slate-400 sm:flex dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-1 rounded-sm bg-emerald-400/80" />
                  Healthy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-1 rounded-sm bg-amber-400" />
                  Degraded
                </span>
              </span>
              <Pill tone={okCount === HEALTH.length ? "good" : "muted"}>
                {okCount} of {HEALTH.length} operational
              </Pill>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3 dark:bg-slate-800/80">
            {HEALTH.map((h, i) => (
              <HealthCell key={h.name} h={h} index={i} />
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className={`sv-rise ${card} overflow-hidden`} style={{ animationDelay: "1000ms" }}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-medium text-slate-900 dark:text-white">Recent activity</h3>
              <p className="mt-0.5 text-sm text-slate-400 font-light dark:text-slate-400">
                Latest changes across tenants and the system
              </p>
            </div>
            <button
              type="button"
              className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            >
              View all
              <Icon name="chevron" className="h-3.5 w-3.5 -rotate-90" />
            </button>
          </div>

          {/* Column labels */}
          <div className="hidden grid-cols-[minmax(0,1fr)_140px_96px] gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-xs text-slate-400 md:grid dark:border-slate-800 dark:bg-white/[0.015] dark:text-slate-500">
            <span>Event</span>
            <span>Category</span>
            <span className="text-right">Time</span>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {ACTIVITY.map((a) => (
              <li
                key={a.what}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3.5 transition-colors duration-200 hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_140px_96px] dark:hover:bg-slate-800/20"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${a.chip}`}>
                    <Icon name={a.icon} className="h-[17px] w-[17px]" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{a.who}</p>
                    <p className="mt-1 truncate text-[13px] text-slate-500 dark:text-slate-400">{a.what}</p>
                  </div>
                </div>
                <span className="hidden md:block">
                  <Pill tone="muted">{a.category}</Pill>
                </span>
                <span className="text-right text-xs tabular-nums text-slate-400 dark:text-slate-500">{a.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}