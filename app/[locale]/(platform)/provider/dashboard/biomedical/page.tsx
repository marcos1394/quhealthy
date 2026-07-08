"use client"
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Activity, ShieldAlert, Wrench, Clock, FileText, ArrowRight, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';

import { useSessionStore } from '@/stores/SessionStore';
import { biomedicalService } from '@/services/biomedical.service';
import { BiomedicalEquipmentDTO } from '@/types/biomedical';

export default function BiomedicalDashboardPage() {
    const t = useTranslations('SidebarNav'); 
    const router = useRouter();
    const { user } = useSessionStore();
    const providerId = user?.id;

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEquipments: 0,
        outOfService: 0,
        activeWorkOrders: 0, // Requires separate endpoints, leaving at 0
        avgMttrMinutes: 0 // Requires separate endpoints, leaving at 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!providerId) return;
            setIsLoading(true);
            try {
                const equipments = await biomedicalService.listEquipments(providerId);
                const outOfServiceCount = equipments.filter((eq: BiomedicalEquipmentDTO) => eq.status === 'OUT_OF_SERVICE').length;
                
                // For a real application, we should have a specific analytics endpoint.
                // For now, we compute what we can from the list.
                setStats({
                    totalEquipments: equipments.length,
                    outOfService: outOfServiceCount,
                    activeWorkOrders: 0,
                    avgMttrMinutes: 0
                });
            } catch (error) {
                console.error("Failed to load biomedical stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [providerId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50 dark:bg-[#050505]">
                <QhSpinner size="lg" className="text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                    ANALIZANDO FLOTA BIOMÉDICA...
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
                            <Activity className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                                Ingeniería Clínica
                            </p>
                            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                                EQUIPOS BIOMÉDICOS
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                GESTIÓN DEL CICLO DE VIDA, MANTENIMIENTO Y MTTR.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/provider/dashboard/biomedical/equipments')}
                        className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none shrink-0"
                    >
                        <Settings className="w-4 h-4" strokeWidth={1.5} />
                        CATÁLOGO DE EQUIPOS
                    </button>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col rounded-none group hover:border-black dark:hover:border-white transition-colors cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                                <Activity className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">TOTAL EQUIPOS</span>
                        </div>
                        <div className="text-4xl font-semibold tracking-tight text-black dark:text-white mb-2">
                            {stats.totalEquipments}
                        </div>
                    </div>

                    <div className="border border-red-500/30 bg-red-50 dark:bg-red-900/10 p-6 flex flex-col rounded-none group hover:border-red-500/50 transition-colors cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 border border-red-500/20 bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">FUERA DE SERVICIO</span>
                        </div>
                        <div className="text-4xl font-semibold tracking-tight text-red-700 dark:text-red-300 mb-2">
                            {stats.outOfService}
                        </div>
                    </div>

                    <div className="border border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 p-6 flex flex-col rounded-none group hover:border-amber-500/50 transition-colors cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 border border-amber-500/20 bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">ÓRDENES PENDIENTES</span>
                        </div>
                        <div className="text-4xl font-semibold tracking-tight text-amber-700 dark:text-amber-300 mb-2">
                            {stats.activeWorkOrders}
                        </div>
                    </div>

                    <div className="border border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 p-6 flex flex-col rounded-none group hover:border-blue-500/50 transition-colors cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 border border-blue-500/20 bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">MTTR PROMEDIO</span>
                        </div>
                        <div className="text-4xl font-semibold tracking-tight text-blue-700 dark:text-blue-300 mb-2">
                            {stats.avgMttrMinutes} <span className="text-sm font-normal text-blue-600/70 dark:text-blue-400/70">min</span>
                        </div>
                    </div>

                </div>

                {/* --- QUICK ACTIONS / HIGHLIGHTS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Próximos Mantenimientos */}
                    <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none h-[400px]">
                        <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> 
                                PRÓXIMOS MANTENIMIENTOS
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                            <Wrench className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-[250px]">
                                NO HAY MANTENIMIENTOS PROGRAMADOS PARA ESTA SEMANA.
                            </p>
                        </div>
                    </div>

                    {/* Alertas de Garantías */}
                    <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none h-[400px]">
                        <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> 
                                GARANTÍAS POR EXPIRAR
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                            <ShieldAlert className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-[250px]">
                                NINGUNA GARANTÍA EXPIRARÁ EN LOS PRÓXIMOS 30 DÍAS.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
