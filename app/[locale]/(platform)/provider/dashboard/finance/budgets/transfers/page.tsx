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
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando reasignaciones...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Reasignaciones Presupuestales</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Transferencias de fondos entre partidas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nueva Solicitud
                    </Button>
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                        <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>

            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Fecha</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Origen → Destino</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Motivo</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Monto</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Estado</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transfers.length > 0 ? (
                            transfers.map((t) => (
                                <tr key={t.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-xs font-mono">
                                        {new Date(t.requestedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                                                - {t.fromLineItem.name}
                                            </span>
                                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                                                + {t.toLineItem.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                        {t.reason}
                                    </td>
                                    <td className="p-4 text-right text-sm font-mono font-bold">
                                        ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${
                                            t.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            t.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            t.status === 'CANCELLED' ? 'bg-gray-100 text-gray-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {t.status === 'PENDING' && (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleApprove(t.id)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleReject(t.id)}
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
                                <td colSpan={6} className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 border-dashed border-t border-black/10 dark:border-white/10">
                                    No hay transferencias registradas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateTransferDrawer 
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={loadTransfers}
            />
        </div>
    );
}
