"use client";

import React, { useEffect, useState } from "react";
import { Plus, Loader2, ChevronDown, ChevronUp, Check, ChevronsUpDown, CheckCircle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { budgetService, BudgetExecutionLogDTO, BudgetDTO, BudgetLineItemDTO, BudgetExecutionRequest } from "@/services/budget.service";
import { accountingService, AccountDTO } from "@/services/accounting.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";

const CATEGORY_TRANSLATIONS: Record<string, string> = {
    CONSULTATIONS: "Consultas",
    SURGERIES_AND_PROCEDURES: "Cirugías y Proced.",
    LABORATORY: "Laboratorio",
    PHARMACY: "Farmacia",
    HOSPITALIZATION: "Hospitalización",
    IMAGING: "Imagenología",
    OTHER_INCOME: "Otros Ingresos",
    PAYROLL_MEDICAL: "Nómina Médica",
    PAYROLL_ADMIN: "Nómina Administrativa",
    MEDICAL_SUPPLIES: "Insumos Médicos",
    PHARMACEUTICALS: "Fármacos",
    EQUIPMENT_MAINTENANCE: "Mantenimiento Equipo",
    RENT: "Renta",
    UTILITIES: "Servicios",
    MARKETING: "Marketing",
    INSURANCE_AND_MALPRACTICE: "Seguros",
    TAXES: "Impuestos",
    OTHER_EXPENSE: "Otros Gastos"
};

export default function ExecutionsPage() {
    const [executions, setExecutions] = useState<BudgetExecutionLogDTO[]>([]);
    const [filteredExecutions, setFilteredExecutions] = useState<BudgetExecutionLogDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Combobox state
    const [openDebitCombobox, setOpenDebitCombobox] = useState(false);
    const [openCreditCombobox, setOpenCreditCombobox] = useState(false);
    const [activeBudget, setActiveBudget] = useState<BudgetDTO | null>(null);
    const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [selectedLineItemId, setSelectedLineItemId] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    
    // Treasury state
    const [satBanks, setSatBanks] = useState<{code: string; shortName: string; fullName: string;}[]>([]);
    const [satPaymentMethods, setSatPaymentMethods] = useState<{code: string; name: string;}[]>([]);
    const [satCurrencies, setSatCurrencies] = useState<{code: string; name: string;}[]>([]);
    const [paymentMethodCode, setPaymentMethodCode] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [currencyCode, setCurrencyCode] = useState("MXN");
    const [exchangeRate, setExchangeRate] = useState("1.0");

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
                const [data, linesData, accountsData, banks, methods, currencies] = await Promise.all([
                    budgetService.getExecutionHistory(current.id),
                    budgetService.getBudgetLineItems(current.id),
                    accountingService.getChartOfAccounts(),
                    accountingService.getSatBanks(),
                    accountingService.getSatPaymentMethods(),
                    accountingService.getSatCurrencies()
                ]);
                setExecutions(data);
                setFilteredExecutions(data);
                setLineItems(linesData);
                setAccounts(accountsData);
                setSatBanks(banks);
                setSatPaymentMethods(methods);
                setSatCurrencies(currencies);
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

    useEffect(() => {
        if (statusFilter === "ALL") {
            setFilteredExecutions(executions);
        } else {
            setFilteredExecutions(executions.filter(e => e.approvalStatus === statusFilter));
        }
    }, [statusFilter, executions]);

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
                paymentMethodCode: paymentMethodCode || undefined,
                bankCode: bankCode || undefined,
                currencyCode: currencyCode,
                exchangeRate: Number(exchangeRate) || 1.0,
                debitAccountId: debitAccountId !== "none" ? debitAccountId : null,
                creditAccountId: creditAccountId !== "none" ? creditAccountId : null
            };

            await budgetService.recordExecution(activeBudget.id, request);
            toast.success("Movimiento registrado y póliza borrador generada", { theme: "colored" });
            
            // Reset form
            setIsModalOpen(false);
            setSelectedLineItemId("");
            setAmount("");
            setDescription("");
            setPaymentMethodCode("");
            setBankCode("");
            setCurrencyCode("MXN");
            setExchangeRate("1.0");
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
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Ejecución del Presupuesto</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Registro de ingresos y gastos reales de {activeBudget?.name || '...'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] h-10 rounded-none border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los Estados</SelectItem>
                            <SelectItem value="APPROVED">Aprobados</SelectItem>
                            <SelectItem value="PENDING">Pendientes</SelectItem>
                            <SelectItem value="REJECTED">Rechazados / Bloqueados</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="rounded-none h-10 px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 text-[9px] font-bold uppercase tracking-widest transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Ejecutar Gasto o Ingreso
                            </Button>
                        </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#0a0a0a]">
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
                                                {item.name} ({CATEGORY_TRANSLATIONS[item.category] || item.category})
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

                            {/* Treasury Section */}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                                    Información de Tesorería
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Método de Pago *</Label>
                                        <Select value={paymentMethodCode} onValueChange={setPaymentMethodCode}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {satPaymentMethods.map(m => (
                                                    <SelectItem key={m.code} value={m.code}>
                                                        {m.code} - {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Banco</Label>
                                        <Select value={bankCode} onValueChange={setBankCode}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Opcional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {satBanks.map(b => (
                                                    <SelectItem key={b.code} value={b.code}>
                                                        {b.shortName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Moneda</Label>
                                        <Select value={currencyCode} onValueChange={setCurrencyCode}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Moneda" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {satCurrencies.map(c => (
                                                    <SelectItem key={c.code} value={c.code}>
                                                        {c.code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tipo de Cambio</Label>
                                        <Input 
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            disabled={currencyCode === "MXN"}
                                        />
                                    </div>
                                </div>
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
                                            <Popover open={openDebitCombobox} onOpenChange={setOpenDebitCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openDebitCombobox}
                                                        className="w-full justify-between h-8 text-xs font-normal"
                                                    >
                                                        {debitAccountId !== "none"
                                                            ? accounts.find((acc) => acc.id.toString() === debitAccountId)?.name
                                                            : "-- Automático --"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0 bg-white dark:bg-[#0a0a0a]" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar cuenta por código o nombre..." className="text-xs" />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontró ninguna cuenta.</CommandEmpty>
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    value="none"
                                                                    onSelect={() => {
                                                                        setDebitAccountId("none");
                                                                        setOpenDebitCombobox(false);
                                                                    }}
                                                                    className="text-xs font-medium"
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", debitAccountId === "none" ? "opacity-100" : "opacity-0")} />
                                                                    -- Automático --
                                                                </CommandItem>
                                                                {accounts.map((acc) => (
                                                                    <CommandItem
                                                                        key={acc.id}
                                                                        value={`${acc.code} ${acc.name}`}
                                                                        onSelect={() => {
                                                                            setDebitAccountId(acc.id.toString());
                                                                            setOpenDebitCombobox(false);
                                                                        }}
                                                                        className="text-xs"
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", debitAccountId === acc.id.toString() ? "opacity-100" : "opacity-0")} />
                                                                        <span className="font-mono mr-2">{acc.code}</span> {acc.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest">Cuenta de Abono (Haber)</Label>
                                            <Popover open={openCreditCombobox} onOpenChange={setOpenCreditCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCreditCombobox}
                                                        className="w-full justify-between h-8 text-xs font-normal"
                                                    >
                                                        {creditAccountId !== "none"
                                                            ? accounts.find((acc) => acc.id.toString() === creditAccountId)?.name
                                                            : "-- Automático --"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0 bg-white dark:bg-[#0a0a0a]" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar cuenta por código o nombre..." className="text-xs" />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontró ninguna cuenta.</CommandEmpty>
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    value="none"
                                                                    onSelect={() => {
                                                                        setCreditAccountId("none");
                                                                        setOpenCreditCombobox(false);
                                                                    }}
                                                                    className="text-xs font-medium"
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", creditAccountId === "none" ? "opacity-100" : "opacity-0")} />
                                                                    -- Automático --
                                                                </CommandItem>
                                                                {accounts.map((acc) => (
                                                                    <CommandItem
                                                                        key={acc.id}
                                                                        value={`${acc.code} ${acc.name}`}
                                                                        onSelect={() => {
                                                                            setCreditAccountId(acc.id.toString());
                                                                            setOpenCreditCombobox(false);
                                                                        }}
                                                                        className="text-xs"
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", creditAccountId === acc.id.toString() ? "opacity-100" : "opacity-0")} />
                                                                        <span className="font-mono mr-2">{acc.code}</span> {acc.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
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
                        {filteredExecutions.length > 0 ? (
                            filteredExecutions.map((exec) => (
                                <tr key={exec.id} className={`border-b border-black/10 dark:border-white/10 transition-colors ${exec.approvalStatus === 'REJECTED' ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-[#050505]/50'}`}>
                                    <td className="px-6 py-4">
                                        {exec.createdAt ? new Date(exec.createdAt).toLocaleDateString() : 'N/A'}
                                        {exec.approvalStatus === 'REJECTED' && (
                                            <p className="text-[8px] font-bold text-red-600 mt-1 uppercase tracking-widest">Bloqueado</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${exec.budgetLineItem?.type === 'INCOME' ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10' : 'border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-900/10'}`}>
                                            {exec.budgetLineItem?.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{CATEGORY_TRANSLATIONS[exec.budgetLineItem?.category] || exec.budgetLineItem?.category || 'Sin categoría'}</td>
                                    <td className="px-6 py-4 text-gray-500">{exec.description}</td>
                                    <td className="px-6 py-4 text-right font-mono">${(exec.amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        {exec.approvalStatus === 'REJECTED' ? (
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">Rechazado (Políticas)</span>
                                        ) : exec.cfdiUuid ? (
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
