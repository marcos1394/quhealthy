"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Plus, CheckCircle, XCircle } from "lucide-react";
import { budgetService, BudgetTransferDTO } from "@/services/budget.service";
import { CreateTransferDrawer } from "./CreateTransferDrawer";

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<BudgetTransferDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadTransfers();
    }, []);

    const loadTransfers = async () => {
        setIsLoading(true);
        try {
            const data = await budgetService.listTransfers();
            setTransfers(data);
        } catch {
            toast.error("Error al cargar reasignaciones", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await budgetService.approveTransfer(id, "Aprobado desde panel");
            toast.success("Transferencia aprobada", { theme: "colored" });
            loadTransfers();
        } catch {
            toast.error("Error al aprobar transferencia", { theme: "colored" });
        }
    };

    const handleReject = async (id: number) => {
        try {
            await budgetService.rejectTransfer(id, "Rechazado desde panel");
            toast.info("Transferencia rechazada", { theme: "colored" });
            loadTransfers();
        } catch {
            toast.error("Error al rechazar transferencia", { theme: "colored" });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando reasignaciones...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reasignaciones Presupuestales</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Transferencias de fondos entre partidas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="rounded-xl h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Solicitud
                    </Button>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shadow-sm">
                        <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Origen → Destino</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monto</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {transfers.length > 0 ? (
                                transfers.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {new Date(t.requestedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/10 px-2 py-0.5 rounded-md w-fit">
                                                    - {t.fromLineItem.name}
                                                </span>
                                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded-md w-fit">
                                                    + {t.toLineItem.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={t.reason}>
                                            {t.reason}
                                        </td>
                                        <td className="p-4 text-right text-sm font-bold font-mono text-gray-900 dark:text-white">
                                            ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                                                t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                t.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                t.status === 'CANCELLED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {t.status === 'APPROVED' ? 'Aprobado' : 
                                                 t.status === 'REJECTED' ? 'Rechazado' :
                                                 t.status === 'CANCELLED' ? 'Cancelado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {t.status === 'PENDING' && (
                                                    <>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                                                            onClick={() => handleApprove(t.id)}
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                            onClick={() => handleReject(t.id)}
                                                        >
                                                            <XCircle className="w-5 h-5" />
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
                                        No hay transferencias registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateTransferDrawer 
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={loadTransfers}
            />
        </div>
    );
}
