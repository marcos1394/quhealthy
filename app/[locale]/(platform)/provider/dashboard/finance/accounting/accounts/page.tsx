"use client";

import React, { useEffect, useState } from "react";
import { accountingService, AccountDTO } from "@/services/accounting.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronDown, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await accountingService.listAccounts();
                setAccounts(data);
            } catch (error) {
                toast.error("Error al cargar el catálogo de cuentas");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Helper para estructurar las cuentas en árbol asumiendo parentAccountId
    const rootAccounts = accounts.filter(acc => !acc.parentAccountId);

    const renderAccountRow = (account: AccountDTO, depth: number = 0) => {
        const children = accounts.filter(acc => acc.parentAccountId === account.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedRows[account.id] || false;

        return (
            <React.Fragment key={account.id}>
                <TableRow className={cn(
                    "hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group",
                    depth === 0 && "bg-gray-50/30 dark:bg-gray-900/20"
                )}>
                    <TableCell className="py-4">
                        <div 
                            className="flex items-center gap-3" 
                            style={{ paddingLeft: `${depth * 28}px` }}
                        >
                            {hasChildren ? (
                                <button 
                                    onClick={() => toggleRow(account.id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                            ) : (
                                <span className="w-6" /> // spacer
                            )}
                            <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                {account.code}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                            {depth === 0 && (
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                                    <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            )}
                            <span className={cn(
                                "text-sm",
                                depth === 0 ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"
                            )}>{account.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-4">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50">
                            {account.type}
                        </span>
                    </TableCell>
                    <TableCell className="py-4">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            {account.nature}
                        </span>
                    </TableCell>
                </TableRow>
                
                {isExpanded && children.map(child => renderAccountRow(child, depth + 1))}
            </React.Fragment>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando catálogo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center pb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Catálogo de Cuentas (SAT)</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Estructura jerárquica del código agrupador Anexo 24</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/80 dark:bg-gray-900/50">
                        <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Código SAT</TableHead>
                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre de Cuenta</TableHead>
                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</TableHead>
                            <TableHead className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Naturaleza</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {rootAccounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-sm font-semibold text-gray-500">
                                    No hay cuentas configuradas en el catálogo.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rootAccounts.map(acc => renderAccountRow(acc, 0))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
