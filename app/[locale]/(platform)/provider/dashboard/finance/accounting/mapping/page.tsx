"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function AccountingMappingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [satBanks, setSatBanks] = useState<{code: string; shortName: string; fullName: string;}[]>([]);
    const [satPaymentMethods, setSatPaymentMethods] = useState<{code: string; name: string;}[]>([]);
    
    const [categoryMappings, setCategoryMappings] = useState<any[]>([]);
    const [bankMappings, setBankMappings] = useState<any[]>([]);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryAccountId, setCategoryAccountId] = useState("");

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [selectedBank, setSelectedBank] = useState("");
    const [bankAccountId, setBankAccountId] = useState("");

    const fetchData = async () => {
        try {
            const [accs, banks, methods, catMap, bankMap] = await Promise.all([
                accountingService.getChartOfAccounts(),
                accountingService.getSatBanks(),
                accountingService.getSatPaymentMethods(),
                accountingService.getCategoryMappings(),
                accountingService.getBankMappings()
            ]);
            setAccounts(accs);
            setSatBanks(banks);
            setSatPaymentMethods(methods);
            setCategoryMappings(catMap);
            setBankMappings(bankMap);
        } catch (error) {
            toast.error("Error al cargar la configuración", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveCategoryMapping = async () => {
        if (!selectedCategory || !categoryAccountId) return;
        try {
            setIsSaving(true);
            const budgetType = ["CONSULTATIONS", "OTHER_INCOME"].includes(selectedCategory) ? "INCOME" : "EXPENSE";
            await accountingService.saveCategoryMapping({
                budgetCategory: selectedCategory,
                budgetType: budgetType,
                accountId: categoryAccountId
            });
            toast.success("Regla de Categoría guardada", { theme: "colored" });
            fetchData();
            setSelectedCategory("");
            setCategoryAccountId("");
        } catch (error) {
            toast.error("Error al guardar la regla", { theme: "colored" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBankMapping = async () => {
        if (!selectedPaymentMethod || !bankAccountId) return;
        try {
            setIsSaving(true);
            await accountingService.saveBankMapping({
                satPaymentMethodCode: selectedPaymentMethod,
                satBankCode: selectedBank || null,
                accountId: bankAccountId
            });
            toast.success("Regla de Tesorería guardada", { theme: "colored" });
            fetchData();
            setSelectedPaymentMethod("");
            setSelectedBank("");
            setBankAccountId("");
        } catch (error) {
            toast.error("Error al guardar la regla", { theme: "colored" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mapeo Automático de Cuentas</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">
                    Configura las reglas para generar pólizas automáticamente
                </p>
            </div>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="bg-gray-100/80 dark:bg-gray-900 p-1 w-full sm:w-auto inline-flex justify-start rounded-2xl border border-gray-200/50 dark:border-gray-800 h-auto">
                    <TabsTrigger 
                        value="categories" 
                        className="text-sm font-bold px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-[#111] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                    >
                        Categorías (Resultados)
                    </TabsTrigger>
                    <TabsTrigger 
                        value="treasury" 
                        className="text-sm font-bold px-6 py-2.5 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-[#111] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                    >
                        Tesorería (Activo)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="mt-6 space-y-6">
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nueva Regla por Categoría</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoría del Gasto/Ingreso</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]">
                                        <SelectValue placeholder="Seleccionar Categoría" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800">
                                        {Object.entries(CATEGORY_TRANSLATIONS).map(([key, value]) => (
                                            <SelectItem key={key} value={key} className="rounded-lg">{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cuenta de Resultados</Label>
                                <Select value={categoryAccountId} onValueChange={setCategoryAccountId}>
                                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]">
                                        <SelectValue placeholder="Seleccionar Cuenta" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 max-h-60">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()} className="rounded-lg">{acc.code} - {acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                                onClick={handleSaveCategoryMapping} 
                                disabled={isSaving || !selectedCategory || !categoryAccountId} 
                                className="h-11 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm w-full md:w-auto"
                            >
                                {isSaving ? <QhSpinner size="sm" className="mr-2" /> : null}
                                Añadir Regla
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cuenta Mapeada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {categoryMappings.map((m) => {
                                        const acc = accounts.find(a => a.id === m.accountId);
                                        return (
                                            <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                                                    {CATEGORY_TRANSLATIONS[m.budgetCategory] || m.budgetCategory}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                                                        m.budgetType === 'INCOME' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {m.budgetType === 'INCOME' ? 'Ingreso' : 'Egreso'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {acc ? `${acc.code} - ${acc.name}` : m.accountId}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {categoryMappings.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-sm font-semibold text-gray-500">
                                                No hay reglas de categoría configuradas
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="treasury" className="mt-6 space-y-6">
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nueva Regla de Tesorería</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Método de Pago</Label>
                                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]">
                                        <SelectValue placeholder="Método" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 max-h-60">
                                        {satPaymentMethods.map(m => (
                                            <SelectItem key={m.code} value={m.code} className="rounded-lg">{m.code} - {m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Banco (Opcional)</Label>
                                <Select value={selectedBank} onValueChange={setSelectedBank}>
                                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]">
                                        <SelectValue placeholder="Banco" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 max-h-60">
                                        <SelectItem value="none" className="rounded-lg font-semibold text-gray-500">Cualquiera (Todos)</SelectItem>
                                        {satBanks.map(b => (
                                            <SelectItem key={b.code} value={b.code} className="rounded-lg">{b.shortName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cuenta de Activo</Label>
                                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]">
                                        <SelectValue placeholder="Seleccionar Cuenta" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 max-h-60">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()} className="rounded-lg">{acc.code} - {acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button 
                                onClick={handleSaveBankMapping} 
                                disabled={isSaving || !selectedPaymentMethod || !bankAccountId} 
                                className="h-11 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm w-full"
                            >
                                {isSaving ? <QhSpinner size="sm" className="mr-2" /> : null}
                                Añadir Regla
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Método de Pago</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Banco SAT</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cuenta Mapeada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {bankMappings.map((m) => {
                                        const method = satPaymentMethods.find(x => x.code === m.satPaymentMethodCode);
                                        const bank = satBanks.find(x => x.code === m.satBankCode);
                                        const acc = accounts.find(a => a.id === m.accountId);
                                        return (
                                            <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                                                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono mr-2 text-gray-600 dark:text-gray-400">
                                                        {m.satPaymentMethodCode}
                                                    </span>
                                                    {method ? method.name : ''}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {bank ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                            {bank.shortName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Cualquiera (Todos)</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    {acc ? `${acc.code} - ${acc.name}` : m.accountId}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {bankMappings.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-sm font-semibold text-gray-500">
                                                No hay reglas de tesorería configuradas
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
