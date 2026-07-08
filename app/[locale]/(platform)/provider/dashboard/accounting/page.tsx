"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, ArrowRight, Activity, FileText, Banknote, Building2 } from 'lucide-react';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function AccountingDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50 dark:bg-[#050505]">
                <QhSpinner size="lg" className="text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                    CARGANDO DATOS FINANCIEROS...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER ARQUITECTÓNICO --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
                            <Landmark className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                                ERP Financiero
                            </p>
                            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                                CONTABILIDAD Y FINANZAS
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                VISIÓN INTEGRAL DEL ESTADO FINANCIERO Y PATRIMONIAL.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- SECTIONS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan de Cuentas */}
                    <div 
                        onClick={() => router.push('/provider/dashboard/accounting/accounts')}
                        className="group border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors min-h-[220px]"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white mb-2">Plan de Cuentas</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Configuración jerárquica del catálogo contable.
                            </p>
                        </div>
                    </div>

                    {/* Centros de Costos */}
                    <div 
                        onClick={() => router.push('/provider/dashboard/accounting/cost-centers')}
                        className="group border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors min-h-[220px]"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white mb-2">Centros de Costos</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Asignación de gastos e ingresos por áreas operativas.
                            </p>
                        </div>
                    </div>

                    {/* Coming Soon: Pólizas */}
                    <div className="group border border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-[#050505]/50 p-8 flex flex-col justify-between min-h-[220px] opacity-70">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
                                <Banknote className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                            </div>
                            <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-sm">Fase 2</span>
                        </div>
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold tracking-tight text-gray-500 mb-2">Pólizas (Próximamente)</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Registro de asientos contables y partida doble.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
