import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { budgetService, BudgetDTO, BudgetLineItemDTO } from "@/services/budget.service";

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
            toast.error("Error al cargar presupuestos");
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
            toast.error("Error al cargar partidas");
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
            <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-black/10 dark:border-white/10 p-0 overflow-y-auto">
                <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                    <SheetHeader>
                        <SheetTitle className="text-sm font-bold uppercase tracking-widest">
                            Nueva Reasignación
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">
                            Transferir fondos entre partidas
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
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Partida Origen (Reduce fondos)</Label>
                        <select 
                            value={fromLineItemId || ""}
                            onChange={(e) => setFromLineItemId(Number(e.target.value))}
                            disabled={!selectedBudgetId}
                            className="w-full h-10 px-3 text-sm border border-black/20 dark:border-white/20 bg-transparent rounded-none focus:outline-none focus:border-black dark:focus:border-white disabled:opacity-50"
                        >
                            <option value="" disabled>Selecciona partida origen...</option>
                            {lineItems.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (${l.projectedAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Partida Destino (Recibe fondos)</Label>
                        <select 
                            value={toLineItemId || ""}
                            onChange={(e) => setToLineItemId(Number(e.target.value))}
                            disabled={!selectedBudgetId}
                            className="w-full h-10 px-3 text-sm border border-black/20 dark:border-white/20 bg-transparent rounded-none focus:outline-none focus:border-black dark:focus:border-white disabled:opacity-50"
                        >
                            <option value="" disabled>Selecciona partida destino...</option>
                            {lineItems.map(l => (
                                <option key={l.id} value={l.id}>{l.name} (${l.projectedAmount})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monto a Transferir</Label>
                        <Input 
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-10 text-sm font-mono border-black/20 dark:border-white/20 rounded-none focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Motivo</Label>
                        <Textarea 
                            placeholder="Escribe la justificación de esta transferencia..."
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
                            {isLoading ? <QhSpinner size="sm" /> : "Solicitar Transferencia"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
