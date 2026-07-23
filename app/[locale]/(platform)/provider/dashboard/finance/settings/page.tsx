"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Building2, CalendarRange } from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "react-toastify";
import { accountingService } from "@/services/accounting.service";
import { financeService, BudgetPeriodDTO } from "@/services/finance.service";
import { CostCenterDTO } from "@/types/accounting";
import { CreateFiscalYearDrawer } from "./CreateFiscalYearDrawer";
import { CreateCostCenterDrawer } from "./CreateCostCenterDrawer";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriodDTO[]>([]);
    const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Drawer States
    const [isPeriodDrawerOpen, setIsPeriodDrawerOpen] = useState(false);
    const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [periodsRes, costCentersRes] = await Promise.all([
                financeService.listBudgetPeriods(),
                accountingService.listCostCenters()
            ]);
            setBudgetPeriods(periodsRes);
            setCostCenters(costCentersRes);
        } catch (error) {
            toast.error("Error al cargar configuraciones", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">
                    Cargando configuraciones...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración Financiera</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Años fiscales, centros de costo y áreas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl h-11 px-4 font-bold border-gray-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors gap-2"
                        onClick={() => router.push('/provider/dashboard/finance/settings/policies')}
                    >
                        <Settings className="w-4 h-4" />
                        Políticas
                    </Button>
                    <div className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Años Fiscales */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <CalendarRange className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Años Fiscales (Periodos)
                            </h3>
                        </div>
                        <Button 
                            className="h-10 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                            onClick={() => setIsPeriodDrawerOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nuevo
                        </Button>
                    </div>
                    <div className="p-6 space-y-4 flex-grow bg-white dark:bg-[#0a0a0a]">
                        {budgetPeriods.length > 0 ? (
                            budgetPeriods.map((period) => (
                                <div key={period.id} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-900/50 dark:hover:border-gray-700 transition-colors">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-base">Año Fiscal {period.year}</p>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
                                            {period.startDate} al {period.endDate}
                                        </p>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                                        period.status === 'ACTIVE' 
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {period.status === 'ACTIVE' ? 'Activo' : period.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
                                <p className="text-sm font-bold text-gray-500">NO HAY PERIODOS FISCALES</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Centros de Costo */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Centros de Costo
                            </h3>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button 
                                variant="outline" 
                                className="h-10 px-4 rounded-xl font-bold border-gray-200 shadow-sm flex-1 sm:flex-none"
                                onClick={() => router.push('/provider/dashboard/finance/settings/cost-centers')}
                            >
                                Ver Árbol
                            </Button>
                            <Button 
                                className="h-10 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex-1 sm:flex-none"
                                onClick={() => setIsCostCenterDrawerOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Nuevo
                            </Button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4 flex-grow bg-white dark:bg-[#0a0a0a]">
                        {costCenters.length > 0 ? (
                            costCenters.map((cc) => (
                                <div key={cc.id} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-900/50 dark:hover:border-gray-700 transition-colors">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-base">{cc.name}</p>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{cc.code}</p>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                                        cc.active 
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {cc.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
                                <p className="text-sm font-bold text-gray-500">NO HAY CENTROS DE COSTO</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateFiscalYearDrawer 
                open={isPeriodDrawerOpen}
                onOpenChange={setIsPeriodDrawerOpen}
                onSuccess={fetchData}
            />

            <CreateCostCenterDrawer 
                open={isCostCenterDrawerOpen}
                onOpenChange={setIsCostCenterDrawerOpen}
                onSuccess={fetchData}
            />
        </div>
    );
}
