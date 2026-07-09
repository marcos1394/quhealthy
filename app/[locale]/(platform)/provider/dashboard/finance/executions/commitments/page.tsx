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
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando compromisos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Compromisos Presupuestales</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Fondos apartados pendientes de ejecución real
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nuevo Compromiso
                    </Button>
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>

            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Fecha</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Partida Afectada</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Motivo / OC</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Monto</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Estado</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commitments.length > 0 ? (
                            commitments.map((c) => (
                                <tr key={c.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-xs font-mono">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <p className="text-xs font-semibold">{c.lineItem.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                            {c.costCenterId ? `CC ID: ${c.costCenterId}` : 'Sin CC'}
                                        </p>
                                    </td>
                                    <td className="p-4 text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                        {c.reason}
                                    </td>
                                    <td className="p-4 text-right text-sm font-mono font-bold">
                                        ${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${
                                            c.status === 'ACTIVE' ? 'bg-amber-100 text-amber-700' :
                                            c.status === 'EXECUTED' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {c.status === 'ACTIVE' ? 'Comprometido' : c.status}
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
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => toast.info("Funcionalidad de vincular en desarrollo", { theme: "colored" })}
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        title="Cancelar y liberar fondos"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                <td colSpan={6} className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 border-dashed border-t border-black/10 dark:border-white/10">
                                    No hay fondos comprometidos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateCommitmentDrawer 
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={loadCommitments}
            />
        </div>
    );
}
