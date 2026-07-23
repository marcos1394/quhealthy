import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { budgetService, BudgetDTO, BudgetLineItemDTO } from "@/services/budget.service";
import { ArrowLeftRight, X } from "lucide-react";

interface CreateTransferDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateTransferDrawer({ open, onOpenChange, onSuccess }: CreateTransferDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
    const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
    
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
    const [fromLineItemId, setFromLineItemId] = useState<number | null>(null);
    const [toLineItemId, setToLineItemId] = useState<number | null>(null);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (open) {
            loadBudgets();
        } else {
            reset();
        }
    }, [open]);

    const reset = () => {
        setSelectedBudgetId(null);
        setFromLineItemId(null);
        setToLineItemId(null);
        setAmount("");
        setReason("");
        setLineItems([]);
    };

    const loadBudgets = async () => {
        try {
            const data = await budgetService.listBudgets();
            setBudgets(data);
        } catch {
            toast.error("Error al cargar presupuestos", { theme: "colored" });
        }
    };

    const handleBudgetChange = async (id: number) => {
        setSelectedBudgetId(id);
        setFromLineItemId(null);
        setToLineItemId(null);
        try {
            const items = await budgetService.getBudgetLineItems(id);
            setLineItems(items);
        } catch {
            toast.error("Error al cargar partidas", { theme: "colored" });
        }
    };

    const handleSave = async () => {
        if (!fromLineItemId || !toLineItemId || !amount || !reason) {
            toast.error("Por favor completa todos los campos", { theme: "colored" });
            return;
        }

        if (fromLineItemId === toLineItemId) {
            toast.error("La partida origen y destino no pueden ser la misma", { theme: "colored" });
            return;
        }

        setIsLoading(true);
        try {
            await budgetService.requestTransfer({
                fromLineItemId,
                toLineItemId,
                amount: parseFloat(amount),
                reason
            });
            toast.success("Solicitud de reasignación enviada", { theme: "colored" });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al solicitar reasignación", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-gray-800 p-0 overflow-y-auto sm:rounded-l-3xl shadow-2xl flex flex-col h-full">
                <SheetHeader className="p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 shrink-0 rounded-tl-3xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shadow-sm">
                            <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <SheetClose className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-colors shadow-sm">
                            <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
                        </SheetClose>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                        Nueva Reasignación
                    </SheetTitle>
                    <SheetDescription className="text-sm font-medium text-gray-500 mt-1">
                        Transferir fondos entre partidas presupuestales
                    </SheetDescription>
                </SheetHeader>
                
                <div className="p-8 space-y-6 flex-1 custom-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Presupuesto *</Label>
                        <select 
                            value={selectedBudgetId || ""}
                            onChange={(e) => handleBudgetChange(Number(e.target.value))}
                            className="w-full h-12 px-4 text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                        >
                            <option value="" disabled>Selecciona un presupuesto...</option>
                            {budgets.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partida Origen (Reduce fondos) *</Label>
                        <select 
                            value={fromLineItemId || ""}
                            onChange={(e) => setFromLineItemId(Number(e.target.value))}
                            disabled={!selectedBudgetId}
                            className="w-full h-12 px-4 text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all disabled:opacity-50"
                        >
                            <option value="" disabled>Selecciona partida origen...</option>
                            {lineItems.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (${l.projectedAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partida Destino (Recibe fondos) *</Label>
                        <select 
                            value={toLineItemId || ""}
                            onChange={(e) => setToLineItemId(Number(e.target.value))}
                            disabled={!selectedBudgetId}
                            className="w-full h-12 px-4 text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all disabled:opacity-50"
                        >
                            <option value="" disabled>Selecciona partida destino...</option>
                            {lineItems.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (${l.projectedAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monto a Transferir *</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                            <Input 
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-12 pl-8 pr-4 text-sm font-mono font-bold border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Motivo de Reasignación *</Label>
                        <Textarea 
                            placeholder="Escribe la justificación de esta transferencia..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[120px] text-sm font-medium border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm resize-none"
                        />
                    </div>
                </div>
                
                <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 rounded-bl-3xl">
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-xl text-sm font-bold border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        >
                            {isLoading ? <QhSpinner size="sm" className="mr-2" /> : null}
                            Solicitar
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
