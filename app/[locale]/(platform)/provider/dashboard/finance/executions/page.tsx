"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { budgetService, BudgetExecutionLogDTO, BudgetDTO, BudgetLineItemDTO, BudgetExecutionRequest } from "@/services/budget.service";
import { accountingService, AccountDTO } from "@/services/accounting.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExecutionsPage() {
    const [executions, setExecutions] = useState<BudgetExecutionLogDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeBudget, setActiveBudget] = useState<BudgetDTO | null>(null);
    const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [selectedLineItemId, setSelectedLineItemId] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    
    // Hybrid options state
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [debitAccountId, setDebitAccountId] = useState<string>("none");
    const [creditAccountId, setCreditAccountId] = useState<string>("none");

    const fetchExecutions = async () => {
        try {
            const budgets = await budgetService.listBudgets();
            const current = budgets.find(b => b.status === 'ACTIVE' || b.status === 'APPROVED') || budgets[0];
            
            if (current) {
                setActiveBudget(current);
                const [data, linesData, accountsData] = await Promise.all([
                    budgetService.getExecutionHistory(current.id),
                    budgetService.getBudgetLineItems(current.id),
                    accountingService.getChartOfAccounts()
                ]);
                setExecutions(data);
                setLineItems(linesData);
                setAccounts(accountsData);
            }
        } catch (error) {
            toast.error("Error al cargar el historial de ejecución", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutions();
    }, []);

    const handleRegisterExecution = async () => {
        if (!activeBudget) return;
        if (!selectedLineItemId || !amount || !description) {
            toast.warning("Por favor completa los campos requeridos", { theme: "colored" });
            return;
        }

        try {
            setIsSubmitting(true);
            const request: BudgetExecutionRequest = {
                budgetLineItemId: Number(selectedLineItemId),
                amount: Number(amount),
                description,
                debitAccountId: debitAccountId !== "none" ? Number(debitAccountId) : null,
                creditAccountId: creditAccountId !== "none" ? Number(creditAccountId) : null
            };

            await budgetService.recordExecution(activeBudget.id, request);
            toast.success("Movimiento registrado y póliza borrador generada", { theme: "colored" });
            
            // Reset form
            setIsModalOpen(false);
            setSelectedLineItemId("");
            setAmount("");
            setDescription("");
            setShowAdvanced(false);
            setDebitAccountId("none");
            setCreditAccountId("none");
            
            // Reload list
            fetchExecutions();
        } catch (error) {
            toast.error("Error al registrar el movimiento", { theme: "colored" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Cargando movimientos...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Ejecución y Facturación</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Historial de movimientos reales y CFDI
                    </p>
                </div>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            className="rounded-none h-10 px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 text-[9px] font-bold uppercase tracking-widest transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Registrar Movimiento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="uppercase tracking-tight text-lg">Registrar Ejecución</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Partida de Presupuesto</Label>
                                <Select value={selectedLineItemId} onValueChange={setSelectedLineItemId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una partida" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lineItems.map(item => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name} ({item.category})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Monto</Label>
                                    <Input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Descripción del Movimiento</Label>
                                <Input 
                                    placeholder="Ej. Pago de campaña publicitaria" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Hybrid Accounting Section */}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    Opciones Contables (Avanzado)
                                </button>
                                
                                {showAdvanced && (
                                    <div className="space-y-4 mt-4 bg-gray-50 dark:bg-[#050505] p-4 rounded-md border border-gray-200 dark:border-gray-800">
                                        <p className="text-xs text-gray-500 mb-2">
                                            Si dejas estas opciones vacías, el sistema generará la póliza automáticamente usando la cuenta por defecto configurada.
                                        </p>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest">Cuenta de Cargo (Debe)</Label>
                                            <Select value={debitAccountId} onValueChange={setDebitAccountId}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Automático" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Automático --</SelectItem>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                                            {acc.accountNumber} - {acc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest">Cuenta de Abono (Haber)</Label>
                                            <Select value={creditAccountId} onValueChange={setCreditAccountId}>
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Automático" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Automático --</SelectItem>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                                            {acc.accountNumber} - {acc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                            <Button 
                                onClick={handleRegisterExecution}
                                disabled={isSubmitting}
                                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                {isSubmitting ? "Registrando..." : "Guardar y Contabilizar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-black/20 dark:border-white/20">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4 text-right">Monto</th>
                            <th className="px-6 py-4 text-center">Factura (CFDI)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {executions.length > 0 ? (
                            executions.map((exec) => (
                                <tr key={exec.id} className="border-b border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#050505]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {exec.createdAt ? new Date(exec.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${exec.budgetLineItem?.type === 'INCOME' ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10' : 'border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-900/10'}`}>
                                            {exec.budgetLineItem?.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{exec.budgetLineItem?.category || 'Sin categoría'}</td>
                                    <td className="px-6 py-4 text-gray-500">{exec.description}</td>
                                    <td className="px-6 py-4 text-right font-mono">${(exec.amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        {exec.cfdiUuid ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 rounded-none" title={`CFDI: ${exec.cfdiUuid}`}>
                                                    <Download className="w-4 h-4 text-gray-500 hover:text-black dark:hover:text-white" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest rounded-none border-black/20 dark:border-white/20">
                                                <FileText className="w-3 h-3 mr-2" /> Generar CFDI
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest border-t border-black/20 dark:border-white/20">
                                    No hay movimientos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
