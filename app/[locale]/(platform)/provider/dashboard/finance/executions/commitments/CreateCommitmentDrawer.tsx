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
            <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-black/10 dark:border-white/10 p-0 overflow-y-auto">
                <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                    <SheetHeader>
                        <SheetTitle className="text-sm font-bold uppercase tracking-widest">
                            Nuevo Compromiso
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">
                            Apartar fondos para gastos futuros
                        </SheetDescription>
                    </SheetHeader>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Presupuesto</Label>
                        <select 
                            value={selectedBudgetId || ""}
                            onChange={(e) => handleBudgetChange(Number(e.target.value))}
                            className="w-full h-10 px-3 text-sm border border-black/20 dark:border-white/20 bg-transparent rounded-none focus:outline-none focus:border-black dark:focus:border-white"
                        >
                            <option value="" disabled>Selecciona un presupuesto...</option>
                            {budgets.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Partida Afectada</Label>
                        <select 
                            value={lineItemId || ""}
                            onChange={(e) => setLineItemId(Number(e.target.value))}
                            disabled={!selectedBudgetId}
                            className="w-full h-10 px-3 text-sm border border-black/20 dark:border-white/20 bg-transparent rounded-none focus:outline-none focus:border-black dark:focus:border-white disabled:opacity-50"
                        >
                            <option value="" disabled>Selecciona partida de gasto...</option>
                            {lineItems.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (${l.projectedAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monto a Comprometer</Label>
                        <Input 
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-10 text-sm font-mono border-black/20 dark:border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Motivo / Proveedor / OC</Label>
                        <Textarea 
                            placeholder="Ej. Orden de Compra #1024, Contrato de Servicios..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px] text-sm border-black/20 dark:border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                        />
                    </div>

                    <div className="pt-4 border-t border-black/10 dark:border-white/10 flex justify-end gap-3">
                        <Button 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                            className="rounded-none h-10 px-6 text-[10px] font-bold uppercase tracking-widest"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isLoading}
                            className="rounded-none h-10 px-6 text-[10px] font-bold uppercase tracking-widest"
                        >
                            {isLoading ? <QhSpinner size="sm" /> : "Guardar Compromiso"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
