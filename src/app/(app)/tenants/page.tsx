"use client";

import { Icon } from "@/components/Icon";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* ────────────────────────────── Types & data ────────────────────────────── */

type OpCode = "M" | "A" | "G" | "9";
type Status = "Active" | "Inactive";

type Tenant = {
  id: number;
  name: string;
  code: string;
  contact: string;
  email: string;
  operators: OpCode[];
  products: string[];
  status: Status;
  created: string;
};

const SEED: [string, string, string][] = [
  ["QuickVibe Solutions", "Chidi Okafor", "quickvibe.ng"],
  ["Lagos Media Hub", "Fatima Bello", "lagosmedia.com"],
  ["Abuja Digital Labs", "Emeka Nwosu", "abujadigital.ng"],
  ["Kano Connect", "Aminu Sani", "kanoconnect.ng"],
  ["Port Harcourt Telecoms", "Ngozi Eze", "phtelecoms.com"],
  ["BlueWave Interactive", "Tunde Adeyemi", "bluewave.ng"],
  ["Eko Sound Studios", "Bisi Alabi", "ekosound.com"],
  ["Naija Pulse Media", "Yusuf Garba", "naijapulse.ng"],
  ["Orbit Mobile Services", "Adaeze Obi", "orbitmobile.ng"],
  ["Savanna Networks", "Ibrahim Musa", "savannanet.com"],
  ["Zenith Voice Africa", "Kemi Ogunleye", "zenithvoice.africa"],
  ["Harmattan Digital", "Segun Balogun", "harmattan.ng"],
  ["Ikeja Creative Works", "Chiamaka Eze", "ikejacreative.com"],
  ["Delta Airwaves", "Efe Oghene", "deltaairwaves.ng"],
  ["Rhythm Box Entertainment", "Femi Adebayo", "rhythmbox.ng"],
  ["Sahel Messaging", "Hauwa Lawal", "sahelmsg.com"],
  ["Unity Mobile Content", "Obinna Okeke", "unitymobile.ng"],
  ["Capital Tone Ltd", "Zainab Yusuf", "capitaltone.ng"],
  ["Niger Bridge Telecom", "Chinedu Nnamdi", "nigerbridge.com"],
  ["Palmwine Interactive", "Ayo Martins", "palmwine.ng"],
  ["Jos Plateau Media", "Dauda Pam", "josplateau.ng"],
  ["Calabar Beats", "Etim Asuquo", "calabarbeats.com"],
  ["Ogun Wireless", "Folake Dosunmu", "ogunwireless.ng"],
  ["Ibadan Voice Network", "Sola Akande", "ibadanvoice.ng"]
];

const OP_PATTERN: OpCode[][] = [["M", "A"], ["G"], ["M"], ["A", "G"], ["M", "A", "G"], ["9"], ["M", "9"], ["A"]];
const PRODUCT_PATTERN: string[][] = [
  ["NameTune", "SmartBiz"],
  ["BdayHype"],
  ["NameTune"],
  ["SmartBiz", "BdayHype"],
  ["NameTune", "BdayHype"],
  ["SmartBiz"]
];

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const TENANTS: Tenant[] = SEED.map(([name, contact, domain], i) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const code =
    i === 0
      ? "T-88210-QV"
      : i === 1
        ? "T-90042-LM"
        : `T-${10000 + ((i * 7919 + 4231) % 89999)}-${initials}`;
  const daysBack = i === 0 ? 0 : i === 1 ? 15 : 15 + (i - 1) * 11;
  const date = new Date(2023, 10, 12);
  date.setDate(date.getDate() - daysBack);

  return {
    id: i + 1,
    name,
    code,
    contact,
    email: `${contact.split(" ")[0].toLowerCase()}@${domain}`,
    operators: OP_PATTERN[i % OP_PATTERN.length],
    products: PRODUCT_PATTERN[i % PRODUCT_PATTERN.length],
    status: i === 1 || i % 5 === 3 ? "Inactive" : "Active",
    created: fmtDate(date)
  };
});

const OPERATORS: Record<OpCode, { name: string; cls: string }> = {
  M: { name: "MTN", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
  A: { name: "Airtel", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" },
  G: { name: "Glo", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
  "9": { name: "9mobile", cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" }
};

const PRODUCTS: Record<string, string> = {
  NameTune:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  SmartBiz:
    "bg-teal-50 text-teal-700 ring-teal-600/15 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
  BdayHype:
    "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20"
};

const TILES = [
  "bg-indigo-50 text-indigo-600 ring-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  "bg-violet-50 text-violet-600 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
  "bg-teal-50 text-teal-600 ring-teal-600/10 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20",
  "bg-sky-50 text-sky-600 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20"
];

const PAGE_SIZE = 10;

const card =
  "rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.10)] " +
  "dark:border-slate-800 dark:bg-[#0A0F1E] dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.02]";

const control =
  "h-10 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-700 outline-none transition-all duration-200 " +
  "hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] " +
  "dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-indigo-500 dark:focus:bg-slate-900";

/* ────────────────────────────── Small pieces ────────────────────────────── */

function StatusPill({ status }: { status: Status }) {
  const active = status === "Active";
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset " +
        (active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20"
          : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20")
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`} />
      {status}
    </span>
  );
}

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
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`${control} w-full cursor-pointer appearance-none pl-3.5 pr-9`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/** Row action menu, rendered in a portal so the table's scroll area never clips it */
function RowMenu({ tenant }: { tenant: Tenant }) {
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

  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${tenant.name}`}
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
            className="tn-pop z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-[#0C1222]"
          >
            <button role="menuitem" type="button" className={`${item} text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white`}>
              <Icon name="eye" className="h-4 w-4" />
              View details
            </button>
            <button role="menuitem" type="button" className={`${item} text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white`}>
              <Icon name="edit" className="h-4 w-4" />
              Edit tenant
            </button>
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
            <button
              role="menuitem"
              type="button"
              className={`${item} text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400`}
            >
              <Icon name="power" className="h-4 w-4" />
              {tenant.status === "Active" ? "Deactivate" : "Activate"}
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

/* ────────────────────────────── Page ────────────────────────────── */

export default function TenantsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [operator, setOperator] = useState("all");
  const [product, setProduct] = useState("all");
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TENANTS.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (operator !== "all" && !t.operators.includes(operator as OpCode)) return false;
      if (product !== "all" && !t.products.includes(product)) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.contact.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
      );
    });
  }, [query, status, operator, product]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pages);
  const startIdx = (current - 1) * PAGE_SIZE;
  const rows = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const extraActive = product !== "all" ? 1 : 0;
  const hasFilters = query || status !== "all" || operator !== "all" || product !== "all";

  const reset = () => {
    setQuery("");
    setStatus("all");
    setOperator("all");
    setProduct("all");
    setPage(1);
  };

  const th = "px-5 py-3 text-left text-[15px] font-light text-slate-400 dark:text-slate-400";

  return (
    <div className="relative">
      <style>{`
        @keyframes tn-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tn-row { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tn-pop { from { opacity: 0; transform: translateY(-4px) scale(.97); } to { opacity: 1; transform: none; } }
        /* "backwards" fill keeps the settled element free of transforms */
        .tn-rise { animation: tn-rise .7s cubic-bezier(.22,1,.36,1) backwards; }
        .tn-row { animation: tn-row .4s ease-out backwards; }
        .tn-pop { animation: tn-pop .16s ease-out; transform-origin: top right; }
        @media (prefers-reduced-motion: reduce) { .tn-rise, .tn-row, .tn-pop { animation: none; } }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.09),transparent_70%)] dark:bg-[radial-gradient(55%_100%_at_30%_0%,rgba(99,102,241,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-6 p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="tn-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
              Tenant Management
            </h2>
            <p className="mt-1 text-[15px] font-light text-slate-500 dark:text-slate-400">
              Configure and monitor platform tenants and their service assignments.
            </p>
          </div>
          <Link
            href="/tenants/new"
            className="inline-flex h-10 items-center gap-2 rounded bg-indigo-600 px-4 text-sm font-medium text-white shadow-[0_10px_22px_-10px_rgba(79,70,229,0.8)] outline-none transition-all duration-300 hover:-translate-y-px hover:bg-indigo-500 hover:shadow-[0_14px_26px_-10px_rgba(79,70,229,0.9)] focus-visible:ring-4 focus-visible:ring-indigo-500/30 active:translate-y-0 active:scale-[0.99]"
          >
            <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
            Register New Tenant
          </Link>
        </header>

        {/* Filters */}
        <section className={`tn-rise ${card} p-4`} style={{ animationDelay: "80ms" }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="group relative min-w-[240px] flex-1">
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
                placeholder="Search by name, code or business ID…"
                aria-label="Search tenants"
                className={`${control} w-full pl-10 pr-3.5 placeholder:text-slate-400 dark:placeholder:text-slate-500 [&::-webkit-search-cancel-button]:appearance-none`}
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
                  { value: "Inactive", label: "Status: Inactive" }
                ]}
              />
            </div>

            <div className="w-full sm:w-auto sm:min-w-[160px]">
              <FilterSelect
                label="Operator"
                value={operator}
                onChange={(v) => {
                  setOperator(v);
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "Operator: All" },
                  ...Object.entries(OPERATORS).map(([k, o]) => ({ value: k, label: `Operator: ${o.name}` }))
                ]}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              className={
                "inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
                (showMore
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                  : "border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              <Icon name="filter" className="h-4 w-4" />
              More filters
              {extraActive > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[11px] text-white">
                  {extraActive}
                </span>
              )}
            </button>
          </div>

          {/* Expandable filters */}
          <div
            className={
              "grid transition-all duration-300 ease-out " +
              (showMore ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
            }
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Product</span>
                {["all", ...Object.keys(PRODUCTS)].map((p) => (
                  <button
                    key={p}
                    type="button"
                    tabIndex={showMore ? 0 : -1}
                    onClick={() => {
                      setProduct(p);
                      setPage(1);
                    }}
                    className={
                      "rounded-lg border px-3 py-1.5 text-xs font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
                      (product === p
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600")
                    }
                  >
                    {p === "all" ? "All products" : p}
                  </button>
                ))}
                {hasFilters && (
                  <button
                    type="button"
                    tabIndex={showMore ? 0 : -1}
                    onClick={reset}
                    className="ml-auto text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className={`tn-rise ${card} overflow-hidden`} style={{ animationDelay: "160ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-white/[0.015]">
                  <th scope="col" className={th}>Tenant</th>
                  <th scope="col" className={th}>Business contact</th>
                  <th scope="col" className={th}>Operators</th>
                  <th scope="col" className={th}>Products</th>
                  <th scope="col" className={th}>Status</th>
                  <th scope="col" className={th}>Created</th>
                  <th scope="col" className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody
                key={`${current}-${status}-${operator}-${product}`}
                className="divide-y divide-slate-100 dark:divide-slate-800/60"
              >
                {rows.map((t, i) => (
                  <tr
                    key={t.id}
                    className="tn-row transition-colors duration-200 hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[13px] font-medium ring-1 ring-inset ${TILES[t.id % TILES.length]}`}
                        >
                          {t.name
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </span>
                        <div className="min-w-0 leading-tight">
                          <p className="text-[14.5px] font-medium text-slate-900 dark:text-white">{t.name}</p>
                          <p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-500">{t.code}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-800 dark:text-slate-200">{t.contact}</p>
                      <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{t.email}</p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex -space-x-2">
                        {t.operators.map((o) => (
                          <span
                            key={o}
                            title={OPERATORS[o].name}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ring-2 ring-white dark:ring-[#0A0F1E] ${OPERATORS[o].cls}`}
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {t.products.map((p) => (
                          <span
                            key={p}
                            className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${PRODUCTS[p]}`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusPill status={t.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {t.created}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <RowMenu tenant={t} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Icon name="search" className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">No tenants found</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Try adjusting your search or filters.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  Clear filters
                </button>
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
                  <span className="font-medium text-slate-700 dark:text-slate-200">{total}</span> tenants
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