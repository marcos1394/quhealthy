"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "react-toastify";
import { accountingService } from "@/services/accounting.service";
import { financeService, BudgetPeriodDTO } from "@/services/finance.service";
import { CostCenterDTO } from "@/types/accounting";
import { CreateFiscalYearDrawer } from "./CreateFiscalYearDrawer";
import { CreateCostCenterDrawer } from "./CreateCostCenterDrawer";

export default function SettingsPage() {
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
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Cargando configuraciones...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Configuración Financiera</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Años fiscales, centros de costo y áreas
                    </p>
                </div>
                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Años Fiscales */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Años Fiscales (Periodos)
                        </h3>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-[9px] uppercase tracking-widest rounded-none"
                            onClick={() => setIsPeriodDrawerOpen(true)}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Nuevo
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {budgetPeriods.length > 0 ? (
                            budgetPeriods.map((period) => (
                                <div key={period.id} className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10">
                                    <div>
                                        <p className="font-semibold text-sm">Año Fiscal {period.year}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                            {period.startDate} - {period.endDate}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                                        period.status === 'ACTIVE' 
                                        ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10'
                                        : 'border-gray-500/30 text-gray-600 bg-gray-50 dark:bg-gray-900/10'
                                    }`}>
                                        {period.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center border border-dashed border-black/20 dark:border-white/20">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">NO HAY PERIODOS FISCALES</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Centros de Costo */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Centros de Costo
                        </h3>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-[9px] uppercase tracking-widest rounded-none"
                            onClick={() => setIsCostCenterDrawerOpen(true)}
                        >
                            <Plus className="w-3 h-3 mr-1" /> Nuevo
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {costCenters.length > 0 ? (
                            costCenters.map((cc) => (
                                <div key={cc.id} className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10">
                                    <div>
                                        <p className="font-semibold text-sm">{cc.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{cc.code}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                                        cc.active 
                                        ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10'
                                        : 'border-red-500/30 text-red-600 bg-red-50 dark:bg-red-900/10'
                                    }`}>
                                        {cc.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center border border-dashed border-black/20 dark:border-white/20">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">NO HAY CENTROS DE COSTO</p>
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
