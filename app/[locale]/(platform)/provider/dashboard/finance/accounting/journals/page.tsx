"use client";

import React, { useEffect, useState } from "react";
import { accountingService, JournalEntryDTO } from "@/services/accounting.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function JournalEntriesPage() {
    const [journals, setJournals] = useState<JournalEntryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJournals = async () => {
        try {
            const data = await accountingService.getJournalEntries();
            setJournals(data);
        } catch (error) {
            toast.error("Error al cargar las pólizas");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, []);

    const handlePost = async (id: number) => {
        try {
            await accountingService.postJournalEntry(id);
            toast.success("Póliza contabilizada exitosamente", { theme: "colored" });
            fetchJournals();
        } catch (error) {
            toast.error("Error al contabilizar la póliza", { theme: "colored" });
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando pólizas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pólizas del Periodo</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Historial de registros contables (Anexo 24)</p>
                </div>
                <Link 
                    href="/provider/dashboard/finance/accounting/journals/create"
                    className="flex items-center justify-center gap-2 h-11 px-6 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Póliza
                </Link>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/80 dark:bg-gray-900/50">
                            <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                                <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</TableHead>
                                <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Concepto</TableHead>
                                <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</TableHead>
                                <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estatus</TableHead>
                                <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">UUID (Opcional)</TableHead>
                                <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {journals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-sm font-semibold text-gray-500">
                                        No hay pólizas registradas en este periodo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                journals.map(journal => (
                                    <TableRow key={journal.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                                        <TableCell className="py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {new Date(journal.entryDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-semibold text-gray-900 dark:text-white max-w-[200px] truncate" title={journal.description}>
                                            {journal.description}
                                        </TableCell>
                                        <TableCell className="py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {journal.type}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                                                journal.status === 'POSTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                journal.status === 'DRAFT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                                {journal.status === 'POSTED' ? 'Contabilizada' : 
                                                 journal.status === 'DRAFT' ? 'Borrador' : journal.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 font-mono text-xs text-gray-500 truncate max-w-[150px]" title={journal.cfdiUuid || ''}>
                                            {journal.cfdiUuid || '-'}
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            {journal.status === 'DRAFT' && (
                                                <button 
                                                    onClick={() => handlePost(journal.id!)}
                                                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Contabilizar
                                                </button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
