"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("FinanceModule");

  const tabs = [
    { key: "dashboard", name: t("tabs.dashboard"), href: "/provider/dashboard/finance" },
    { key: "budgets", name: t("tabs.budgets"), href: "/provider/dashboard/finance/budgets" },
    { key: "executions", name: t("tabs.executions"), href: "/provider/dashboard/finance/executions" },
    { key: "approvals", name: t("tabs.approvals"), href: "/provider/dashboard/finance/approvals" },
    { key: "accounting", name: t("tabs.accounting"), href: "/provider/dashboard/finance/accounting" },
    { key: "settings", name: t("tabs.settings"), href: "/provider/dashboard/finance/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 sm:pt-12 sm:pb-8 space-y-6">
        
        {/* ── HEADER MÓDULO ─────────────────────────────────────────────── */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-6 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* ── NAVEGACIÓN TABULAR ────────────────────────────────────── */}
          <nav className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 -mb-px">
            {tabs.map((tab) => {
              const isExactlyActive =
                tab.href === "/provider/dashboard/finance"
                  ? pathname === tab.href
                  : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center",
                    isExactlyActive
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-800"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-[#111]"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── CONTENIDO DINÁMICO ────────────────────────────────────────── */}
        <div className="pt-2">{children}</div>

      </div>
    </div>
  );
}