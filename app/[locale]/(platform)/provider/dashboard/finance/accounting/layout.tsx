"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("SatAccountingLayout");

  const tabs = [
    { name: t("overview"), href: "/provider/dashboard/finance/accounting" },
    {
      name: t("journals"),
      href: "/provider/dashboard/finance/accounting/journals",
    },
    {
      name: t("accounts"),
      href: "/provider/dashboard/finance/accounting/accounts",
    },
    {
      name: t("mapping"),
      href: "/provider/dashboard/finance/accounting/mapping",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* ── BARRA DE NAVEGACIÓN SECUNDARIA (TABS) ────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-1.5 shadow-sm overflow-x-auto">
          <nav className="flex items-center gap-1.5 min-w-max">
            {tabs.map((tab) => {
              // Limpieza de prefijo de idioma para validación exacta de ruta
              const normalizedPath =
                pathname?.replace(/^\/(es|en)/, "") || "";
              const isOverview =
                tab.href === "/provider/dashboard/finance/accounting";
              const isExactlyActive = isOverview
                ? normalizedPath === tab.href
                : normalizedPath.startsWith(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap",
                    isExactlyActive
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-[#111]"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── CONTENIDO HIJO (VISTAS) ─────────────────────────────────── */}
        <div>{children}</div>

      </div>
    </div>
  );
}