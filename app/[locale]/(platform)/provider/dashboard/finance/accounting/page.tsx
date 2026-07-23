"use client";

import React from "react";
import { BookOpen, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AccountingDashboardPage() {
    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen Contable</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">
                    Gestiona el catálogo de cuentas y las pólizas para contabilidad electrónica SAT.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all group">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                        <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pólizas Contables</h3>
                    <p className="text-sm font-medium text-gray-500 mt-2 mb-8 px-4">
                        Registra cargos y abonos con cumplimiento de Contabilidad Electrónica SAT (Anexo 24).
                    </p>
                    <Link 
                        href="/provider/dashboard/finance/accounting/journals"
                        className="mt-auto flex items-center justify-center h-11 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold w-full shadow-sm transition-colors"
                    >
                        Ver Pólizas
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all group">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Catálogo de Cuentas</h3>
                    <p className="text-sm font-medium text-gray-500 mt-2 mb-8 px-4">
                        Visualiza el código agrupador de cuentas del SAT y la jerarquía contable.
                    </p>
                    <Link 
                        href="/provider/dashboard/finance/accounting/accounts"
                        className="mt-auto flex items-center justify-center h-11 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-bold w-full shadow-sm transition-colors"
                    >
                        Ver Catálogo
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm opacity-60">
                    <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                        <Activity className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Balanza de Comprobación</h3>
                    <p className="text-sm font-medium text-gray-500 mt-2 mb-8 px-4">
                        Generación de XMLs para envío de contabilidad electrónica al SAT. (Próximamente)
                    </p>
                    <button disabled className="mt-auto flex items-center justify-center h-11 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl text-sm font-bold w-full cursor-not-allowed">
                        Próximamente
                    </button>
                </div>
            </div>
        </div>
    );
}
