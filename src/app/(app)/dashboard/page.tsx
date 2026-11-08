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
  tone: "good" | "bad" | "muted";
  trend?: "up" | "down";
  icon: IconName;
  from: string;
  to: string;
  spark: number[];
};

const STATS: Stat[] = [
  {
    label: "Total tenants",
    value: 24,
    decimals: 0,
    delta: "+2 this month",
    tone: "good",
    trend: "up",
    icon: "tenants",
    from: "#818CF8",
    to: "#4F46E5",
    spark: [18, 18, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24]
  },
  {
    label: "Active subscribers",
    value: 842.6,
    decimals: 1,
    suffix: "K",
    delta: "12.4%",
    tone: "good",
    trend: "up",
    icon: "subscribers",
    from: "#34D399",
    to: "#059669",
    spark: [701, 712, 725, 738, 751, 765, 780, 798, 812, 826, 838, 842.6]
  },
  {
    label: "Provisioning success",
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
    label: "Failed transactions",
    value: 142,
    decimals: 0,
    delta: "12",
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

const SERIES: Record<string, { labels: string[]; values: number[] }> = {
  "7": {
    labels: ["Nov 17", "Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22", "Nov 23"],
    values: [826.3, 829.1, 832.8, 836.0, 838.5, 840.9, 842.6]
  },
  "30": {
    labels: ["Nov 1", "Nov 5", "Nov 10", "Nov 15", "Nov 20", "Nov 23"],
    values: [749.6, 772.8, 797.4, 819.1, 835.0, 842.6]
  },
  "90": {
    labels: ["Aug 25", "Sep 10", "Sep 25", "Oct 10", "Oct 25", "Nov 10", "Nov 23"],
    values: [690.4, 716.2, 738.9, 762.5, 790.0, 822.4, 842.6]
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
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PILL[tone]}`}>
      {children}
    </span>
  );
}

/* ────────────────────────────── Stat card ────────────────────────────── */

function Sparkline({ data, id, color }: { data: number[]; id: string; color: string }) {
  const w = 200;
  const h = 56;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const xs = data.map((_, i) => (i / (data.length - 1)) * w);
  const ys = data.map((v) => h - 8 - ((v - min) / (max - min || 1)) * (h - 22));
  const line = smoothPath(xs, ys);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="sv-fade h-14 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const shown = useCountUp(stat.value, stat.decimals);
  return (
    <div
      className={`sv-rise group relative overflow-hidden ${card} pt-5`}
      style={{ animationDelay: `${120 + index * 70}ms` }}
    >
      {/* Soft accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-25 dark:opacity-[0.18]"
        style={{ background: stat.to }}
      />

      <div className="relative flex items-start justify-between px-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-black/5"
          style={{
            background: `linear-gradient(140deg, ${stat.from}, ${stat.to})`,
            boxShadow: `0 8px 18px -8px ${stat.to}, inset 0 1px 0 rgba(255,255,255,0.35)`
          }}
        >
          <Icon name={stat.icon} className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>

      <div className="relative mt-4 flex items-center gap-3 px-5">
        <span className="text-[32px] font-medium leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
          {shown}
          {stat.suffix}
        </span>
        <Pill tone={stat.tone}>
          {stat.trend && <Arrow up={stat.trend === "up"} />}
          {stat.delta}
        </Pill>
      </div>

      <div className="relative mt-5">
        <Sparkline data={stat.spark} id={`spark-${index}`} color={stat.to} />
      </div>
    </div>
  );
}

/* ────────────────────────────── Growth chart ────────────────────────────── */

const W = 720;
const H = 320;
const PL = 52;
const PR = 20;
const PT = 20;
const PB = 34;

function GrowthChart({ range }: { range: string }) {
  const { labels, values } = SERIES[range];
  const [hover, setHover] = useState<number | null>(null);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const step = span < 40 ? 10 : span < 120 ? 25 : 50;
  const lo = Math.floor((min - step * 0.5) / step) * step;
  const hi = Math.ceil((max + step * 0.5) / step) * step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += step) ticks.push(t);

  const yOf = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const xs = values.map((_, i) => PL + (i / (values.length - 1)) * (W - PL - PR));
  const ys = values.map(yOf);

  const line = smoothPath(xs, ys);
  const area = `${line} L${xs[xs.length - 1]},${H - PB} L${xs[0]},${H - PB} Z`;
  const last = values.length - 1;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    xs.forEach((px, i) => {
      if (Math.abs(px - x) < Math.abs(xs[best] - x)) best = i;
    });
    setHover(best);
  };

  const hv = hover !== null ? hover : null;
  const change = hv !== null && hv > 0 ? values[hv] - values[hv - 1] : null;

  return (
    <div
      className="relative w-full touch-pan-y"
      style={{ aspectRatio: `${W} / ${H}` }}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Subscriber growth over time">
        <defs>
          <linearGradient id="sv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.30" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sv-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
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
              className="stroke-slate-200/80 dark:stroke-slate-800"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            <text x={PL - 12} y={yOf(t) + 4} textAnchor="end" className="fill-slate-400 dark:fill-slate-500" fontSize="11.5">
              {t}K
            </text>
          </g>
        ))}

        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={l}
            x={xs[i]}
            y={H - 9}
            textAnchor="middle"
            className={`transition-colors duration-200 ${hv === i ? "fill-slate-700 dark:fill-slate-200" : "fill-slate-400 dark:fill-slate-500"}`}
            fontSize="11.5"
          >
            {l}
          </text>
        ))}

        {/* Hover guide */}
        {hv !== null && (
          <line x1={xs[hv]} x2={xs[hv]} y1={PT} y2={H - PB} className="stroke-indigo-300/70 dark:stroke-indigo-400/40" strokeWidth="1" />
        )}

        {/* Series (re-keyed so the draw animation replays when the range changes) */}
        <g key={range}>
          <path d={area} fill="url(#sv-area)" className="sv-fade" />
          <path
            d={line}
            fill="none"
            stroke="url(#sv-line)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="sv-draw"
            style={{ filter: "drop-shadow(0 6px 10px rgba(99,102,241,0.35))" }}
          />
        </g>

        {/* Latest value marker */}
        <g className="sv-fade" key={`end-${range}`}>
          <circle cx={xs[last]} cy={ys[last]} r="9" fill="#6366F1" opacity="0.15" />
          <circle cx={xs[last]} cy={ys[last]} r="4.5" fill="#6366F1" className="stroke-white dark:stroke-[#0A0F1E]" strokeWidth="2" />
        </g>

        {/* Hover marker */}
        {hv !== null && hv !== last && (
          <g>
            <circle cx={xs[hv]} cy={ys[hv]} r="9" fill="#6366F1" opacity="0.15" />
            <circle cx={xs[hv]} cy={ys[hv]} r="4.5" fill="#6366F1" className="stroke-white dark:stroke-[#0A0F1E]" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hv !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[135%] whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.3)] dark:border-slate-700 dark:bg-[#0D1324]"
          style={{
            left: `${Math.min(86, Math.max(14, (xs[hv] / W) * 100))}%`,
            top: `${(ys[hv] / H) * 100}%`
          }}
        >
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{labels[hv]}</p>
          <p className="mt-0.5 flex items-baseline gap-2 text-sm">
            <span className="font-medium tabular-nums text-slate-900 dark:text-white">{values[hv].toFixed(1)}K</span>
            {change !== null && (
              <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">+{change.toFixed(1)}K</span>
            )}
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

  const { values } = SERIES[range];
  const current = values[values.length - 1];
  const growth = ((current - values[0]) / values[0]) * 100;
  const okCount = HEALTH.filter((h) => h.state === "ok").length;

  return (
    <div className="relative">
      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sv-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes sv-bar { from { transform: scaleY(0.15); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        .sv-bar { transform-origin: bottom; animation: sv-bar .55s cubic-bezier(.22,1,.36,1) backwards; }
        .sv-rise { opacity: 0; animation: sv-rise .7s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-fade { opacity: 0; animation: sv-fade 1.1s ease-out .45s forwards; }
        .sv-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: sv-draw 1.3s cubic-bezier(.22,1,.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .sv-rise, .sv-fade { animation: none; opacity: 1; }
          .sv-draw { animation: none; stroke-dashoffset: 0; }
          .sv-bar { animation: none; }
        }
      `}</style>

      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.09),transparent_70%)] dark:bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-8 p-5 sm:p-6 lg:p-8">
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
          <p className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            Updated just now
          </p>
        </header>

        {/* Stats */}
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className={`sv-rise ${card} p-6 xl:col-span-8`} style={{ animationDelay: "420ms" }}>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-sm text-slate-500 dark:text-slate-400">Subscriber growth</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[30px] font-medium leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {current.toFixed(1)}K
                  </span>
                  <Pill tone="good">
                    <Arrow />
                    {growth.toFixed(1)}%
                  </Pill>
                </div>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Total active subscribers over the selected period
                </p>
              </div>
              <RangeSwitch value={range} onChange={setRange} />
            </div>
            <GrowthChart range={range} />
          </div>

          <div className={`sv-rise ${card} p-6 xl:col-span-4`} style={{ animationDelay: "500ms" }}>
            <div className="mb-6">
              <h3 className="text-sm text-slate-500 dark:text-slate-400">Subscription status</h3>
              <p className="mt-2 text-[17px] font-medium text-slate-900 dark:text-white">
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
              <h3 className="text-base font-medium text-slate-900 dark:text-white">Operational health</h3>
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
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
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