"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { accountingService, AccountDTO, JournalEntryRequest, JournalEntryLineDTO } from "@/services/accounting.service";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Trash2, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function CreateJournalEntryPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Cabecera state
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'JOURNAL'>('JOURNAL');
    const [description, setDescription] = useState("");
    
    // Metadatos SAT Cabecera
    const [cfdiUuid, setCfdiUuid] = useState("");
    const [satRequestType, setSatRequestType] = useState("");
    const [satOrderNumber, setSatOrderNumber] = useState("");
    const [satProcedureNumber, setSatProcedureNumber] = useState("");

    // Detalle state
    const [lines, setLines] = useState<JournalEntryLineDTO[]>([
        { accountId: 0, description: "", debit: 0, credit: 0 },
        { accountId: 0, description: "", debit: 0, credit: 0 }
    ]);

    // Modal state for SAT metadata
    const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

    useEffect(() => {
        accountingService.getChartOfAccounts().then(setAccounts).catch(console.error);
    }, []);

    const addLine = () => {
        setLines([...lines, { accountId: 0, description: "", debit: 0, credit: 0 }]);
    };

    const removeLine = (index: number) => {
        if (lines.length <= 2) {
            toast.warning("Debe haber al menos 2 asientos en la póliza", { theme: "colored" });
            return;
        }
        setLines(lines.filter((_, i) => i !== index));
    };

    const updateLine = (index: number, field: keyof JournalEntryLineDTO, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = totalDebit > 0 && difference === 0;

    const handleSubmit = async () => {
        if (!description || lines.some(l => l.accountId === 0)) {
            toast.error("Faltan campos obligatorios", { theme: "colored" });
            return;
        }

        if (!isBalanced) {
            toast.error("La póliza no cuadra (Partida Doble Inválida)", { theme: "colored" });
            return;
        }

        setIsSubmitting(true);
        try {
            const request: JournalEntryRequest = {
                entryDate,
                type,
                description,
                cfdiUuid: cfdiUuid || undefined,
                satRequestType: satRequestType || undefined,
                satOrderNumber: satOrderNumber || undefined,
                satProcedureNumber: satProcedureNumber || undefined,
                lines
            };

            await accountingService.createJournalEntry(request);
            toast.success("Póliza creada exitosamente", { theme: "colored" });
            router.push("/provider/dashboard/finance/accounting/journals");
        } catch (error) {
            toast.error("Error al crear la póliza", { theme: "colored" });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/provider/dashboard/finance/accounting/journals" className="w-11 h-11 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm">
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Capturar Póliza</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Cumplimiento Anexo 24 (Contabilidad Electrónica)</p>
                </div>
            </div>

            {/* Cabecera */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
                        <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Datos Generales</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Fecha de Póliza</Label>
                        <Input 
                            type="date" 
                            value={entryDate} 
                            onChange={e => setEntryDate(e.target.value)}
                            className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Tipo</Label>
                        <select 
                            className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            value={type} onChange={e => setType(e.target.value as any)}
                        >
                            <option value="JOURNAL">Diario</option>
                            <option value="INCOME">Ingreso</option>
                            <option value="EXPENSE">Egreso</option>
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label className="text-sm font-semibold">Concepto General</Label>
                        <Input 
                            placeholder="Descripción de la operación..." 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white mb-6">
                        <ShieldAlert className="h-5 w-5 text-blue-500" />
                        Metadatos SAT (Opcional - Cabecera)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Tipo de Solicitud</Label>
                            <select 
                                className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                value={satRequestType} onChange={e => setSatRequestType(e.target.value)}
                            >
                                <option value="">No Aplica</option>
                                <option value="AF">Acto de Fiscalización</option>
                                <option value="FC">Fiscalización por Compulsa</option>
                                <option value="DE">Devolución</option>
                                <option value="CO">Compensación</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">No. Orden</Label>
                            <Input 
                                placeholder="Ej. OIM3424..." 
                                value={satOrderNumber} 
                                onChange={e => setSatOrderNumber(e.target.value)}
                                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">No. Trámite</Label>
                            <Input 
                                placeholder="Ej. 1234567890..." 
                                value={satProcedureNumber} 
                                onChange={e => setSatProcedureNumber(e.target.value)}
                                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">UUID CFDI (Global)</Label>
                            <Input 
                                placeholder="8-4-4-4-12 chars..." 
                                value={cfdiUuid} 
                                onChange={e => setCfdiUuid(e.target.value)}
                                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detalle (Asientos) */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asientos Contables (Detalle)</h3>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={addLine}
                        className="rounded-xl h-11 px-4 border-gray-200 dark:border-gray-800 shadow-sm font-bold text-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Asiento
                    </Button>
                </div>
                
                <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-left bg-white dark:bg-[#0a0a0a]">
                        <thead className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Cuenta</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Concepto</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-right">Cargo ($)</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-right">Abono ($)</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24 text-center">SAT</th>
                                <th className="p-4 w-12 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {lines.map((line, index) => (
                                <tr key={index} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    <td className="p-3">
                                        <select 
                                            className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                            value={line.accountId}
                                            onChange={e => updateLine(index, 'accountId', Number(e.target.value))}
                                        >
                                            <option value={0} disabled>Seleccionar Cuenta...</option>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.code} - {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <Input 
                                            placeholder="Concepto de la partida"
                                            value={line.description}
                                            onChange={e => updateLine(index, 'description', e.target.value)}
                                            className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Input 
                                            type="number" 
                                            step="0.01"
                                            className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-right font-mono"
                                            value={line.debit || ''}
                                            onChange={e => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                                            disabled={line.credit > 0}
                                        />
                                    </td>
                                    <td className="p-3">
                                        <Input 
                                            type="number" 
                                            step="0.01"
                                            className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-right font-mono"
                                            value={line.credit || ''}
                                            onChange={e => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                                            disabled={line.debit > 0}
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className={`rounded-xl h-9 text-xs font-bold border-gray-200 shadow-sm ${line.cfdiUuid || line.thirdPartyRfc ? "border-emerald-500 text-emerald-600 bg-emerald-50" : ""}`}
                                            onClick={() => setActiveLineIndex(index)}
                                        >
                                            Datos
                                        </Button>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => removeLine(index)}
                                            className="w-9 h-9 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cuadre */}
                <div className="mt-8 flex justify-end">
                    <div className="w-full max-w-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                            <span className="font-semibold text-gray-500">Total Cargos:</span>
                            <span className="font-mono font-bold">${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                            <span className="font-semibold text-gray-500">Total Abonos:</span>
                            <span className="font-mono font-bold">${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className={`flex justify-between p-4 text-base font-bold transition-colors ${isBalanced ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                            <span>Diferencia:</span>
                            <span className="font-mono">${difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button 
                        size="lg" 
                        onClick={handleSubmit} 
                        disabled={!isBalanced || isSubmitting}
                        className="w-full sm:w-auto h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-8 font-bold shadow-sm"
                    >
                        {isSubmitting ? <QhSpinner size="sm" className="mr-2" /> : null}
                        {isSubmitting ? "Guardando..." : "Guardar Póliza"}
                    </Button>
                </div>
            </div>

            {/* Modal para Metadatos SAT a nivel de partida */}
            {activeLineIndex !== null && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Detalle Fiscal (Asiento #{activeLineIndex + 1})
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">UUID CFDI</Label>
                                <Input 
                                    placeholder="8-4-4-4-12"
                                    value={lines[activeLineIndex].cfdiUuid || ''}
                                    onChange={e => updateLine(activeLineIndex, 'cfdiUuid', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200 font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">RFC Tercero</Label>
                                <Input 
                                    placeholder="XEXX010101000"
                                    value={lines[activeLineIndex].thirdPartyRfc || ''}
                                    onChange={e => updateLine(activeLineIndex, 'thirdPartyRfc', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200 uppercase font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Monto Total CFDI</Label>
                                <Input 
                                    type="number" step="0.01"
                                    value={lines[activeLineIndex].cfdiTotalAmount || ''}
                                    onChange={e => updateLine(activeLineIndex, 'cfdiTotalAmount', parseFloat(e.target.value))}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Método de Pago (SAT)</Label>
                                <Input 
                                    placeholder="Ej. 01, 03, 99"
                                    value={lines[activeLineIndex].paymentMethodCode || ''}
                                    onChange={e => updateLine(activeLineIndex, 'paymentMethodCode', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2 mt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bancos y Divisas</h4>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Moneda</Label>
                                <Input 
                                    placeholder="MXN, USD"
                                    value={lines[activeLineIndex].currencyCode || ''}
                                    onChange={e => updateLine(activeLineIndex, 'currencyCode', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Tipo de Cambio</Label>
                                <Input 
                                    type="number" step="0.0001"
                                    value={lines[activeLineIndex].exchangeRate || ''}
                                    onChange={e => updateLine(activeLineIndex, 'exchangeRate', parseFloat(e.target.value))}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Banco Nacional (Clave)</Label>
                                <Input 
                                    placeholder="Ej. 002"
                                    value={lines[activeLineIndex].nationalBankCode || ''}
                                    onChange={e => updateLine(activeLineIndex, 'nationalBankCode', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Cuenta Origen</Label>
                                <Input 
                                    value={lines[activeLineIndex].originAccount || ''}
                                    onChange={e => updateLine(activeLineIndex, 'originAccount', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Cuenta Destino</Label>
                                <Input 
                                    value={lines[activeLineIndex].destinationAccount || ''}
                                    onChange={e => updateLine(activeLineIndex, 'destinationAccount', e.target.value)}
                                    className="h-11 rounded-xl shadow-sm border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <Button 
                                onClick={() => setActiveLineIndex(null)}
                                className="rounded-xl h-11 px-8 font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            >
                                Listo
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
