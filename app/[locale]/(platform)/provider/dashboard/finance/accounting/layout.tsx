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
            <div className="border-b border-black/10 dark:border-white/10 pb-2">
                <nav className="flex items-center gap-6">
                    {tabs.map((tab) => {
                        const isExactlyActive = tab.href === "/provider/dashboard/finance/accounting" 
                            ? pathname === tab.href 
                            : pathname?.startsWith(tab.href);

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

            <div className="pt-4">
                {children}
            </div>
        </div>
    );
}
