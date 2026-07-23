"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Resumen", href: "/provider/dashboard/finance/accounting" },
        { name: "Pólizas", href: "/provider/dashboard/finance/accounting/journals" },
        { name: "Catálogo de Cuentas", href: "/provider/dashboard/finance/accounting/accounts" },
        { name: "Configuración Mapeo", href: "/provider/dashboard/finance/accounting/mapping" },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-gray-800 p-2 shadow-sm overflow-x-auto custom-scrollbar">
                <nav className="flex items-center gap-2 min-w-max">
                    {tabs.map((tab) => {
                        const isExactlyActive = tab.href === "/provider/dashboard/finance/accounting" 
                            ? pathname === tab.href || pathname === "/es/provider/dashboard/finance/accounting"
                            : pathname?.includes(tab.href);

                        return (
                            <Link 
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "text-sm font-bold px-4 py-2.5 rounded-xl transition-all",
                                    isExactlyActive 
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-900/50"
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
