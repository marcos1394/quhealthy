"use client";

import React from "react";
import { BookOpen, FileText, Activity } from "lucide-react";
import Link from "next/link";

export default function AccountingDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Pólizas Contables</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        Registra cargos y abonos con cumplimiento de Contabilidad Electrónica SAT (Anexo 24).
                    </p>
                    <Link 
                        href="/provider/dashboard/finance/accounting/journals"
                        className="mt-auto px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium w-full"
                    >
                        Ver Pólizas
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Catálogo de Cuentas</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        Visualiza el código agrupador de cuentas del SAT y la jerarquía contable.
                    </p>
                    <Link 
                        href="/provider/dashboard/finance/accounting/accounts"
                        className="mt-auto px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium w-full"
                    >
                        Ver Catálogo
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow opacity-60">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                        <Activity className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Balanza de Comprobación</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        Generación de XMLs para envío de contabilidad electrónica al SAT. (Próximamente)
                    </p>
                    <button disabled className="mt-auto px-4 py-2 bg-gray-200 text-gray-500 dark:bg-zinc-800 dark:text-gray-400 rounded-lg text-sm font-medium w-full cursor-not-allowed">
                        Próximamente
                    </button>
                </div>

            </div>
        </div>
    );
}
