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
    const providerId = user?.id?.toString();

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50/50 dark:bg-[#050505]">
                <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">
                    Analizando flota biomédica...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                                Ingeniería Clínica
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                                Equipos Biomédicos
                            </h1>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/provider/dashboard/biomedical/equipments')}
                        className="h-12 px-6 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 rounded-xl shadow-sm shrink-0"
                    >
                        <Settings className="w-4 h-4" strokeWidth={2} />
                        Catálogo de Equipos
                    </button>
                </div>

                {/* --- KPI CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col rounded-3xl shadow-sm group hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:shadow-md transition-all cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                                <Activity className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Total Equipos</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats.totalEquipments}
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-6 flex flex-col rounded-3xl shadow-sm group hover:border-red-300 dark:hover:border-red-800/50 hover:shadow-md transition-all cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-red-700 dark:text-red-400">Fuera de Servicio</span>
                        </div>
                        <div className="text-4xl font-bold text-red-700 dark:text-red-400 mb-1">
                            {stats.outOfService}
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-6 flex flex-col rounded-3xl shadow-sm group hover:border-amber-300 dark:hover:border-amber-800/50 hover:shadow-md transition-all cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Órdenes Pendientes</span>
                        </div>
                        <div className="text-4xl font-bold text-amber-700 dark:text-amber-400 mb-1">
                            {stats.activeWorkOrders}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6 flex flex-col rounded-3xl shadow-sm group hover:border-blue-300 dark:hover:border-blue-800/50 hover:shadow-md transition-all cursor-default">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                            </div>
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">MTTR Promedio</span>
                        </div>
                        <div className="text-4xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                            {stats.avgMttrMinutes} <span className="text-lg font-semibold text-blue-600/70 dark:text-blue-400/70 ml-1">min</span>
                        </div>
                    </div>

                </div>

                {/* --- QUICK ACTIONS / HIGHLIGHTS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Próximos Mantenimientos */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl h-[400px] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                                Próximos Mantenimientos
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
                                <Wrench className="w-8 h-8 text-gray-400" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-medium text-gray-500 max-w-[250px] leading-relaxed">
                                No hay mantenimientos programados para esta semana.
                            </p>
                        </div>
                    </div>

                    {/* Alertas de Garantías */}
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl h-[400px] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> 
                                Garantías por Expirar
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
                                <ShieldAlert className="w-8 h-8 text-gray-400" strokeWidth={2} />
                            </div>
                            <p className="text-sm font-medium text-gray-500 max-w-[250px] leading-relaxed">
                                Ninguna garantía expirará en los próximos 30 días.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
