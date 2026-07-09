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
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <nav className="flex items-center gap-4">
                    {tabs.map((tab) => {
                        const isExactlyActive = tab.href === "/provider/dashboard/finance/accounting" 
                            ? pathname === tab.href 
                            : pathname?.startsWith(tab.href);

                        return (
                            <Link 
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                    isExactlyActive 
                                        ? "bg-black text-white dark:bg-white dark:text-black" 
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
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
