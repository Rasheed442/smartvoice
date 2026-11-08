"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

/* Route → [section, title] used for the breadcrumb and heading */
const ROUTES: Record<string, [string, string]> = {
  "/dashboard": ["Platform", "Dashboard"],
  "/tenants": ["Platform", "Tenants"],
  "/operators": ["Platform", "Operators"],
  "/connections": ["Platform", "Connections"],
  "/catalogue": ["Platform", "Catalogue"],
  "/subscribers": ["Operations", "Subscribers"],
  "/subscriptions": ["Operations", "Subscriptions"],
  "/audit-logs": ["Monitoring", "Audit logs"],
  "/calls": ["Operations", "Calls"],
  "/settings": ["Account", "Settings"]
};

type Notice = { id: number; title: string; time: string; tone: "warn" | "info" | "ok" };

const INITIAL_NOTICES: Notice[] = [
  { id: 1, title: "SMPP Node 1 is responding slowly", time: "10s ago", tone: "warn" },
  { id: 2, title: "Tenant Alpha provisioned 12 SIP trunks", time: "2m ago", tone: "info" },
  { id: 3, title: "Nightly backup completed", time: "1h ago", tone: "ok" }
];

const TONE_DOT = {
  warn: "bg-amber-500",
  info: "bg-indigo-500",
  ok: "bg-emerald-500"
};

/* Closes a popover on outside click or Escape */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return { open, setOpen, ref };
}

function Panel({
  open,
  width,
  children
}: {
  open: boolean;
  width: string;
  children: ReactNode;
}) {
  return (
    <div
      role="menu"
      className={
        `absolute right-0 top-[calc(100%+10px)] ${width} origin-top-right overflow-hidden rounded-md border border-slate-200 bg-white ` +
        "shadow-[0_24px_48px_-16px_rgba(15,23,42,0.28)] transition-all duration-200 ease-out dark:border-slate-800 dark:bg-[#0C1222] " +
        (open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-[0.97] opacity-0")
      }
    >
      {children}
    </div>
  );
}

const iconButton =
  "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-transparent text-slate-500 transition-all duration-200 " +
  "hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 " +
  "dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/70 dark:hover:text-white";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const [section, title] =
    ROUTES[pathname] ??
    Object.entries(ROUTES).find(([k]) => pathname.startsWith(k))?.[1] ??
    ["SmartVoice", "Console"];

  const searchRef = useRef<HTMLInputElement>(null);
  const notif = usePopover();
  const profile = usePopover();
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [unread, setUnread] = useState(true);

  // "/" or Ctrl/Cmd + K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-[68px] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/75 px-4 backdrop-blur-xl sm:px-6 dark:border-slate-800/80 dark:bg-[#080C19]/75">
      {/* Accent hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
      />

      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className={`${iconButton} -ml-1 lg:hidden`}
      >
        <Icon name="menu" className="h-5 w-5" />
      </button>

      {/* Title + breadcrumb */}
      <div className="min-w-0 leading-tight">
        <p className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex dark:text-slate-500">
          <span>{section}</span>
          <Icon name="chevron" className="h-3 w-3 -rotate-90" />
          <span className="text-slate-500 text-[15px] dark:text-slate-400">{title}</span>
        </p>
        {/* <h1 className="truncate text-[17px] font-medium tracking-tight text-slate-900 sm:mt-0.5 dark:text-white">
          {title}
        </h1> */}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Environment pill */}
        <span className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 md:flex dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300 dark:shadow-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Production
        </span>

        {/* Search */}
        <div className="group relative hidden sm:block">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-500"
          />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search tenants, operators…"
            aria-label="Search"
            className="h-8 w-56 rounded-md border border-slate-200 bg-slate-50/80 pl-10 pr-14 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 text-[15px] dark:text-slate-400 hover:border-slate-300 focus:w-80 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-indigo-500 dark:focus:bg-slate-900 [&::-webkit-search-cancel-button]:appearance-none"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] leading-none text-slate-400 transition-opacity duration-200 group-focus-within:opacity-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <div ref={notif.ref} className="relative">
          <button
            type="button"
            onClick={() => {
              notif.setOpen((v) => !v);
              profile.setOpen(false);
            }}
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={notif.open}
            className={iconButton}
          >
            <Icon name="bell" />
            {unread && notices.length > 0 && (
              <span className="absolute right-[11px] top-[11px] h-[7px] w-[7px] rounded-full bg-indigo-400" />
            )}
          </button>

          <Panel open={notif.open} width="w-[340px]">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-light text-slate-900 dark:text-white">Notifications</p>
              {notices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUnread(false)}
                  className="text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {notices.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">You’re all caught up.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-1">
                {notices.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT[n.tone]} ${
                        unread ? "" : "opacity-40"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {notices.length > 0 && (
              <>
                <div className="h-px bg-slate-100 dark:bg-slate-800" />
                <button
                  type="button"
                  onClick={() => setNotices([])}
                  className="w-full px-4 py-2.5 text-center text-xs text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-white"
                >
                  Clear all
                </button>
              </>
            )}
          </Panel>
        </div>

        <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-800" />

        {/* Profile */}
        <div ref={profile.ref} className="relative">
          <button
            type="button"
            onClick={() => {
              profile.setOpen((v) => !v);
              notif.setOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={profile.open}
            aria-label="Account menu"
            className="flex items-center gap-2.5 rounded-xl border border-transparent py-1 pl-1 pr-2 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/70"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/20 text-xs font-medium text-white">
              JD
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[13px] font-light text-slate-900 dark:text-white">Jane Doe</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">Administrator</span>
            </span>
            <Icon
              name="chevron"
              className={
                "h-3.5 w-3.5 text-slate-400 transition-transform duration-300 " +
                (profile.open ? "rotate-180" : "")
              }
            />
          </button>

          <Panel open={profile.open} width="w-60">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 text-sm font-medium text-white">
                JD
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">Jane Doe</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">admin@smartvoice.com</p>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800" />
            <div className="p-1.5">
              {[
                { label: "Profile", icon: "user" as const },
                { label: "Settings", icon: "settings" as const }
              ].map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800" />
            <div className="p-1.5">
              <button
                role="menuitem"
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <Icon name="logout" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </header>
  );
}