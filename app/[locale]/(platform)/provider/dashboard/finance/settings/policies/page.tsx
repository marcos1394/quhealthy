"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { budgetService, BudgetPolicyDTO } from "@/services/budget.service";
import { Shield, Save, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

const DEFAULT_POLICY: BudgetPolicyDTO = {
    allowNegativeBudget: false,
    allowOverExecution: false,
    overExecutionMode: "BLOCK",
    approvalLevels: 1,
    transferLimitPercentage: null,
    allowCrossDepartmentTransfer: false,
    monthlyControlEnabled: false,
};

const MODE_OPTIONS: { value: BudgetPolicyDTO["overExecutionMode"]; label: string; icon: React.ReactNode; desc: string }[] = [
    {
        value: "BLOCK",
        label: "Bloquear",
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        desc: "El sistema impide el movimiento",
    },
    {
        value: "WARN",
        label: "Advertir",
        icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        desc: "Advierte pero permite continuar",
    },
    {
        value: "AUTHORIZE",
        label: "Autorización especial",
        icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        desc: "Requiere aprobación del director",
    },
];

export default function BudgetPoliciesPage() {
    const [policy, setPolicy] = useState<BudgetPolicyDTO>(DEFAULT_POLICY);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        budgetService.getPolicy()
            .then(setPolicy)
            .catch(() => toast.error("Error al cargar la política", { theme: "colored" }))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const saved = await budgetService.savePolicy(policy);
            setPolicy(saved);
            toast.success("Política guardada correctamente", { theme: "colored" });
        } catch {
            toast.error("Error al guardar la política", { theme: "colored" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando política...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Políticas Presupuestales</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Reglas de validación y control para todos los movimientos financieros
                    </p>
                </div>
                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                    <Shield className="w-4 h-4 text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Control de sobreejercicio */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Control de Sobreejercicio
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Permitir saldo negativo</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ejecutar más allá del monto proyectado</p>
                            </div>
                            <Switch
                                checked={policy.allowNegativeBudget}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, allowNegativeBudget: v }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Permitir sobre-ejecución</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Gastos mayores al presupuesto disponible</p>
                            </div>
                            <Switch
                                checked={policy.allowOverExecution}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, allowOverExecution: v }))}
                            />
                        </div>

                        {/* Modo de reacción */}
                        <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Acción al exceder presupuesto
                            </p>
                            <div className="space-y-2">
                                {MODE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPolicy(p => ({ ...p, overExecutionMode: opt.value }))}
                                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors border ${
                                            policy.overExecutionMode === opt.value
                                                ? "border-black dark:border-white bg-black/5 dark:bg-white/5"
                                                : "border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        {opt.icon}
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest">{opt.label}</p>
                                            <p className="text-[10px] text-gray-500">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transferencias y aprobaciones */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Reasignaciones y Aprobaciones
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest">
                                Niveles de Aprobación
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                value={policy.approvalLevels}
                                onChange={(e) => setPolicy(p => ({ ...p, approvalLevels: parseInt(e.target.value) || 1 }))}
                                className="rounded-none h-9 text-sm"
                            />
                            <p className="text-[10px] text-gray-500">Cuántas aprobaciones requiere un movimiento</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest">
                                Límite de Transferencia (% del total de partida)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="Sin límite"
                                value={policy.transferLimitPercentage ?? ""}
                                onChange={(e) => setPolicy(p => ({
                                    ...p,
                                    transferLimitPercentage: e.target.value ? parseFloat(e.target.value) : null
                                }))}
                                className="rounded-none h-9 text-sm"
                            />
                            <p className="text-[10px] text-gray-500">Vacío = sin límite porcentual</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
                            <div>
                                <p className="text-sm font-medium">Transferencia entre departamentos</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Permite reasignar entre distintos CC</p>
                            </div>
                            <Switch
                                checked={policy.allowCrossDepartmentTransfer}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, allowCrossDepartmentTransfer: v }))}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Control mensual activo</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Valida el presupuesto mes a mes</p>
                            </div>
                            <Switch
                                checked={policy.monthlyControlEnabled}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, monthlyControlEnabled: v }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Guardar */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-none h-9 px-6 text-[10px] font-bold uppercase tracking-widest gap-2"
                >
                    {isSaving ? <QhSpinner size="sm" /> : <Save className="w-3 h-3" />}
                    Guardar Política
                </Button>
            </div>
        </div>
    );
}
