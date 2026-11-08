"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

type NavItem = { label: string; href: string; icon: IconName; badge?: string };

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Platform",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Tenants", href: "/tenants", icon: "tenants", badge: "24" },
      { label: "Operators", href: "/operators", icon: "operators" },
      { label: "Connections", href: "/connections", icon: "connections" },
      { label: "Catalogue", href: "/catalogue", icon: "catalogue" }
    ]
  },
  {
    title: "Operations",
    items: [
      { label: "Subscribers", href: "/subscribers", icon: "subscribers", badge: "842K" },
      { label: "Subscriptions", href: "/subscriptions", icon: "subscriptions" }
    ]
  },
  {
    title: "Monitoring",
    items: [{ label: "Audit logs", href: "/audit-logs", icon: "audit" }]
  }
];

export function Sidebar({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />

      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex w-[272px] shrink-0 flex-col overflow-hidden bg-[#060A17] " +
          "transition-transform duration-300 ease-out lg:static lg:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* ── Atmosphere ── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(120%_55%_at_0%_0%,rgba(99,102,241,0.20),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(100%_40%_at_100%_100%,rgba(45,212,191,0.07),transparent_65%)]" />
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "linear-gradient(to bottom,#000,transparent 55%)",
              WebkitMaskImage: "linear-gradient(to bottom,#000,transparent 55%)"
            }}
          />
          {/* Hairline edge that fades out toward the bottom */}
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/15 via-white/[0.06] to-transparent" />
        </div>

        {/* ── Brand ── */}
        <div className="relative flex h-[68px] shrink-0 items-center gap-3 px-5">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-xl bg-indigo-500/60 blur-lg"
            />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-white/20">
              <Icon name="wave" className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
          <div className="leading-none">
            <p className="text-[16px] font-semibold tracking-tight text-white">
              SmartVoice
            </p>
            <span className="mt-1.5 inline-block rounded-md bg-indigo-400/10 px-1.5 py-[3px] text-[10px] font-medium leading-none text-indigo-300 ring-1 ring-inset ring-indigo-300/20">
              Suite
            </span>
          </div>
        </div>

        <div className="relative mx-5 h-px bg-gradient-to-r from-white/10 via-white/[0.06] to-transparent" />

        {/* ── Navigation ── */}
        <nav
          aria-label="Main"
          className="relative flex-1 space-y-6 overflow-y-auto px-3 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="mb-2.5 flex items-center gap-3 px-3">
                <p className="text-[11px] font-medium text-slate-500">
                  {section.title}
                </p>
                <span className="h-px flex-1 bg-gradient-to-r from-white/[0.07] to-transparent" />
              </div>

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href} className="relative">
                      {/* Active indicator */}
                      <span
                        aria-hidden="true"
                        className={
                          "absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-300 to-indigo-500 shadow-[0_0_12px_rgba(129,140,248,0.9)] transition-all duration-300 " +
                          (active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0")
                        }
                      />
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={
                          "group relative flex items-center gap-3 rounded-xl py-1.5 pl-1.5 pr-3 text-[14px] outline-none transition-all duration-300 " +
                          "focus-visible:ring-2 focus-visible:ring-indigo-400/60 " +
                          (active
                            ? "bg-gradient-to-r from-indigo-500/[0.20] via-indigo-500/[0.07] to-transparent font-medium text-white ring-1 ring-inset ring-white/[0.07]"
                            : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100")
                        }
                      >
                        <span
                          className={
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-all duration-300 " +
                            (active
                              ? "bg-indigo-500/25 text-indigo-100 ring-indigo-300/25 shadow-[0_0_18px_-2px_rgba(129,140,248,0.6)]"
                              : "bg-white/[0.03] text-slate-500 ring-white/[0.06] group-hover:bg-white/[0.07] group-hover:text-slate-200 group-hover:ring-white/10")
                          }
                        >
                          <Icon name={item.icon} className="h-[17px] w-[17px]" />
                        </span>

                        <span className="flex-1 truncate">{item.label}</span>

                        {item.badge && (
                          <span
                            className={
                              "rounded-md px-1.5 py-0.5 text-[11px] tabular-nums leading-none ring-1 ring-inset transition-colors duration-300 " +
                              (active
                                ? "bg-indigo-400/15 text-indigo-200 ring-indigo-300/20"
                                : "bg-white/[0.04] text-slate-500 ring-white/[0.06] group-hover:text-slate-300")
                            }
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Workspace card ── */}
        <div className="relative p-3">
          <div className="rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-3 ring-1 ring-inset ring-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-400/10 text-teal-300 ring-1 ring-inset ring-teal-300/20">
                <Icon name="check" className="h-[17px] w-[17px]" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[13px] font-medium text-slate-100">
                  Production
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
                  Connected
                </p>
              </div>
              <span className="text-[11px] text-slate-600">v2.4.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}