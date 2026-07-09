"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        return <div className="flex justify-center p-12"><QhSpinner /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-lg font-semibold uppercase tracking-tight">Mapeo Automático de Cuentas</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Configura las reglas para generar pólizas automáticamente
                </p>
            </div>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="bg-gray-100 dark:bg-[#111] p-1 w-full justify-start rounded-md border border-gray-200 dark:border-[#222]">
                    <TabsTrigger value="categories" className="text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-[#222] data-[state=active]:shadow-sm">
                        Categorías (Resultados)
                    </TabsTrigger>
                    <TabsTrigger value="treasury" className="text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-[#222] data-[state=active]:shadow-sm">
                        Tesorería (Activo)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="mt-6 space-y-6">
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Nueva Regla por Categoría</h3>
                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Categoría del Gasto/Ingreso</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CATEGORY_TRANSLATIONS).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cuenta de Resultados</Label>
                                <Select value={categoryAccountId} onValueChange={setCategoryAccountId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Cuenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.code} - {acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSaveCategoryMapping} disabled={isSaving || !selectedCategory || !categoryAccountId} className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 uppercase tracking-widest text-[10px] font-bold h-10">
                                Añadir Regla
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-widest bg-gray-50 dark:bg-[#111] text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-bold border-b border-gray-200 dark:border-gray-800">Categoría</th>
                                    <th className="px-6 py-3 font-bold border-b border-gray-200 dark:border-gray-800">Tipo</th>
                                    <th className="px-6 py-3 font-bold border-b border-gray-200 dark:border-gray-800">Cuenta Mapeada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryMappings.map((m) => {
                                    const acc = accounts.find(a => a.id === m.accountId);
                                    return (
                                        <tr key={m.id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#111]">
                                            <td className="px-6 py-4 font-medium">{CATEGORY_TRANSLATIONS[m.budgetCategory] || m.budgetCategory}</td>
                                            <td className="px-6 py-4">{m.budgetType}</td>
                                            <td className="px-6 py-4 text-gray-500">{acc ? `${acc.code} - ${acc.name}` : m.accountId}</td>
                                        </tr>
                                    );
                                })}
                                {categoryMappings.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No hay reglas de categoría configuradas</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="treasury" className="mt-6 space-y-6">
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Nueva Regla de Tesorería</h3>
                        <div className="grid grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Método de Pago</Label>
                                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Método" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {satPaymentMethods.map(m => (
                                            <SelectItem key={m.code} value={m.code}>{m.code} - {m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Banco (Opcional)</Label>
                                <Select value={selectedBank} onValueChange={setSelectedBank}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Banco" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Cualquiera</SelectItem>
                                        {satBanks.map(b => (
                                            <SelectItem key={b.code} value={b.code}>{b.shortName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cuenta de Activo</Label>
                                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Cuenta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.code} - {acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSaveBankMapping} disabled={isSaving || !selectedPaymentMethod || !bankAccountId} className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 uppercase tracking-widest text-[10px] font-bold h-10">
                                Añadir Regla
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] uppercase tracking-widest bg-gray-50 dark:bg-[#111] text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-bold border-b border-gray-200 dark:border-gray-800">Método de Pago</th>
                                    <th className="px-6 py-3 font-bold border-b border-gray-200 dark:border-gray-800">Banco SAT</th>
                                    <th className="px-6 py-3 font-bold border-b border-gray-200 dark:border-gray-800">Cuenta Mapeada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bankMappings.map((m) => {
                                    const method = satPaymentMethods.find(x => x.code === m.satPaymentMethodCode);
                                    const bank = satBanks.find(x => x.code === m.satBankCode);
                                    const acc = accounts.find(a => a.id === m.accountId);
                                    return (
                                        <tr key={m.id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-[#111]">
                                            <td className="px-6 py-4 font-medium">{method ? `${method.code} - ${method.name}` : m.satPaymentMethodCode}</td>
                                            <td className="px-6 py-4">{bank ? bank.shortName : (m.satBankCode || 'Cualquiera')}</td>
                                            <td className="px-6 py-4 text-gray-500">{acc ? `${acc.code} - ${acc.name}` : m.accountId}</td>
                                        </tr>
                                    );
                                })}
                                {bankMappings.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-400">No hay reglas de tesorería configuradas</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
