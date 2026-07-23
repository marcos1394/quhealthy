"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { budgetService, BudgetPolicyDTO } from "@/services/budget.service";
import { Shield, Save, AlertTriangle, XCircle, CheckCircle, Link2 } from "lucide-react";
import { ApprovalChainConfig } from "./ApprovalChainConfig";

const DEFAULT_POLICY: BudgetPolicyDTO = {
    allowNegativeBudget: false,
    allowOverExecution: false,
    overExecutionMode: "BLOCK",
    approvalLevels: 1,
    transferLimitPercentage: null,
    allowCrossDepartmentTransfer: false,
    monthlyControlEnabled: false,
};

const MODE_OPTIONS: { value: BudgetPolicyDTO["overExecutionMode"]; label: string; icon: React.ReactNode; desc: string; colors: string; hover: string }[] = [
    {
        value: "BLOCK",
        label: "Bloquear",
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        desc: "El sistema impide el movimiento",
        colors: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20",
        hover: "hover:border-red-200 hover:bg-red-50/50 dark:hover:border-red-800 dark:hover:bg-red-900/10",
    },
    {
        value: "WARN",
        label: "Advertir",
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        desc: "Advierte pero permite continuar",
        colors: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20",
        hover: "hover:border-amber-200 hover:bg-amber-50/50 dark:hover:border-amber-800 dark:hover:bg-amber-900/10",
    },
    {
        value: "AUTHORIZE",
        label: "Autorización especial",
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        desc: "Pausa el movimiento y lo envía a la bandeja de aprobaciones",
        colors: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20",
        hover: "hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/10",
    },
];

// Provider ID temporal - en producción vendría del contexto de autenticación
const PROVIDER_ID = 1;

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
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando política...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Políticas Presupuestales</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Reglas de validación y control para todos los movimientos financieros
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control de sobreejercicio */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Control de Sobreejercicio
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">Permitir saldo negativo</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">Ejecutar más allá del monto proyectado</p>
                            </div>
                            <Switch
                                checked={policy.allowNegativeBudget}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, allowNegativeBudget: v }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">Permitir sobre-ejecución</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">Gastos mayores al presupuesto disponible</p>
                            </div>
                            <Switch
                                checked={policy.allowOverExecution}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, allowOverExecution: v }))}
                            />
                        </div>

                        {/* Modo de reacción */}
                        <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Acción al exceder presupuesto
                            </p>
                            <div className="space-y-3">
                                {MODE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPolicy(p => ({ ...p, overExecutionMode: opt.value }))}
                                        className={`w-full flex items-center gap-4 p-4 text-left transition-all rounded-2xl border ${
                                            policy.overExecutionMode === opt.value
                                                ? opt.colors + " shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                                                : "border-gray-100 dark:border-gray-800 " + opt.hover
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 dark:bg-black/20 shadow-sm shrink-0`}>
                                            {opt.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                                            <p className="text-xs font-medium text-gray-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {policy.overExecutionMode === "AUTHORIZE" && (
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/40 rounded-2xl mt-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                                        Los movimientos que excedan el presupuesto quedarán en espera hasta que un aprobador los autorice desde la <strong>Bandeja de Aprobaciones</strong>. Define la cadena de aprobadores en la sección inferior.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transferencias y aprobaciones */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Reasignaciones y Aprobaciones
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Niveles de Aprobación
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                value={policy.approvalLevels || ""}
                                onChange={(e) => setPolicy(p => ({ ...p, approvalLevels: e.target.value === "" ? 1 : Math.max(1, parseInt(e.target.value) || 1) }))}
                                className="rounded-xl h-12 text-sm border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]"
                            />
                            <p className="text-xs font-medium text-gray-500">Cuántas aprobaciones requiere un movimiento presupuestal</p>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">
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
                                className="rounded-xl h-12 text-sm border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]"
                            />
                            <p className="text-xs font-medium text-gray-500">Vacío = sin límite porcentual</p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">Transferencia entre departamentos</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">Permite reasignar entre distintos CC</p>
                            </div>
                            <Switch
                                checked={policy.allowCrossDepartmentTransfer}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, allowCrossDepartmentTransfer: v }))}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">Control mensual activo</p>
                                <p className="text-xs font-semibold text-gray-500 mt-0.5">Valida el presupuesto mes a mes</p>
                            </div>
                            <Switch
                                checked={policy.monthlyControlEnabled}
                                onCheckedChange={(v) => setPolicy(p => ({ ...p, monthlyControlEnabled: v }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Guardar política */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white transition-colors h-12 px-8 rounded-xl font-bold shadow-sm flex items-center gap-2"
                >
                    {isSaving ? <QhSpinner size="sm" className="mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Guardar Política
                </Button>
            </div>

            {/* Cadena de Aprobación */}
            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Cadena de Aprobación
                        </h3>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            Define quién aprueba los movimientos en cada nivel y para qué montos
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-sm">
                        <Link2 className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="p-6">
                    {policy.overExecutionMode !== "AUTHORIZE" && policy.approvalLevels <= 0 ? (
                        <div className="text-center p-8 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-sm font-bold text-gray-500">
                                La cadena de aprobación solo aplica cuando el modo es <strong className="text-gray-700 dark:text-gray-300">Autorización especial</strong> o cuando hay niveles de aprobación configurados.
                            </p>
                        </div>
                    ) : (
                        <ApprovalChainConfig providerId={PROVIDER_ID} />
                    )}
                </div>
            </div>
        </div>
    );
}
