"use client";

import React, { useEffect, useState } from "react";
import { accountingService, JournalEntryDTO } from "@/services/accounting.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

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
            toast.success("Póliza contabilizada exitosamente");
            fetchJournals();
        } catch (error) {
            toast.error("Error al contabilizar la póliza");
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Pólizas del Periodo</h2>
                    <p className="text-sm text-gray-500 mt-1">Historial de registros contables (Anexo 24)</p>
                </div>
                <Link 
                    href="/provider/dashboard/finance/accounting/journals/create"
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:bg-black/90 dark:hover:bg-white/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Póliza
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead>UUID (Opcional)</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No hay pólizas registradas en este periodo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            journals.map(journal => (
                                <TableRow key={journal.id}>
                                    <TableCell>{new Date(journal.entryDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{journal.description}</TableCell>
                                    <TableCell>{journal.type}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            journal.status === 'POSTED' ? 'bg-emerald-100 text-emerald-700' :
                                            journal.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {journal.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-gray-500">
                                        {journal.cfdiUuid || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {journal.status === 'DRAFT' && (
                                            <button 
                                                onClick={() => handlePost(journal.id!)}
                                                className="text-blue-600 hover:underline text-sm font-medium"
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
    );
}
