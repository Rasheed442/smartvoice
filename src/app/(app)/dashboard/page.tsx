"use client";

import { Icon,IconName } from "@/components/Icon";
import { useEffect, useState, type PointerEvent } from "react";

/* ────────────────────────────── Data ────────────────────────────── */

type Stat = {
  label: string;
  value: number;
  decimals: number;
  suffix?: string;
  delta: string;
  tone: "good" | "bad" | "muted";
  icon: IconName;
  chip: string;
};

const STATS: Stat[] = [
  {
    label: "Total tenants",
    value: 24,
    decimals: 0,
    delta: "+2 this month",
    tone: "good",
    icon: "tenants",
    chip: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
  },
  {
    label: "Active subscribers",
    value: 842.6,
    decimals: 1,
    suffix: "K",
    delta: "+12.4%",
    tone: "good",
    icon: "subscribers",
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
  },
  {
    label: "Provisioning success",
    value: 98.2,
    decimals: 1,
    suffix: "%",
    delta: "Last 24h",
    tone: "muted",
    icon: "check",
    chip: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300"
  },
  {
    label: "Failed transactions",
    value: 142,
    decimals: 0,
    delta: "+12",
    tone: "bad",
    icon: "alert",
    chip: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
  }
];

const TONES = {
  good: "text-emerald-600 dark:text-emerald-400",
  bad: "text-rose-600 dark:text-rose-400",
  muted: "text-slate-400 dark:text-slate-500"
};

const SERIES: Record<string, { labels: string[]; values: number[] }> = {
  "7": {
    labels: ["Nov 17", "Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22", "Nov 23"],
    values: [826.3, 829.1, 832.8, 836.0, 838.5, 840.9, 842.6]
  },
  "30": {
    labels: ["Nov 1", "Nov 5", "Nov 10", "Nov 15", "Nov 20", "Nov 23"],
    values: [780.2, 792.4, 810.1, 826.3, 838.5, 842.6]
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
  detail: string;
  last: string;
  state: "ok" | "warn";
};

const HEALTH: Health[] = [
  { group: "Charging", name: "MTN-NG Direct", detail: "Latency 124 ms", last: "2m ago", state: "ok" },
  { group: "CRBT / CMS", name: "Huawei CRBT v3", detail: "Uptime 99.98%", last: "15s ago", state: "ok" },
  { group: "DS-SDP", name: "Ericsson SDP", detail: "Success 100%", last: "5m ago", state: "ok" },
  { group: "SMS gateway", name: "SMPP Node 1", detail: "Slow response", last: "10s ago", state: "warn" },
  { group: "WhatsApp", name: "Meta Cloud API", detail: "Active sessions 42", last: "1m ago", state: "ok" },
  { group: "Audio generation", name: "SmartVoice AI", detail: "Queue 0", last: "30m ago", state: "ok" }
];

const ACTIVITY = [
  { who: "Tenant Alpha", what: "provisioned 12 new SIP trunks", when: "2m ago" },
  { who: "Tenant Beta", what: "updated call routing rules", when: "18m ago" },
  { who: "System", what: "nightly backup completed", when: "1h ago" },
  { who: "Tenant Gamma", what: "enabled failover gateway", when: "3h ago" }
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

const card =
  "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#0A0F1E] dark:shadow-none";

/* ────────────────────────────── Stat card ────────────────────────────── */

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const shown = useCountUp(stat.value, stat.decimals);
  return (
    <div
      className={`sv-rise ${card} p-5`}
      style={{ animationDelay: `${120 + index * 70}ms` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.chip}`}>
          <Icon name={stat.icon} />
        </span>
      </div>
      <div className="mt-5 flex items-baseline gap-2.5">
        <span className="text-[28px] font-medium leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
          {shown}
          {stat.suffix}
        </span>
        <span className={`text-[13px] ${TONES[stat.tone]}`}>{stat.delta}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────── Growth chart ────────────────────────────── */

const W = 640;
const H = 300;
const PL = 48;
const PR = 16;
const PT = 16;
const PB = 32;

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

  const xs = values.map((_, i) => PL + (i / (values.length - 1)) * (W - PL - PR));
  const ys = values.map((v) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB));
  const yOf = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);

  let line = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const mx = (xs[i - 1] + xs[i]) / 2;
    line += ` C${mx},${ys[i - 1]} ${mx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  const area = `${line} L${xs[xs.length - 1]},${H - PB} L${xs[0]},${H - PB} Z`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    xs.forEach((px, i) => {
      if (Math.abs(px - x) < Math.abs(xs[best] - x)) best = i;
    });
    setHover(best);
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
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
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
              className="stroke-slate-100 dark:stroke-slate-800/70"
              strokeWidth="1"
            />
            <text
              x={PL - 10}
              y={yOf(t) + 4}
              textAnchor="end"
              className="fill-slate-400 dark:fill-slate-500"
              fontSize="11"
            >
              {t}K
            </text>
          </g>
        ))}

        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={l}
            x={xs[i]}
            y={H - 8}
            textAnchor="middle"
            className="fill-slate-400 dark:fill-slate-500"
            fontSize="11"
          >
            {l}
          </text>
        ))}

        {/* Hover guide */}
        {hover !== null && (
          <line
            x1={xs[hover]}
            x2={xs[hover]}
            y1={PT}
            y2={H - PB}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeDasharray="3 4"
          />
        )}

        {/* Series (re-keyed so the draw animation replays when the range changes) */}
        <g key={range}>
          <path d={area} fill="url(#sv-area)" className="sv-fade" />
          <path
            d={line}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="sv-draw"
          />
        </g>

        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={ys[i]}
            r={hover === i ? 5 : 3}
            strokeWidth="2"
            stroke="#6366F1"
            className="fill-white transition-all duration-200 dark:fill-[#0A0F1E]"
          />
        ))}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-slate-700 dark:bg-[#0D1324]"
          style={{
            left: `${Math.min(88, Math.max(12, (xs[hover] / W) * 100))}%`,
            top: `${(ys[hover] / H) * 100}%`
          }}
        >
          <span className="text-slate-500 dark:text-slate-400">{labels[hover]}</span>
          <span className="ml-2 font-medium text-slate-900 dark:text-white">
            {values[hover].toFixed(1)}K
          </span>
        </div>
      )}
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

  const R = 76;
  const C = 2 * Math.PI * R;
  const GAP = 3;
  let cum = 0;

  const focus = active !== null ? STATUS[active] : null;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative h-[200px] w-[200px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label="Subscription status distribution">
          <circle cx="100" cy="100" r={R} fill="none" strokeWidth="20" className="stroke-slate-100 dark:stroke-slate-800/70" />
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
                strokeWidth={active === i ? 23 : 20}
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
          <span className="text-[26px] font-medium leading-none tabular-nums text-slate-900 dark:text-white">
            {focus ? `${focus.pct}%` : `${TOTAL_SUBS}K`}
          </span>
          <span className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {focus ? focus.label : "Total subscribers"}
          </span>
        </div>
      </div>

      <ul className="grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-2.5">
        {STATUS.map((s, i) => (
          <li
            key={s.label}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            className={
              "flex items-center justify-between rounded-lg px-2 py-1 text-sm transition-colors duration-200 " +
              (active === i ? "bg-slate-50 dark:bg-slate-800/50" : "")
            }
          >
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className="tabular-nums text-slate-400 dark:text-slate-500">
              {((TOTAL_SUBS * s.pct) / 100).toFixed(1)}K
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────────── Health card ────────────────────────────── */

function HealthCard({ h, index }: { h: Health; index: number }) {
  const ok = h.state === "ok";
  return (
    <div
      className={`sv-rise ${card} p-4 transition-colors duration-300 hover:border-slate-300 dark:hover:border-slate-700`}
      style={{ animationDelay: `${620 + index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500">{h.group}</p>
        <span className="relative flex h-2 w-2" role="img" aria-label={ok ? "Operational" : "Degraded"}>
          <span
            className={`sv-ping absolute inset-0 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          <span
            className={`relative h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`}
          />
        </span>
      </div>
      <p className="mt-3 text-[15px] font-medium text-slate-900 dark:text-white">{h.name}</p>
      <p
        className={
          "mt-1.5 text-[13px] " +
          (ok ? "text-slate-500 dark:text-slate-400" : "text-amber-600 dark:text-amber-400")
        }
      >
        {h.detail}
      </p>
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-600">Last check {h.last}</p>
    </div>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function DashboardPage() {
  const [range, setRange] = useState("30");

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 p-5 sm:p-6 lg:p-8">
      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sv-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes sv-ping { 0% { transform: scale(1); opacity: .5; } 70%, 100% { transform: scale(2.6); opacity: 0; } }
        .sv-rise { opacity: 0; animation: sv-rise .7s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-fade { opacity: 0; animation: sv-fade 1.2s ease-out .5s forwards; }
        .sv-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: sv-draw 1.3s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-ping { animation: sv-ping 3s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sv-rise, .sv-fade { animation: none; opacity: 1; }
          .sv-draw { animation: none; stroke-dashoffset: 0; }
          .sv-ping { animation: none; opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="sv-rise">
        <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
          Platform Overview
        </h2>
        <p className="mt-1 text-[15px] font-light text-slate-500 dark:text-slate-400">
          Real-time health and business activity across the platform.
        </p>
      </header>

      {/* Stats */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className={`sv-rise ${card} p-6 xl:col-span-3`} style={{ animationDelay: "420ms" }}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-slate-900 dark:text-white">
                Subscriber growth
              </h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Total active subscribers over time
              </p>
            </div>

            <div className="relative">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                aria-label="Time range"
                className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-indigo-400 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.10)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <Icon
                name="chevron"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <GrowthChart range={range} />
        </div>

        <div className={`sv-rise ${card} p-6 xl:col-span-2`} style={{ animationDelay: "500ms" }}>
          <div className="mb-6">
            <h3 className="text-base font-medium text-slate-900 dark:text-white">
              Subscription status
            </h3>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Share of subscribers by state
            </p>
          </div>
          <StatusDonut />
        </div>
      </section>

      {/* Operational health */}
      <section aria-label="Operational health">
        <h3 className="sv-rise mb-4 text-base font-medium text-slate-900 dark:text-white" style={{ animationDelay: "580ms" }}>
          Operational health
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {HEALTH.map((h, i) => (
            <HealthCard key={h.name} h={h} index={i} />
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className={`sv-rise ${card}`} style={{ animationDelay: "1000ms" }}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-base font-medium text-slate-900 dark:text-white">Recent activity</h3>
          <span className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="sv-ping absolute inset-0 rounded-full bg-teal-400" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-teal-500" />
            </span>
            Live
          </span>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {ACTIVITY.map((a) => (
            <li
              key={a.what}
              className="flex items-center gap-4 px-6 py-3.5 transition-colors duration-200 hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {a.who === "System" ? "S" : a.who.split(" ")[1]?.[0] ?? a.who[0]}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-white">{a.who}</span>{" "}
                {a.what}
              </p>
              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{a.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}