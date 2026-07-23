"use client";

import React, { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp, Check, ChevronsUpDown, CheckCircle, Download, FileText } from "lucide-react";
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
            const current = budgets.find(b => b.status === 'ACTIVE') || budgets[0];
            
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
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">
                    Cargando movimientos...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ejecución del Presupuesto</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Registro de ingresos y gastos reales de {activeBudget?.name || '...'}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px] h-11 rounded-xl border-gray-200 dark:border-gray-800 text-sm font-medium shadow-sm bg-white dark:bg-[#0a0a0a]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800">
                            <SelectItem value="ALL">Todos los Estados</SelectItem>
                            <SelectItem value="APPROVED">Aprobados</SelectItem>
                            <SelectItem value="PENDING">Pendientes</SelectItem>
                            <SelectItem value="REJECTED">Rechazados / Bloqueados</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                className="rounded-xl h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold shadow-sm transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Ejecutar Movimiento
                            </Button>
                        </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0a0a0a] rounded-3xl border-gray-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden">
                        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Registrar Ejecución</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partida de Presupuesto</Label>
                                <Select value={selectedLineItemId} onValueChange={setSelectedLineItemId}>
                                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm bg-white dark:bg-[#0a0a0a]">
                                        <SelectValue placeholder="Selecciona una partida" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 shadow-lg">
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
                                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Monto</Label>
                                    <Input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción del Movimiento</Label>
                                <Input 
                                    placeholder="Ej. Pago de campaña publicitaria" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm"
                                />
                            </div>

                            {/* Treasury Section */}
                            <div className="pt-5 border-t border-gray-200 dark:border-gray-800 mt-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                                    Información de Tesorería
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Método de Pago *</Label>
                                        <Select value={paymentMethodCode} onValueChange={setPaymentMethodCode}>
                                            <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {satPaymentMethods.map(m => (
                                                    <SelectItem key={m.code} value={m.code}>
                                                        {m.code} - {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Banco</Label>
                                        <Select value={bankCode} onValueChange={setBankCode}>
                                            <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm">
                                                <SelectValue placeholder="Opcional" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {satBanks.map(b => (
                                                    <SelectItem key={b.code} value={b.code}>
                                                        {b.shortName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Moneda</Label>
                                        <Select value={currencyCode} onValueChange={setCurrencyCode}>
                                            <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm">
                                                <SelectValue placeholder="Moneda" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {satCurrencies.map(c => (
                                                    <SelectItem key={c.code} value={c.code}>
                                                        {c.code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo de Cambio</Label>
                                        <Input 
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                            disabled={currencyCode === "MXN"}
                                            className="rounded-xl border-gray-200 dark:border-gray-800 h-11 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hybrid Accounting Section */}
                            <div className="pt-5 border-t border-gray-200 dark:border-gray-800 mt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors"
                                >
                                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    Opciones Contables (Avanzado)
                                </button>
                                
                                {showAdvanced && (
                                    <div className="space-y-4 mt-4 bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                        <p className="text-sm text-gray-500 mb-2">
                                            Si dejas estas opciones vacías, el sistema generará la póliza automáticamente usando la cuenta por defecto configurada.
                                        </p>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Cuenta de Cargo (Debe)</Label>
                                            <Popover open={openDebitCombobox} onOpenChange={setOpenDebitCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openDebitCombobox}
                                                        className="w-full justify-between h-11 rounded-xl text-sm font-normal border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                                                    >
                                                        {debitAccountId !== "none"
                                                            ? accounts.find((acc) => acc.id.toString() === debitAccountId)?.name
                                                            : "-- Automático --"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border-gray-200 dark:border-gray-800" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar cuenta por código o nombre..." className="text-sm" />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontró ninguna cuenta.</CommandEmpty>
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    value="none"
                                                                    onSelect={() => {
                                                                        setDebitAccountId("none");
                                                                        setOpenDebitCombobox(false);
                                                                    }}
                                                                    className="text-sm font-medium"
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
                                                                        className="text-sm"
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
                                            <Label className="text-sm font-semibold">Cuenta de Abono (Haber)</Label>
                                            <Popover open={openCreditCombobox} onOpenChange={setOpenCreditCombobox}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openCreditCombobox}
                                                        className="w-full justify-between h-11 rounded-xl text-sm font-normal border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                                                    >
                                                        {creditAccountId !== "none"
                                                            ? accounts.find((acc) => acc.id.toString() === creditAccountId)?.name
                                                            : "-- Automático --"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border-gray-200 dark:border-gray-800" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar cuenta por código o nombre..." className="text-sm" />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontró ninguna cuenta.</CommandEmpty>
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    value="none"
                                                                    onSelect={() => {
                                                                        setCreditAccountId("none");
                                                                        setOpenCreditCombobox(false);
                                                                    }}
                                                                    className="text-sm font-medium"
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
                                                                        className="text-sm"
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
                        <DialogFooter className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancelar</Button>
                            <Button 
                                onClick={handleRegisterExecution}
                                disabled={isSubmitting}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold"
                            >
                                {isSubmitting ? <QhSpinner size="sm" className="mr-2" /> : null}
                                {isSubmitting ? "Registrando..." : "Guardar y Contabilizar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Monto</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Factura (CFDI)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredExecutions.length > 0 ? (
                                filteredExecutions.map((exec) => (
                                    <tr key={exec.id} className={`transition-colors group ${exec.approvalStatus === 'REJECTED' ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/20'}`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {exec.createdAt ? new Date(exec.createdAt).toLocaleDateString() : 'N/A'}
                                            {exec.approvalStatus === 'REJECTED' && (
                                                <p className="text-xs font-bold text-red-600 mt-1">Bloqueado</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${exec.budgetLineItem?.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                {exec.budgetLineItem?.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {CATEGORY_TRANSLATIONS[exec.budgetLineItem?.category] || exec.budgetLineItem?.category || 'Sin categoría'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={exec.description}>
                                            {exec.description}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold font-mono text-gray-900 dark:text-white">
                                            ${(exec.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {exec.approvalStatus === 'REJECTED' ? (
                                                <span className="text-xs font-bold text-red-500">Rechazado (Políticas)</span>
                                            ) : exec.cfdiUuid ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title={`CFDI: ${exec.cfdiUuid}`}>
                                                        <Download className="w-4 h-4 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline" className="h-8 px-3 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 shadow-sm text-gray-700 dark:text-gray-300">
                                                    <FileText className="w-4 h-4 mr-2" /> Generar
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm font-semibold text-gray-500">
                                        No hay movimientos registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
