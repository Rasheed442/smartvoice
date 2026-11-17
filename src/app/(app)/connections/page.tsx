"use client";

import { useState, type ReactNode } from "react";

/* ────────────────────────────── Data ────────────────────────────── */

type NodeItem = { id: string; name: string; role: "tenant" | "operator"; degraded?: boolean };

const TENANTS: NodeItem[] = [
  { id: "alpha", name: "Tenant Alpha", role: "tenant", degraded: true },
  { id: "beta", name: "Tenant Beta", role: "tenant" },
  { id: "gamma", name: "Tenant Gamma", role: "tenant" },
  { id: "delta", name: "Tenant Delta", role: "tenant" }
];

const OPERATORS: NodeItem[] = [
  { id: "mtn-ng", name: "MTN Nigeria", role: "operator" },
  { id: "airtel-ng", name: "Airtel Nigeria", role: "operator" },
  { id: "glo", name: "Glo Mobile", role: "operator", degraded: true },
  { id: "mtn-gh", name: "MTN Ghana", role: "operator" }
];

type Protocol = {
  name: string;
  connections: number;
  latency: number;
  state: "Healthy" | "Degraded";
  icon: "chat" | "bolt" | "globe" | "hash";
};

const PROTOCOLS: Protocol[] = [
  { name: "SMPP", connections: 12, latency: 124, state: "Healthy", icon: "chat" },
  { name: "Diameter", connections: 8, latency: 98, state: "Healthy", icon: "bolt" },
  { name: "HTTP/REST", connections: 41, latency: 112, state: "Healthy", icon: "globe" },
  { name: "USSD Gateway", connections: 23, latency: 210, state: "Degraded", icon: "hash" }
];

const FILTERS = ["All", "Degraded"] as const;
type Filter = (typeof FILTERS)[number];

/* Geometry — rows line up with the node columns (node h 53 + gap 36 = 89 pitch). */
const MAP_H = 395;
const ROW_Y = [63, 152, 241, 330];
const HUB_Y = 197;
const VB_W = 1000;
const HUB_X = VB_W / 2;

const mono = "font-mono";

const card =
  "rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(30,27,75,0.03),0_10px_30px_-18px_rgba(79,70,229,0.18)] " +
  "dark:border-slate-800 dark:bg-[#0A0F1E] dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.02]";

/* ────────────────────────────── Icons ────────────────────────────── */

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

const UserIcon = () => (
  <Svg>
    <circle cx="8" cy="5.5" r="2.6" />
    <path d="M3 13.5c.4-2.4 2.4-3.8 5-3.8s4.6 1.4 5 3.8" />
  </Svg>
);

const BuildingIcon = () => (
  <Svg>
    <rect x="3.5" y="2" width="9" height="12" rx="1.5" />
    <path d="M6 5h1M9 5h1M6 7.8h1M9 7.8h1M6.8 14v-2.4h2.4V14" />
  </Svg>
);

const WaveIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12h3.5V5.5h3.500v13h3.500V12H17v0h4" />
  </svg>
);

const PlusIcon = () => (
  <Svg>
    <path d="M8 3v10M3 8h10" />
  </Svg>
);

function ProtocolIcon({ name }: { name: Protocol["icon"] }) {
  switch (name) {
    case "chat":
      return (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M3.500 2.500h9A1.500 1.500 0 0 1 14 4v5.500a1.500 1.500 0 0 1-1.500 1.500H8.200L5 13.800V11h-1.500A1.500 1.500 0 0 1 2 9.500V4a1.500 1.500 0 0 1 1.500-1.500Z" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M9.200 1.500 3.500 9h3.700l-.7 5.500L12.500 7H8.800Z" />
        </svg>
      );
    case "globe":
      return (
        <Svg>
          <circle cx="8" cy="8" r="6" />
          <path d="M2 8h12M8 2c2 1.800 2.900 3.800 2.900 6S10 12.200 8 14c-2-1.800-2.900-3.800-2.900-6S6 3.800 8 2z" />
        </Svg>
      );
    case "hash":
      return (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" aria-hidden="true">
          <path d="M6 2.500 5 13.500M11 2.500l-1 11M3 6h10.500M2.500 10H13" />
        </svg>
      );
  }
}

/* ────────────────────────────── Pieces ────────────────────────────── */

function NodeCard({
  item,
  side,
  dim,
  onHover
}: {
  item: NodeItem;
  side: "left" | "right";
  dim: boolean;
  onHover: (id: string | null) => void;
}) {
  const tile = item.degraded
    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
    : "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300";

  const icon = (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile}`}>
      {item.role === "tenant" ? <UserIcon /> : <BuildingIcon />}
    </span>
  );

  const text = (
    <div className={`min-w-0 leading-tight ${side === "right" ? "text-right" : ""}`}>
      <p className="truncate text-[12px] text-slate-800 dark:text-white">{item.name}</p>
      <p className={`mt-1 text-[9px] tracking-wide text-slate-400 dark:text-slate-500 ${mono}`}>{item.role}</p>
    </div>
  );

  return (
    <div
      tabIndex={0}
      onPointerEnter={() => onHover(item.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(item.id)}
      onBlur={() => onHover(null)}
      className={
        "flex h-[53px] items-center gap-3 rounded-xl border bg-white px-3 shadow-[0_1px_2px_rgba(30,27,75,0.04)] outline-none transition-all duration-200 " +
        "hover:border-violet-200 hover:shadow-[0_8px_18px_-10px_rgba(109,40,217,0.4)] focus-visible:ring-2 focus-visible:ring-violet-500/40 " +
        "dark:bg-slate-900 " +
        (item.degraded ? "border-amber-200/70 dark:border-amber-400/20 " : "border-slate-200/70 dark:border-slate-700 ") +
        (side === "right" ? "justify-end " : "") +
        (dim ? "opacity-35" : "opacity-100")
      }
    >
      {side === "left" ? (
        <>
          {icon}
          {text}
        </>
      ) : (
        <>
          {text}
          {icon}
        </>
      )}
    </div>
  );
}

function ProtocolCard({ p, dim, index }: { p: Protocol; dim: boolean; index: number }) {
  const bad = p.state === "Degraded";
  return (
    <div
      className={`sv-rise ${card} p-5 transition-opacity duration-300 ${dim ? "opacity-40" : "opacity-100"}`}
      style={{ animationDelay: `${300 + index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <span
          className={
            "flex h-9 w-9 items-center justify-center rounded-xl " +
            (bad
              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
              : "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300")
          }
        >
          <ProtocolIcon name={p.icon} />
        </span>
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] " +
            (bad
              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300")
          }
        >
          <span className={`h-1 w-1 rounded-full ${bad ? "bg-amber-500" : "bg-emerald-500"}`} />
          {p.state}
        </span>
      </div>

      <h3 className="mt-5 text-[14px] text-slate-900 dark:text-white">{p.name}</h3>
      <p className="mt-1 text-[11px] font-light text-slate-500 dark:text-slate-400">{p.connections} connections</p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Avg latency</span>
        <span
          className={
            `text-[12px] tabular-nums ${mono} ` +
            (bad ? "text-amber-600 dark:text-amber-300" : "text-slate-900 dark:text-white")
          }
        >
          {p.latency} ms
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function ConnectionMapPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [hover, setHover] = useState<string | null>(null);

  const onlyDegraded = filter === "Degraded";
  const dimNode = (n: NodeItem) => onlyDegraded && !n.degraded;

  /** Line colour: amber for degraded, otherwise violet with a depth-based opacity. */
  const lineStyle = (n: NodeItem, i: number) => {
    const faded = [1, 0.9, 0.55, 0.5][i] ?? 0.5;
    const active = hover === n.id;
    const color = n.degraded ? "#E08A5A" : "#7C5CF0";
    const dimmed = (onlyDegraded && !n.degraded) || (hover !== null && !active);
    return {
      stroke: color,
      opacity: dimmed ? 0.12 : active ? 1 : n.degraded ? 0.75 : faded,
      width: active ? 2 : 1.4
    };
  };

  const leftPath = (y: number) => `M0,${y} C${HUB_X * 0.9},${y} ${HUB_X * 0.7},${HUB_Y} ${HUB_X},${HUB_Y}`;
  const rightPath = (y: number) => `M${VB_W},${y} C${VB_W - HUB_X * 0.9},${y} ${VB_W - HUB_X * 0.7},${HUB_Y} ${HUB_X},${HUB_Y}`;

  return (
    <div className="relative bg-[#F7F6FC] dark:bg-transparent">
      <style>{`
        @keyframes sv-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv-flow { to { stroke-dashoffset: -16; } }
        @keyframes sv-pulse { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.08); } }
        .sv-rise { opacity: 0; animation: sv-rise .55s cubic-bezier(.22,1,.36,1) forwards; }
        .sv-flow { animation: sv-flow 1.6s linear infinite; }
        .sv-pulse { animation: sv-pulse 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sv-rise { animation: none; opacity: 1; }
          .sv-flow, .sv-pulse { animation: none; }
        }
      `}</style>

      <div className="relative mx-auto flex flex-col gap-5 p-5 sm:p-7">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={`text-[9px] uppercase tracking-[0.3em] text-violet-500 ${mono}`}>Live topology</p>
            <h2 className="mt-2.5 text-[26px] font-light tracking-tight text-slate-900 dark:text-white">
              Connection <span className="font-medium text-violet-600">Map</span>
            </h2>
            <p className="mt-2 text-[12px] font-light text-slate-500 dark:text-slate-400">
              See how tenants route traffic through the platform to operator gateways.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label="Connection filter"
              className="inline-flex rounded-lg bg-white p-1 shadow-[0_1px_2px_rgba(30,27,75,0.04),0_8px_20px_-14px_rgba(79,70,229,0.3)] dark:bg-slate-900"
            >
              {FILTERS.map((f) => {
                const on = filter === f;
                return (
                  <button
                    key={f}
                    role="tab"
                    type="button"
                    aria-selected={on}
                    onClick={() => setFilter(f)}
                    className={
                      `h-6 rounded-md px-3 text-[9px] uppercase tracking-[0.1em] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-violet-500/40 ${mono} ` +
                      (on
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white")
                    }
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded bg-gradient-to-b from-violet-500 to-violet-600 px-4 text-[12px] text-white shadow-[0_10px_22px_-8px_rgba(109,40,217,0.75)] transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2"
            >
              <PlusIcon />
              New connection
            </button>
          </div>
        </header>

        {/* Topology */}
        <section aria-label="Connection topology" className={`sv-rise ${card} overflow-x-auto`} style={{ animationDelay: "100ms" }}>
          <div
            className="relative grid min-w-[760px] grid-cols-[190px_minmax(0,1fr)_190px] px-5"
            style={{ height: MAP_H }}
          >
            {/* Tenants */}
            <div className="flex flex-col gap-[36px] pt-[38px]">
              {TENANTS.map((t) => (
                <NodeCard key={t.id} item={t} side="left" dim={dimNode(t)} onHover={setHover} />
              ))}
            </div>

            {/* Links + hub */}
            <div className="relative px-[13%]">
              <svg
                viewBox={`0 0 ${VB_W} ${MAP_H}`}
                preserveAspectRatio="none"
                className="absolute inset-y-0 left-[13%] h-full w-[74%]"
                aria-hidden="true"
              >
                {TENANTS.map((t, i) => {
                  const s = lineStyle(t, i);
                  return (
                    <path
                      key={t.id}
                      d={leftPath(ROW_Y[i])}
                      fill="none"
                      stroke={s.stroke}
                      strokeWidth={s.width}
                      strokeDasharray="4 6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="sv-flow"
                      style={{ opacity: s.opacity, transition: "opacity 250ms, stroke-width 250ms" }}
                    />
                  );
                })}
                {OPERATORS.map((o, i) => {
                  const s = lineStyle(o, i);
                  return (
                    <path
                      key={o.id}
                      d={rightPath(ROW_Y[i])}
                      fill="none"
                      stroke={s.stroke}
                      strokeWidth={s.width}
                      strokeDasharray="4 6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      className="sv-flow"
                      style={{ opacity: s.opacity, transition: "opacity 250ms, stroke-width 250ms", animationDirection: "reverse" }}
                    />
                  );
                })}
              </svg>

              {/* Hub */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: HUB_Y }}
              >
                <div
                  aria-hidden="true"
                  className="sv-pulse pointer-events-none absolute -inset-8 rounded-full bg-violet-500/25 blur-2xl"
                />
                <div className="relative flex h-[95px] w-[95px] flex-col items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-500 to-indigo-700 text-white shadow-[0_18px_40px_-12px_rgba(91,76,230,0.8)] ring-1 ring-inset ring-white/20">
                  <WaveIcon />
                  <p className="mt-2 text-[10px] font-medium">SmartVoice</p>
                  <p className={`mt-0.5 text-[7px] uppercase tracking-[0.18em] text-white/60 ${mono}`}>Hub</p>
                </div>
              </div>
            </div>

            {/* Operators */}
            <div className="flex flex-col gap-[36px] pt-[38px]">
              {OPERATORS.map((o) => (
                <NodeCard key={o.id} item={o} side="right" dim={dimNode(o)} onHover={setHover} />
              ))}
            </div>
          </div>
        </section>

        {/* Protocols */}
        <section aria-label="Protocol health" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PROTOCOLS.map((p, i) => (
            <ProtocolCard key={p.name} p={p} index={i} dim={onlyDegraded && p.state !== "Degraded"} />
          ))}
        </section>
      </div>
    </div>
  );
}