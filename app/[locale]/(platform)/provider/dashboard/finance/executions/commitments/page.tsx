"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Lock, Plus, Link as LinkIcon, XCircle } from "lucide-react";
import { budgetService, BudgetCommitmentDTO } from "@/services/budget.service";
import { CreateCommitmentDrawer } from "./CreateCommitmentDrawer";

export default function CommitmentsPage() {
    const [commitments, setCommitments] = useState<BudgetCommitmentDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadCommitments();
    }, []);

    const loadCommitments = async () => {
        setIsLoading(true);
        try {
            const data = await budgetService.listCommitments();
            setCommitments(data);
        } catch {
            toast.error("Error al cargar compromisos", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm("¿Seguro que deseas cancelar este compromiso y liberar los fondos?")) return;
        try {
            await budgetService.cancelCommitment(id);
            toast.success("Compromiso cancelado, fondos liberados", { theme: "colored" });
            loadCommitments();
        } catch {
            toast.error("Error al cancelar compromiso", { theme: "colored" });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando compromisos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compromisos Presupuestales</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Fondos apartados pendientes de ejecución real
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="rounded-xl h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Compromiso
                    </Button>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shadow-sm">
                        <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Partida Afectada</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo / OC</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monto</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {commitments.length > 0 ? (
                                commitments.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.lineItem.name}</p>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                                {c.costCenterId ? `CC ID: ${c.costCenterId}` : 'Sin CC'}
                                            </p>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={c.reason}>
                                            {c.reason}
                                        </td>
                                        <td className="p-4 text-right text-sm font-bold font-mono text-gray-900 dark:text-white">
                                            ${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                                                c.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                c.status === 'EXECUTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                                {c.status === 'ACTIVE' ? 'Comprometido' : 
                                                 c.status === 'EXECUTED' ? 'Ejecutado' : 'Cancelado'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {c.status === 'ACTIVE' && (
                                                    <>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            title="Ejecutar (Vincular a Factura)"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                            onClick={() => toast.info("Funcionalidad de vincular en desarrollo", { theme: "colored" })}
                                                        >
                                                            <LinkIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            title="Cancelar y liberar fondos"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                            onClick={() => handleCancel(c.id)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-500">
                                        No hay fondos comprometidos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateCommitmentDrawer 
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={loadCommitments}
            />
        </div>
    );
}
