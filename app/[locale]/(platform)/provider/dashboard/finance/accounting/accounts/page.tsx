"use client";

import React, { useEffect, useState } from "react";
import { accountingService, AccountDTO } from "@/services/accounting.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ChevronRight, ChevronDown, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export default function ChartOfAccountsPage() {
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

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

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Helper para estructurar las cuentas en árbol asumiendo parentAccount
    const rootAccounts = accounts.filter(acc => !acc.parentAccount);

    const renderAccountRow = (account: AccountDTO, depth: number = 0) => {
        const children = accounts.filter(acc => acc.parentAccount?.id === account.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedRows[account.id] || false;

        return (
            <React.Fragment key={account.id}>
                <TableRow className={cn(depth === 0 && "bg-gray-50/50 dark:bg-white/[0.02]")}>
                    <TableCell>
                        <div 
                            className="flex items-center gap-2" 
                            style={{ paddingLeft: `${depth * 24}px` }}
                        >
                            {hasChildren ? (
                                <button 
                                    onClick={() => toggleRow(account.id)}
                                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md"
                                >
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                            ) : (
                                <span className="w-6" /> // spacer
                            )}
                            <span className="font-mono text-sm">{account.code}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {depth === 0 && <Layers className="h-4 w-4 text-gray-400" />}
                            <span className={cn(depth === 0 ? "font-semibold" : "")}>{account.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>{account.nature}</TableCell>
                </TableRow>
                
                {isExpanded && children.map(child => renderAccountRow(child, depth + 1))}
            </React.Fragment>
        );
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
                    <h2 className="text-xl font-bold">Catálogo de Cuentas (SAT)</h2>
                    <p className="text-sm text-gray-500 mt-1">Estructura jerárquica del código agrupador Anexo 24</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código SAT</TableHead>
                            <TableHead>Nombre de Cuenta</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Naturaleza</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rootAccounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
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
