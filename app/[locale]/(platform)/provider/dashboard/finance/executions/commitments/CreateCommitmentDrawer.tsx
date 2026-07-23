import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { budgetService, BudgetDTO, BudgetLineItemDTO } from "@/services/budget.service";

interface CreateCommitmentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateCommitmentDrawer({ open, onOpenChange, onSuccess }: CreateCommitmentDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
    const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
    
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
    const [lineItemId, setLineItemId] = useState<number | null>(null);
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
        setLineItemId(null);
        setAmount("");
        setReason("");
        setLineItems([]);
    };

    const loadBudgets = async () => {
        try {
            const data = await budgetService.listBudgets();
            setBudgets(data);
        } catch {
            toast.error("Error al cargar presupuestos");
        }
    };

    const handleBudgetChange = async (id: number) => {
        setSelectedBudgetId(id);
        setLineItemId(null);
        try {
            const items = await budgetService.getBudgetLineItems(id);
            setLineItems(items.filter(i => i.type === 'EXPENSE')); // Solo comprometer gastos
        } catch {
            toast.error("Error al cargar partidas");
        }
    };

    const handleSave = async () => {
        if (!lineItemId || !amount || !reason) {
            toast.error("Por favor completa todos los campos", { theme: "colored" });
            return;
        }

        setIsLoading(true);
        try {
            await budgetService.createCommitment({
                lineItemId,
                amount: parseFloat(amount),
                reason
            });
            toast.success("Compromiso registrado", { theme: "colored" });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error al registrar compromiso", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-none p-0 overflow-hidden flex flex-col h-full rounded-l-3xl shadow-2xl">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            Nuevo Compromiso
                        </SheetTitle>
                        <SheetDescription className="text-sm font-medium text-gray-500">
                            Apartar fondos para gastos futuros
                        </SheetDescription>
                    </SheetHeader>
                </div>
                
                <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Presupuesto</Label>
                        <select 
                            value={selectedBudgetId || ""}
                            onChange={(e) => handleBudgetChange(Number(e.target.value))}
                            className="w-full h-11 px-3 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                        >
                            <option value="" disabled>Selecciona un presupuesto...</option>
                            {budgets.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partida Afectada</Label>
                        <select 
                            value={lineItemId || ""}
                            onChange={(e) => setLineItemId(Number(e.target.value))}
                            disabled={!selectedBudgetId}
                            className="w-full h-11 px-3 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900"
                        >
                            <option value="" disabled>Selecciona partida de gasto...</option>
                            {lineItems.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (${l.projectedAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monto a Comprometer</Label>
                        <Input 
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-11 text-sm font-mono border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Motivo / Proveedor / OC</Label>
                        <Textarea 
                            placeholder="Ej. Orden de Compra #1024, Contrato de Servicios..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px] text-sm border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-sm transition-all resize-none"
                        />
                    </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3 mt-auto">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-11 px-6 text-sm font-bold border-gray-200 shadow-sm"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="rounded-xl h-11 px-6 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                        {isLoading ? <QhSpinner size="sm" className="mr-2" /> : null}
                        {isLoading ? "Guardando..." : "Guardar Compromiso"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
