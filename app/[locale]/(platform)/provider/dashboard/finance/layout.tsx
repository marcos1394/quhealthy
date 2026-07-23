"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const t = useTranslations('FinanceModule'); // Asegúrate de agregar estas keys en tus archivos de traducción

    const tabs = [
        { name: "Dashboard", href: "/provider/dashboard/finance" },
        { name: "Presupuestos", href: "/provider/dashboard/finance/budgets" },
        { name: "Ejecución", href: "/provider/dashboard/finance/executions" },
        { name: "Aprobaciones", href: "/provider/dashboard/finance/approvals" },
        { name: "Contabilidad", href: "/provider/dashboard/finance/accounting" },
        { name: "Configuración", href: "/provider/dashboard/finance/settings" },
    ];

    return (
        <div className="space-y-8 min-h-screen bg-gray-50/50 dark:bg-[#050505] p-6 lg:p-10">
            <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Administración y Finanzas
                </h1>
                <p className="text-sm font-medium text-gray-500 mt-2">
                    Control presupuestal, facturación y telemetría financiera.
                </p>
                
                <nav className="flex items-center gap-2 mt-8 overflow-x-auto custom-scrollbar pb-2">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
                        // El dashboard base necesita match exacto para no pisar a los hijos
                        const isExactlyActive = tab.href === "/provider/dashboard/finance" 
                            ? pathname === tab.href 
                            : isActive;

                        return (
                            <Link 
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap",
                                    isExactlyActive 
                                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-gray-800" 
                                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#111]"
                                )}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-2">
                {children}
            </div>
        </div>
    );
}
