"use client";

import { Icon, IconName } from "@/components/Icon";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* ────────────────────────────── Types & data ────────────────────────────── */

type Status = "Active" | "Inactive" | "Failed";
type Brand = "amber" | "rose" | "emerald" | "teal" | "sky" | "indigo" | "violet";

type Operator = {
  id: number;
  name: string;
  brand: Brand;
  mcc: string;
  mnc: string;
  country: string;
  iso: string;
  networkId: string;
  connections: number;
  status: Status;
  capabilities: string[];
};

const OPERATORS: Operator[] = [
  { id: 1, name: "MTN Nigeria", brand: "amber", mcc: "621", mnc: "30", country: "Nigeria", iso: "NG", networkId: "MTN-NG-01", connections: 32, status: "Active", capabilities: ["Charging", "CRBT", "SMS", "USSD", "WhatsApp", "Voice"] },
  { id: 2, name: "Airtel Nigeria", brand: "rose", mcc: "621", mnc: "20", country: "Nigeria", iso: "NG", networkId: "AIRTEL-NG-01", connections: 28, status: "Active", capabilities: ["Charging", "USSD", "WhatsApp", "SMS", "Voice"] },
  { id: 3, name: "Glo Nigeria", brand: "emerald", mcc: "621", mnc: "50", country: "Nigeria", iso: "NG", networkId: "GLO-NG-01", connections: 5, status: "Active", capabilities: ["Charging", "SMS", "CRBT"] },
  { id: 4, name: "9mobile Nigeria", brand: "teal", mcc: "621", mnc: "60", country: "Nigeria", iso: "NG", networkId: "9MOB-NG-01", connections: 3, status: "Active", capabilities: ["Charging", "SMS"] },
  { id: 5, name: "MTN Ghana", brand: "amber", mcc: "620", mnc: "01", country: "Ghana", iso: "GH", networkId: "MTN-GH-01", connections: 5, status: "Active", capabilities: ["Charging", "CRBT", "SMS", "USSD"] },
  { id: 6, name: "Vodafone Ghana", brand: "rose", mcc: "620", mnc: "02", country: "Ghana", iso: "GH", networkId: "VODA-GH-01", connections: 3, status: "Active", capabilities: ["Charging", "SMS", "USSD"] },
  { id: 7, name: "AirtelTigo Ghana", brand: "sky", mcc: "620", mnc: "06", country: "Ghana", iso: "GH", networkId: "ATIGO-GH-01", connections: 2, status: "Active", capabilities: ["Charging", "SMS"] },
  { id: 8, name: "Safaricom Kenya", brand: "emerald", mcc: "639", mnc: "02", country: "Kenya", iso: "KE", networkId: "SAFCOM-KE-01", connections: 2, status: "Active", capabilities: ["Charging", "SMS", "USSD", "WhatsApp"] },
  { id: 9, name: "Airtel Kenya", brand: "rose", mcc: "639", mnc: "03", country: "Kenya", iso: "KE", networkId: "AIRTEL-KE-01", connections: 1, status: "Active", capabilities: ["Charging", "SMS"] },
  { id: 10, name: "Vodacom South Africa", brand: "indigo", mcc: "655", mnc: "01", country: "South Africa", iso: "ZA", networkId: "VODACOM-ZA-01", connections: 1, status: "Active", capabilities: ["Charging", "SMS", "USSD"] },
  { id: 11, name: "MTN South Africa", brand: "amber", mcc: "655", mnc: "10", country: "South Africa", iso: "ZA", networkId: "MTN-ZA-01", connections: 1, status: "Active", capabilities: ["Charging", "CRBT"] },
  { id: 12, name: "Telkom South Africa", brand: "violet", mcc: "655", mnc: "02", country: "South Africa", iso: "ZA", networkId: "TELKOM-ZA-01", connections: 1, status: "Active", capabilities: ["Charging", "SMS"] },
  { id: 13, name: "Cell C South Africa", brand: "sky", mcc: "655", mnc: "07", country: "South Africa", iso: "ZA", networkId: "CELLC-ZA-01", connections: 0, status: "Inactive", capabilities: ["SMS"] }
];

const BRAND: Record<Brand, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  teal: "bg-teal-50 text-teal-700 ring-teal-600/15 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20"
};

const STATUS_STYLE: Record<Status, { pill: string; dot: string }> = {
  Active: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500"
  },
  Inactive: {
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500"
  },
  Failed: {
    pill: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
    dot: "bg-rose-500"
  }
};

const VISIBLE_CAPS = 3;
const PAGE_SIZE = 10;
const MAX_CONNECTIONS = Math.max(...OPERATORS.map((o) => o.connections));

const card =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.10)] " +
  "dark:border-slate-800 dark:bg-[#0A0F1E] dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.02]";

const control =
  "h-10 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 outline-none transition-all duration-200 " +
  "hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] " +
  "dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-indigo-500 dark:focus:bg-slate-900";

/* ────────────────────────────── Helpers ────────────────────────────── */

function useCountUp(target: number, duration = 900) {
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
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function exportCsv(rows: Operator[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["Operator", "MCC", "MNC", "Country", "Network identifier", "Connections", "Status", "Capabilities"];
  const lines = rows.map((o) =>
    [o.name, o.mcc, o.mnc, o.country, o.networkId, o.connections, o.status, o.capabilities.join("; ")]
      .map(esc)
      .join(",")
  );
  const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "operators.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ────────────────────────────── Summary card ────────────────────────────── */

type Stat = {
  label: string;
  value: number;
  icon: IconName;
  from: string;
  to: string;
  delta: string;
  context: string;
  tone: "good" | "muted";
  trend?: boolean;
};

const PILL = {
  good: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  muted: "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/30"
};

/** Divider visibility per cell for 1 / 2 / 4 column layouts */
const DIVIDERS = [
  { h: "hidden", v: "hidden" },
  { h: "block sm:hidden", v: "hidden sm:block" },
  { h: "block xl:hidden", v: "hidden xl:block" },
  { h: "block xl:hidden", v: "hidden sm:block" }
];

function StatCell({ stat, index }: { stat: Stat; index: number }) {
  const shown = useCountUp(stat.value);
  const d = DIVIDERS[index];
  const line = "pointer-events-none absolute bg-slate-200/90 dark:bg-slate-800";

  return (
    <div className="group relative p-6 transition-colors duration-300 hover:bg-slate-50/60 dark:hover:bg-white/[0.012]">
      <span aria-hidden="true" className={`${line} inset-y-5 left-0 w-px ${d.v}`} />
      <span aria-hidden="true" className={`${line} inset-x-5 top-0 h-px ${d.h}`} />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(90deg, ${stat.from}, ${stat.to} 45%, transparent 100%)` }}
        />
        <span
          className="op-sweep absolute inset-y-0 left-0 w-2/5"
          style={{
            background: `linear-gradient(90deg, transparent, ${stat.from}, ${stat.to}, transparent)`,
            animationDelay: `${index * 0.7}s`
          }}
        />
      </div>

      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${stat.to}12`, color: stat.to, boxShadow: `inset 0 0 0 1px ${stat.to}26` }}
        >
          <Icon name={stat.icon} className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </span>
      </div>

      <p className="mt-5 text-[34px] font-medium leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
        {shown}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PILL[stat.tone]}`}>
          {stat.trend && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
            </svg>
          )}
          {stat.delta}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{stat.context}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────── Small pieces ────────────────────────────── */

function FilterSelect({
  value,
  onChange,
  options,
  label
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`${control} flex w-full cursor-pointer items-center justify-between gap-2 pl-3.5 pr-2 text-left`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-indigo-500" : ""}`}
        />
      </button>

      <div
        role="listbox"
        aria-label={label}
        className={
          "absolute left-0 top-[calc(100%+6px)] z-30 w-full min-w-[190px] origin-top-left overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28)] transition-all duration-150 " +
          "dark:border-slate-700 dark:bg-[#0D1424] " +
          (open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1 scale-[0.98] opacity-0")
        }
      >
        {options.map((o) => {
          const isSelected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={
                "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors duration-100 " +
                (isSelected
                  ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              <span className="truncate">{o.label}</span>
              {isSelected && (
                <Check className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Row menu rendered in a portal so the table's scroll area never clips it */
function RowMenu({ op }: { op: Operator }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = pos !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const toggle = () => {
    if (open) return setPos(null);
    const r = btnRef.current!.getBoundingClientRect();
    setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
  };

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150";
  const neutral = `${item} text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${op.name}`}
        className={
          "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all duration-200 " +
          "hover:border-slate-200 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
          "dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 " +
          (open ? "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800" : "")
        }
      >
        <Icon name="more" strokeWidth={2.6} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", top: pos.top, right: pos.right }}
            className="op-pop z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-[#0C1222]"
          >
            <button role="menuitem" type="button" className={neutral}>
              <Icon name="eye" className="h-4 w-4" />
              View details
            </button>
            <button role="menuitem" type="button" className={neutral}>
              <Icon name="edit" className="h-4 w-4" />
              Edit operator
            </button>
            <button role="menuitem" type="button" className={neutral}>
              <Icon name="connections" className="h-4 w-4" />
              Test connection
            </button>
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <button
              role="menuitem"
              type="button"
              className={`${item} text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400`}
            >
              <Icon name="power" className="h-4 w-4" />
              {op.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  label
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={
        "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
        (active
          ? "border-indigo-600 bg-indigo-600 font-medium text-white shadow-[0_6px_14px_-6px_rgba(79,70,229,0.7)]"
          : disabled
            ? "cursor-not-allowed border-slate-200 bg-white text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white")
      }
    >
      {children}
    </button>
  );
}

type SortKey = "name" | "connections";

function SortHeader({
  label,
  k,
  sort,
  onSort,
  className = ""
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" } | null;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const on = sort?.key === k;
  return (
    <th scope="col" aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"} className={`px-5 py-3 text-left ${className}`}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={
          "group inline-flex items-center gap-1.5 rounded text-xs font-medium uppercase tracking-wider outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
          (on ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200")
        }
      >
        {label}
        <Icon
          name="sort"
          className={
            "h-3.5 w-3.5 transition-all duration-200 " +
            (on ? "text-indigo-500 opacity-100" : "opacity-0 group-hover:opacity-60")
          }
        />
      </button>
    </th>
  );
}

/* ────────────────────────────── Page ────────────────────────────── */

export default function OperatorsPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const stats: Stat[] = useMemo(
    () => [
      {
        label: "Active operators",
        value: OPERATORS.filter((o) => o.status === "Active").length,
        icon: "operators",
        from: "#818CF8",
        to: "#4F46E5",
        delta: "+1",
        context: "this quarter",
        tone: "good",
        trend: true
      },
      {
        label: "Total connections",
        value: OPERATORS.reduce((a, o) => a + o.connections, 0),
        icon: "connections",
        from: "#2DD4BF",
        to: "#0D9488",
        delta: "+6",
        context: "this month",
        tone: "good",
        trend: true
      },
      {
        label: "Countries covered",
        value: new Set(OPERATORS.map((o) => o.country)).size,
        icon: "globe",
        from: "#A78BFA",
        to: "#7C3AED",
        delta: "Stable",
        context: "no change",
        tone: "muted"
      },
      {
        label: "Failed integrations",
        value: OPERATORS.filter((o) => o.status === "Failed").length,
        icon: "alert",
        from: "#FB7185",
        to: "#E11D48",
        delta: "None",
        context: "all healthy",
        tone: "good"
      }
    ],
    []
  );

  const countries = useMemo(() => Array.from(new Set(OPERATORS.map((o) => o.country))), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = OPERATORS.filter((o) => {
      if (country !== "all" && o.country !== country) return false;
      if (status !== "all" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.networkId.toLowerCase().includes(q) ||
        o.country.toLowerCase().includes(q) ||
        o.capabilities.some((c) => c.toLowerCase().includes(q)) ||
        `${o.mcc}${o.mnc}`.includes(q)
      );
    });
    if (sort) {
      list.sort((a, b) => {
        const r = sort.key === "name" ? a.name.localeCompare(b.name) : a.connections - b.connections;
        return sort.dir === "asc" ? r : -r;
      });
    }
    return list;
  }, [query, country, status, sort]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pages);
  const startIdx = (current - 1) * PAGE_SIZE;
  const rows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const hasFilters = query || country !== "all" || status !== "all";

  const onSort = (key: SortKey) => {
    setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" }));
    setPage(1);
  };

  const reset = () => {
    setQuery("");
    setCountry("all");
    setStatus("all");
    setPage(1);
  };

  const th =
    "px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500";

  return (
    <div className="relative">
      <style>{`
        @keyframes op-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes op-row { from { opacity: 0; } to { opacity: 1; } }
        @keyframes op-pop { from { opacity: 0; transform: translateY(-4px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes op-sweep { 0% { transform: translateX(-100%); opacity: 0; } 15% { opacity: 1; } 75% { opacity: 1; } 100% { transform: translateX(250%); opacity: 0; } }
        @keyframes op-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        /* "backwards" fill keeps settled elements free of transforms */
        .op-rise { animation: op-rise .7s cubic-bezier(.22,1,.36,1) backwards; }
        .op-row { animation: op-row .4s ease-out backwards; }
        .op-pop { animation: op-pop .16s ease-out; transform-origin: top right; }
        .op-sweep { animation: op-sweep 5s cubic-bezier(.4,0,.2,1) infinite; }
        .op-bar { transform-origin: left; animation: op-bar .8s cubic-bezier(.22,1,.36,1) backwards; }
        @media (prefers-reduced-motion: reduce) {
          .op-rise, .op-row, .op-pop, .op-bar { animation: none; }
          .op-sweep { animation: none; opacity: 0; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.09),transparent_70%)] dark:bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-6 p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="op-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">Operator Hub</h2>
            <p className="mt-1 text-[15px] font-light text-slate-500 dark:text-slate-400">
              Manage telecommunications operator integrations and core network capabilities.
            </p>
          </div>
          <Link
            href="/operators/new"
            className="inline-flex h-10 items-center gap-2 rounded bg-indigo-600 px-4 text-sm font-medium text-white shadow-[0_10px_22px_-10px_rgba(79,70,229,0.8)] outline-none transition-all duration-300 hover:-translate-y-px hover:bg-indigo-500 hover:shadow-[0_14px_26px_-10px_rgba(79,70,229,0.9)] focus-visible:ring-4 focus-visible:ring-indigo-500/30 active:translate-y-0 active:scale-[0.99]"
          >
            <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
            Add New Operator
          </Link>
        </header>

        {/* Summary */}
        <section
          aria-label="Operator summary"
          className={`op-rise ${card} grid grid-cols-1 overflow-hidden sm:grid-cols-2 xl:grid-cols-4`}
          style={{ animationDelay: "80ms" }}
        >
          {stats.map((s, i) => (
            <StatCell key={s.label} stat={s} index={i} />
          ))}
        </section>

        {/* Table card */}
        <section className={`op-rise ${card} overflow-hidden`} style={{ animationDelay: "160ms" }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="group relative min-w-[240px] flex-1 sm:max-w-md">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-500"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter operators…"
                aria-label="Filter operators"
                className={`${control} w-full pl-10 pr-3.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:appearance-none`}
              />
            </div>

            <div className="w-full sm:w-auto sm:min-w-[170px]">
              <FilterSelect
                label="Country"
                value={country}
                onChange={(v) => {
                  setCountry(v);
                  setPage(1);
                }}
                options={[{ value: "all", label: "Country: All" }, ...countries.map((c) => ({ value: c, label: `Country: ${c}` }))]}
              />
            </div>

            <div className="w-full sm:w-auto sm:min-w-[150px]">
              <FilterSelect
                label="Status"
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "Status: All" },
                  { value: "Active", label: "Status: Active" },
                  { value: "Inactive", label: "Status: Inactive" },
                  { value: "Failed", label: "Status: Failed" }
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => exportCsv(filtered)}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-light text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
            >
              <Icon name="download" className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-white/[0.015]">
                  <SortHeader label="Operator" k="name" sort={sort} onSort={onSort} />
                  <th scope="col" className={th}>Country</th>
                  <th scope="col" className={th}>Network identifier</th>
                  <SortHeader label="Connections" k="connections" sort={sort} onSort={onSort} />
                  <th scope="col" className={th}>Status</th>
                  <th scope="col" className={th}>Capabilities</th>
                  <th scope="col" className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody
                key={`${current}-${country}-${status}-${sort?.key}-${sort?.dir}`}
                className="divide-y divide-slate-100 dark:divide-slate-800/60"
              >
                {rows.map((o, i) => {
                  const extra = o.capabilities.slice(VISIBLE_CAPS);
                  return (
                    <tr
                      key={o.id}
                      className="op-row transition-colors duration-200 hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                      style={{ animationDelay: `${i * 35}ms` }}
                    >
                      {/* Operator */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-light ring-1 ring-inset ${BRAND[o.brand]}`}>
                            {o.name.split(" ")[0].slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0 leading-tight">
                            <p className="text-[14.5px] font-medium text-slate-900 dark:text-white">{o.name}</p>
                            <p className="mt-1 font-mono text-[12px] text-slate-400 dark:text-slate-500">
                              MCC {o.mcc} <span className="px-0.5 text-slate-300 dark:text-slate-700">|</span> MNC {o.mnc}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-light text-slate-600 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/60">
                            {o.iso}
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-200">{o.country}</span>
                        </div>
                      </td>

                      {/* Network identifier */}
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-indigo-50/70 px-2 py-1 font-mono text-[11px] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {o.networkId}
                        </span>
                      </td>

                      {/* Connections */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-7 text-sm font-medium tabular-nums text-slate-900 dark:text-white">{o.connections}</span>
                          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <span
                              className="op-bar block h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                              style={{ width: `${(o.connections / MAX_CONNECTIONS) * 100}%`, animationDelay: `${200 + i * 35}ms` }}
                            />
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-light ring-1 ring-inset ${STATUS_STYLE[o.status].pill}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[o.status].dot}`} />
                          {o.status}
                        </span>
                      </td>

                      {/* Capabilities */}
                      <td className="px-5 py-4">
                        <div className="flex max-w-[280px] flex-wrap gap-1.5">
                          {o.capabilities.slice(0, VISIBLE_CAPS).map((c) => (
                            <span
                              key={c}
                              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-light text-slate-600 ring-1 ring-inset ring-slate-200/70 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-700/60"
                            >
                              {c}
                            </span>
                          ))}
                          {extra.length > 0 && (
                            <span
                              title={extra.join(", ")}
                              className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-light text-indigo-600 ring-1 ring-inset ring-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20"
                            >
                              +{extra.length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <RowMenu op={o} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 && (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Icon name="search" className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">No operators found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer / pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-white/[0.015]">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {total === 0 ? (
                "No results"
              ) : (
                <>
                  Showing <span className="font-medium text-slate-700 dark:text-slate-200">{startIdx + 1}</span> to{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">{startIdx + rows.length}</span> of{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">{total}</span> operators
                </>
              )}
            </p>

            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              <PageButton disabled={current === 1} onClick={() => setPage(current - 1)} label="Previous page">
                Previous
              </PageButton>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <PageButton key={n} active={n === current} onClick={() => setPage(n)} label={`Page ${n}`}>
                  {n}
                </PageButton>
              ))}
              <PageButton disabled={current === pages} onClick={() => setPage(current + 1)} label="Next page">
                Next
              </PageButton>
            </nav>
          </div>
        </section>
      </div>
    </div>
  );
}