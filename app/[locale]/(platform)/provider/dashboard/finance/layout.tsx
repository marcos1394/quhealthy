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
        { name: "Configuración", href: "/provider/dashboard/finance/settings" },
    ];

    return (
        <div className="space-y-6">
            <div className="border-b border-black/20 dark:border-white/20 pb-4">
                <h1 className="text-2xl font-semibold uppercase tracking-tight">
                    Administración y Finanzas
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                    Control presupuestal, facturación y telemetría financiera.
                </p>
                
                <nav className="flex items-center gap-6 mt-6">
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
                                    "text-[10px] font-bold uppercase tracking-widest pb-2 border-b-2 transition-colors",
                                    isExactlyActive 
                                        ? "border-black dark:border-white text-black dark:text-white" 
                                        : "border-transparent text-gray-500 hover:text-black dark:hover:text-white"
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
