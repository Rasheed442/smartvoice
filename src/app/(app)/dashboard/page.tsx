"use client";

import { Icon, IconName } from "@/components/Icon";
import { useCallback, useEffect, useMemo, useState, type PointerEvent } from "react";

/* ────────────────────────────── Data ────────────────────────────── */

const TOTAL_SUBS = 842.6;

type Stat = {
  label: string;
  value: number;
  decimals: number;
  suffix?: string;
  /** Render the suffix small and muted (used for %) */
  suffixMuted?: boolean;
  delta?: string;
  context?: string;
  tone?: "good" | "bad";
  trend?: "up" | "down";
  icon: IconName;
  /** Accent used for the icon and the soft corner glow */
  accent: string;
  glow: string;
  /** Shows a gradient progress bar instead of a delta line */
  progress?: number;
};

const STATS: Stat[] = [
  {
    label: "Total tenants",
    value: 0,
    decimals: 0,
    delta: "0",
    context: "this month",
    tone: "good",
    trend: "up",
    icon: "tenants",
    accent: "#6366F1",
    glow: "rgba(139,92,246,0.22)"
  },
  {
    label: "Active subscribers",
    value: 0,
    decimals: 1,
    suffix: "K",
    delta: "0%",
    context: "vs last month",
    tone: "good",
    trend: "up",
    icon: "subscribers",
    accent: "#6366F1",
    glow: "rgba(99,102,241,0.22)"
  },
  {
    label: "Provisioning success",
    value: 0,
    decimals: 1,
    suffix: "%",
    suffixMuted: true,
    icon: "check",
    accent: "#10B981",
    glow: "rgba(16,185,129,0.20)",
    progress: 98.2
  },
  {
    label: "Failed transactions",
    value: 0,
    decimals: 0,
    delta: "0",
    context: "vs yesterday",
    tone: "bad",
    trend: "up",
    icon: "alert",
    accent: "#E11D48",
    glow: "rgba(244,63,94,0.20)"
  }
];

/**
 * Net new subscribers per bucket (K).
 * `n` = number of chart points, `step` = days between points, `tick` = label every N points.
 * Dates are mock data — replace with your API response.
 */
const END_DATE = new Date(2026, 10, 30);

const RANGES = [
  { key: "7", label: "7D" },
  { key: "30", label: "30D" },
  { key: "90", label: "90D" }
];

const SERIES: Record<
  string,
  { added: number[]; bucketLabels: string[]; unit: string; n: number; step: number; tick: number }
> = {
  "7": {
    added: [3.1, 2.8, 3.7, 3.2, 2.5, 2.4, 1.7],
    bucketLabels: ["Nov 24", "Nov 25", "Nov 26", "Nov 27", "Nov 28", "Nov 29", "Nov 30"],
    unit: "1D",
    n: 7,
    step: 1,
    tick: 1
  },
  "30": {
    added: [17.9, 19.6, 18.4, 16.2, 13.1, 7.8],
    bucketLabels: ["Nov 4", "Nov 8", "Nov 12", "Nov 16", "Nov 20", "Nov 23"],
    unit: "4D",
    n: 30,
    step: 1,
    tick: 5
  },
  "90": {
    added: [22.4, 23.9, 21.7, 24.6, 25.8, 22.5, 11.3],
    bucketLabels: ["Sep 7", "Sep 21", "Oct 5", "Oct 19", "Nov 2", "Nov 16", "Nov 30"],
    unit: "2W",
    n: 45,
    step: 2,
    tick: 8
  }
};

const STATUS = [
  { label: "Active", pct: 82, color: "#6366F1" },
  { label: "Pending", pct: 10, color: "#818CF8" },
  { label: "Suspended", pct: 5, color: "#F5A623" },
  { label: "Expired", pct: 3, color: "#475569" }
];

type Health = {
  group: string;
  name: string;
  icon: IconName;
  value: string;
  unit: string;
  last: string;
  state: "ok" | "warn";
  /** One character per recent check: o = healthy, w = degraded */
  history: string;
};

const hist = (warn: number[] = []) =>
  Array.from({ length: 30 }, (_, i) => (warn.includes(i) ? "w" : "o")).join("");

const HEALTH: Health[] = [
  { group: "Charging", name: "MTN-NG Direct", icon: "subscriptions", value: "124", unit: "ms latency", last: "2m ago", state: "ok", history: hist([9]) },
  { group: "CRBT / CMS", name: "Huawei CRBT v3", icon: "catalogue", value: "99.98", unit: "% uptime", last: "15s ago", state: "ok", history: hist() },
  { group: "DS-SDP", name: "Ericsson SDP", icon: "operators", value: "100", unit: "% success", last: "5m ago", state: "ok", history: hist([21]) },
  { group: "SMS gateway", name: "SMPP Node 1", icon: "connections", value: "Slow", unit: "response time", last: "10s ago", state: "warn", history: hist([14, 22, 25, 26, 27, 28, 29]) },
  { group: "WhatsApp", name: "Meta Cloud API", icon: "subscribers", value: "42", unit: "active sessions", last: "1m ago", state: "ok", history: hist() },
  { group: "Audio generation", name: "SmartVoice AI", icon: "wave", value: "0", unit: "in queue", last: "30m ago", state: "ok", history: hist([4]) }
];

type TenantStatus = "Active" | "Near quota" | "Onboarding";

const TENANTS: { name: string; subs: number; quota: number; status: TenantStatus }[] = [
  { name: "Tenant Alpha", subs: 214880, quota: 78, status: "Active" },
  { name: "Tenant Beta", subs: 168214, quota: 61, status: "Active" },
  { name: "Tenant Gamma", subs: 121509, quota: 94, status: "Near quota" },
  { name: "Tenant Delta", subs: 87332, quota: 44, status: "Active" },
  { name: "Tenant Omega", subs: 41076, quota: 22, status: "Onboarding" }
];

const TENANT_STATUS_STYLE: Record<TenantStatus, { dot: string; text: string }> = {
  Active: { dot: "bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.9)]", text: "text-teal-600 dark:text-teal-400" },
  "Near quota": { dot: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]", text: "text-amber-600 dark:text-amber-400" },
  Onboarding: { dot: "bg-slate-300 dark:bg-slate-600", text: "text-slate-400 dark:text-slate-500" }
};

const ACTIVITY = [
  { who: "Tenant Alpha", what: "provisioned 12 SIP trunks", when: "2m ago", category: "Provisioning", dot: "bg-indigo-400" },
  { who: "Tenant Beta", what: "updated call routing rules", when: "18m ago", category: "Routing", dot: "bg-indigo-300" },
  { who: "System", what: "nightly backup completed", when: "1h ago", category: "System", dot: "bg-teal-400" },
  { who: "Tenant Gamma", what: "enabled failover gateway", when: "3h ago", category: "Failover", dot: "bg-slate-400" }
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

/** Turn per-bucket net-new values into a smooth cumulative series of n points. */
function buildPoints(added: number[], n: number) {
  const sum = added.reduce((a, b) => a + b, 0);
  const start = TOTAL_SUBS - sum;
  const B = added.length;
  const avg = sum / B;
  const out: number[] = [];

  for (let j = 0; j < n; j++) {
    const t = (j / (n - 1)) * B;
    const b = Math.min(B - 1, Math.floor(t));
    const frac = t - b;
    const before = added.slice(0, b).reduce((a, c) => a + c, 0);
    const wobble = n > 12 ? avg * 0.1 * Math.sin(j * 2.3) * Math.sin((Math.PI * j) / (n - 1)) : 0;
    out.push(start + before + added[b] * frac + wobble);
  }
  out[0] = start;
  out[n - 1] = TOTAL_SUBS;
  return out;
}

function niceStep(range: number) {
  const raw = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / mag;
  const f = m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return f * mag;
}

const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const card =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(99,102,241,0.12)] " +
  "dark:border-white/[0.08] dark:bg-[#060A17]/90 dark:backdrop-blur-sm dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.03]";

const mono = "font-mono";

function Arrow({ up = true }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={`h-2.5 w-2.5 ${up ? "" : "rotate-180"}`} fill="currentColor" aria-hidden="true">
      <path d="M6 2.5 10.5 9.5h-9z" />
    </svg>
  );
}

/* ────────────────────────────── Stat card ────────────────────────────── */

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const shown = useCountUp(stat.value, stat.decimals);
  const toneText =
    stat.tone === "bad" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400";

  return (
    <div
      className={`sv-rise ${card} relative overflow-hidden p-5`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Soft corner glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full blur-2xl"
        style={{ background: stat.glow }}
      />

      <div className="relative flex items-start justify-between">
        <p className="text-xs font-light text-slate-400 dark:text-slate-500">{stat.label}</p>
        <span style={{ color: stat.accent }}>
          <Icon name={stat.icon} className="h-4 w-4" strokeWidth={1.7} />
        </span>
      </div>

      <p className="relative mt-3 text-[38px] font-light leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
        {shown}
        {stat.suffix && (
          <span className={stat.suffixMuted ? "ml-0.5 text-[20px] text-slate-400 dark:text-slate-500" : ""}>
            {stat.suffix}
          </span>
        )}
      </p>

      {stat.progress !== undefined ? (
        <div className="relative mt-4 h-[3px] w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
          <div
            className="sv-fill h-full rounded-full"
            style={{
              width: `${stat.progress}%`,
              background: "linear-gradient(90deg,#6366F1,#818CF8 45%,#2DD4BF)"
            }}
          />
        </div>
      ) : (
        <p className={`relative mt-4 flex items-center gap-1.5 text-[11px] ${mono}`}>
          <span className={`inline-flex items-center gap-1 ${toneText}`}>
            {stat.trend && <Arrow up={stat.trend === "up"} />}
            {stat.delta}
          </span>
          <span className="text-slate-400 dark:text-slate-500">{stat.context}</span>
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────── Growth chart ────────────────────────────── */

const W = 640;
const H = 240;
const PL = 44;
const PR = 10;
const PT = 12;
const PB = 28;

function GrowthChart({ range }: { range: string }) {
  const cfg = SERIES[range];
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    const pts = buildPoints(cfg.added, cfg.n);
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const step = niceStep(max - min);
    const pad = (max - min) * 0.04;
    const lo = min - pad;
    const hi = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(t);

    const x = (i: number) => PL + (i / (cfg.n - 1)) * (W - PL - PR);
    const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
    const xs = pts.map((_, i) => x(i));
    const ys = pts.map((v) => y(v));
    const line = smoothPath(xs, ys);
    const base = H - PB;
    const area = `${line} L${xs[xs.length - 1]},${base} L${xs[0]},${base} Z`;

    const labels = pts.map((_, i) => {
      const d = new Date(END_DATE);
      d.setDate(d.getDate() - (cfg.n - 1 - i) * cfg.step);
      return fmtDate(d);
    });

    return { pts, ticks, x, y, xs, ys, line, area, base, labels };
  }, [cfg]);

  const { pts, ticks, x, y, xs, ys, line, area, base, labels } = geo;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((px - PL) / (W - PL - PR)) * (cfg.n - 1));
    setHover(Math.min(cfg.n - 1, Math.max(0, idx)));
  };

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
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Grid + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PL}
              x2={W - PR}
              y1={y(t)}
              y2={y(t)}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="1"
              strokeDasharray="2 5"
            />
            <text x={PL - 10} y={y(t) + 3.5} textAnchor="end" className="fill-slate-400 dark:fill-slate-500" fontSize="10">
              {Math.round(t)}K
            </text>
          </g>
        ))}

        {/* Area + line (re-keyed so they redraw when the range changes) */}
        <g key={range}>
          <path d={area} fill="url(#sv-area)" className="sv-fade" />
          <path
            d={line}
            pathLength={1}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sv-draw"
          />
        </g>

        {/* x labels */}
        {labels.map((l, i) =>
          i % cfg.tick === 0 ? (
            <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="10">
              {l}
            </text>
          ) : null
        )}

        {/* Hover marker */}
        {hover !== null && (
          <g>
            <line x1={xs[hover]} x2={xs[hover]} y1={PT} y2={base} className="stroke-indigo-300/60 dark:stroke-indigo-400/40" strokeWidth="1" strokeDasharray="3 4" />
            <circle cx={xs[hover]} cy={ys[hover]} r="6" fill="#6366F1" opacity="0.15" />
            <circle cx={xs[hover]} cy={ys[hover]} r="3.5" fill="#fff" stroke="#6366F1" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.25)] dark:border-white/[0.1] dark:bg-[#060A17]"
          style={{
            left: `${Math.min(88, Math.max(12, (xs[hover] / W) * 100))}%`,
            top: `${(ys[hover] / H) * 100}%`
          }}
        >
          <p className={`text-[10px] text-slate-400 dark:text-slate-500 ${mono}`}>{labels[hover]}</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-slate-900 dark:text-white">
            {pts[hover].toFixed(1)}K
          </p>
          {hover > 0 && (
            <p className="text-[11px] tabular-nums text-teal-600 dark:text-teal-400">
              +{(pts[hover] - pts[hover - 1]).toFixed(2)}K
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RangeSwitch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="inline-flex rounded-lg bg-slate-100 cursor-pointer p-0.5 dark:bg-white/[0.04] dark:ring-1 dark:ring-inset dark:ring-white/[0.06]"
    >
      {RANGES.map((r) => {
        const on = value === r.key;
        return (
          <button
            key={r.key}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(r.key)}
            className={
              `h-6 rounded-md px-2.5 text-[11px] cursor-pointer outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${mono} ` +
              (on
                ? "bg-white text-indigo-600 shadow-sm dark:bg-white/[0.08] dark:text-indigo-300"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200")
            }
          >
            {r.label}
          </button>
        );
      })}
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
  const GAP = 2.5;
  let cum = 0;

  const focus = active !== null ? STATUS[active] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[210px] w-[210px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label="Subscription status distribution">
          <circle cx="100" cy="100" r={R} fill="none" strokeWidth="14" className="stroke-slate-100 dark:stroke-white/[0.06]" />
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
                strokeWidth={active === i ? 17 : 14}
                strokeDasharray={`${mounted ? len : 0} ${C}`}
                strokeDashoffset={-offset}
                opacity={active === null || active === i ? 1 : 0.3}
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
          <span className="text-[26px] font-light leading-none tabular-nums text-slate-900 dark:text-white">
            {focus ? `${focus.pct}%` : `${TOTAL_SUBS}K`}
          </span>
          <span className={`mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 ${mono}`}>
            {focus ? focus.label : "Subscribers"}
          </span>
        </div>
      </div>

      <ul className="mt-6 w-full space-y-1">
        {STATUS.map((s, i) => (
          <li
            key={s.label}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            className={
              "flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px] transition-colors duration-200 " +
              (active === i ? "bg-slate-50 dark:bg-white/[0.04]" : "")
            }
          >
            <span className="flex items-center gap-2 text-slate-600 text-[12px] font-light dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className={`tabular-nums text-slate-800 text-[14px] dark:text-slate-200 ${mono}`}>{s.pct}%</span>
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
        "sv-rise px-5 py-4 " + (ok ? "bg-white dark:bg-[#060A17]/90" : "bg-amber-50/70 dark:bg-amber-950/20")
      }
      style={{ animationDelay: `${500 + index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset " +
              (ok
                ? "bg-indigo-50 text-indigo-600 ring-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-300/20"
                : "bg-amber-100/70 text-amber-700 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-300/20")
            }
          >
            <Icon name={h.icon} className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[12px] font-medium text-slate-800 dark:text-white">{h.name}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-slate-500">{h.group}</p>
          </div>
        </div>

        <span
          className={
            `inline-flex shrink-0 items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] ${mono} ` +
            (ok ? "text-teal-600 dark:text-teal-400" : "text-amber-700 dark:text-amber-300")
          }
        >
          <span className={`h-1 w-1 rounded-full ${ok ? "bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.9)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]"}`} />
          {ok ? "Operational" : "Degraded"}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span
          className={
            "text-[22px] font-light leading-none tabular-nums " +
            (ok ? "text-slate-900 dark:text-white" : "text-amber-700 dark:text-amber-300")
          }
        >
          {h.value}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{h.unit}</span>
      </div>

      <div className="mt-3 flex h-5 items-stretch gap-[3px]" role="img" aria-label={`Last 30 checks for ${h.name}`}>
        {h.history.split("").map((c, i) => (
          <span
            key={i}
            title={c === "o" ? "Healthy" : "Degraded"}
            className={
              "sv-bar flex-1 rounded-[2px] " +
              (c === "o" ? "bg-indigo-200 dark:bg-indigo-400/25" : "bg-amber-400")
            }
            style={{ animationDelay: `${550 + index * 50 + i * 12}ms` }}
          />
        ))}
      </div>
      <div className={`mt-2 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 ${mono}`}>
        <span>last 30 checks</span>
        <span>{h.last}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function DashboardPage() {
  const [range, setRange] = useState("30");
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState("Updated just now");

  const cfg = SERIES[range];
  const netNew = cfg.added.reduce((a, b) => a + b, 0);
  const growth = (netNew / (TOTAL_SUBS - netNew)) * 100;
  const avgAdded = netNew / cfg.added.length;
  const peakIdx = cfg.added.indexOf(Math.max(...cfg.added));
  const okCount = HEALTH.filter((h) => h.state === "ok").length;

  const refresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    setUpdated("Refreshing…");
    window.setTimeout(() => {
      setRefreshing(false);
      setUpdated("Updated just now");
    }, 900);
  }, [refreshing]);

  return (
    <div className="relative min-h-full">
      {/* ── Atmosphere ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[520px] w-[520px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_65%)]" />
        <div className="absolute right-0 top-32 h-[450px] w-[450px] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.04),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.08),transparent_65%)]" />
      </div>

      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sv-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes sv-bar { from { transform: scaleY(0.15); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes sv-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes sv-spin { to { transform: rotate(360deg); } }
        .sv-rise { opacity: 0; animation: sv-rise .6s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-fade { opacity: 0; animation: sv-fade 1.1s ease-out .35s forwards; }
        .sv-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: sv-draw 1.4s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-bar { transform-origin: bottom; animation: sv-bar .5s cubic-bezier(.22,1,.36,1) backwards; }
        .sv-fill { transform-origin: left; animation: sv-fill 1.1s cubic-bezier(.22,1,.36,1) .3s backwards; }
        .sv-spin { animation: sv-spin .8s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sv-rise, .sv-fade { animation: none; opacity: 1; }
          .sv-draw { animation: none; stroke-dashoffset: 0; }
          .sv-bar, .sv-fill, .sv-spin { animation: none; }
        }
      `}</style>

      <div className="relative mx-auto flex flex-col gap-4 p-5 sm:p-6">
        {/* Header */}
        <header className="sv-rise flex flex-wrap items-end justify-between gap-3 pb-1">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 ${mono}`}>
              Platform overview
            </p>
            <h2 className="mt-2 text-[26px] font-light tracking-tight text-slate-900 dark:text-white">
              Everything running, <span className="text-indigo-600 dark:text-indigo-400">at a glance.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] text-slate-400 dark:text-slate-500 ${mono}`}>{updated}</span>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/15 dark:hover:text-white"
            >
              <svg
                viewBox="0 0 16 16"
                className={`h-3 w-3 ${refreshing ? "sv-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v2.6h-2.6" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        {/* Stats */}
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className={`sv-rise ${card} p-6 xl:col-span-8`} style={{ animationDelay: "280ms" }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-[14px] font-light text-slate-600 dark:text-slate-500">Subscriber growth</h3>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <span className="text-[30px] font-light leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
                    {TOTAL_SUBS.toFixed(1)}K
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 ${mono}`}>
                    <Arrow />
                    {growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <RangeSwitch value={range} onChange={setRange} />
            </div>

            <div className="mt-5">
              <GrowthChart range={range} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
              {[
                { k: "Net new", v: `+${netNew.toFixed(1)}K` },
                { k: `Average / ${cfg.unit}`, v: `${avgAdded.toFixed(1)}K` },
                { k: `Best · ${cfg.bucketLabels[peakIdx]}`, v: `+${cfg.added[peakIdx].toFixed(1)}K` }
              ].map((m) => (
                <div key={m.k}>
                  <p className={`text-[9px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 ${mono}`}>{m.k}</p>
                  <p className={`mt-1.5 text-[13px] tabular-nums text-slate-800 dark:text-slate-100 ${mono}`}>{m.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`sv-rise ${card} p-6 xl:col-span-4`} style={{ animationDelay: "340ms" }}>
            <div className="mb-5">
              <h3 className="text-[13px] font-light text-slate-400 dark:text-slate-500">Subscription status</h3>
              <p className="mt-1.5 text-[20px] font-light text-slate-800 dark:text-white">Share by state</p>
            </div>
            <StatusDonut />
          </div>
        </section>

        {/* Operational health */}
        <section
          aria-label="Operational health"
          className={`sv-rise ${card} overflow-hidden`}
          style={{ animationDelay: "420ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div>
              <h3 className="text-[14px] text-slate-900 dark:text-white">Operational health</h3>
              <p className="mt-1 text-[11px] font-light text-slate-400 dark:text-slate-500">
                Connected services and gateways
              </p>
            </div>
            <span
              className={
                `rounded-md border px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] ${mono} ` +
                (okCount === HEALTH.length
                  ? "border-teal-200 text-teal-600 dark:border-teal-400/20 dark:text-teal-400"
                  : "border-teal-200 text-teal-600 dark:border-teal-400/20 dark:text-teal-400")
              }
            >
              {okCount} / {HEALTH.length} operational
            </span>
          </div>

          <div className="grid grid-cols-1 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/[0.06] dark:bg-white/[0.06]">
            {HEALTH.map((h, i) => (
              <HealthCell key={h.name} h={h} index={i} />
            ))}
          </div>
        </section>

        {/* Top tenants + live activity */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <div className={`sv-rise ${card} overflow-hidden`} style={{ animationDelay: "560ms" }}>
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-[14px] text-slate-900 dark:text-white">Top tenants</h3>
              <button
                type="button"
                className="text-[11px] text-indigo-500 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className={`border-b border-slate-100 bg-slate-50/80 text-[9px] uppercase tracking-[0.12em] text-slate-400 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-500 ${mono}`}>
                    <th className="px-6 py-2.5 font-normal">Tenant</th>
                    <th className="px-3 py-2.5 font-normal">Subscribers</th>
                    <th className="px-3 py-2.5 font-normal">Quota</th>
                    <th className="px-6 py-2.5 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {TENANTS.map((t) => {
                    const st = TENANT_STATUS_STYLE[t.status];
                    const near = t.status === "Near quota";
                    return (
                      <tr key={t.name} className="transition-colors duration-200 hover:bg-slate-50/70 dark:hover:bg-slate-800/20">
                        <td className="px-6 py-3.5 text-[12px] text-slate-800 dark:text-slate-100">{t.name}</td>
                        <td className={`px-3 py-3.5 text-[12px] tabular-nums text-slate-600 dark:text-slate-300 ${mono}`}>
                          {t.subs.toLocaleString("en-US")}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="h-[3px] w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="sv-fill h-full rounded-full"
                              style={{
                                width: `${t.quota}%`,
                                background: near ? "#F5A623" : "linear-gradient(90deg,#8B5CF6,#818CF8)"
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] ${st.text} ${mono}`}>
                            <span className={`h-1 w-1 rounded-full ${st.dot}`} />
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`sv-rise ${card} p-6`} style={{ animationDelay: "620ms" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] text-slate-900 dark:text-white">Live activity</h3>
              <button
                type="button"
                className="text-[11px] text-violet-500 transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 dark:hover:text-violet-300"
              >
                View all →
              </button>
            </div>

            <ol className="relative mt-6 space-y-5">
              <span
                aria-hidden="true"
                className="absolute bottom-2 left-[4px] top-2 w-px bg-slate-200 dark:bg-slate-800"
              />
              {ACTIVITY.map((a) => (
                <li key={a.what} className="relative flex gap-4">
                  <span
                    className={`relative z-10 mt-1 h-[9px] w-[9px] shrink-0 rounded-full ring-4 ring-white dark:ring-[#0A0F1E] ${a.dot}`}
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">
                      <span className="text-slate-900 dark:text-white">{a.who}</span> {a.what}
                    </p>
                    <p className={`mt-1 text-[10px] text-slate-400 dark:text-slate-500 ${mono}`}>
                      {a.when} · {a.category}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}