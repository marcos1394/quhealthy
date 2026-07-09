"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { accountingService, AccountDTO, JournalEntryRequest, JournalEntryLineDTO } from "@/services/accounting.service";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
            toast.warning("Debe haber al menos 2 asientos en la póliza");
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
            toast.error("Faltan campos obligatorios");
            return;
        }

        if (!isBalanced) {
            toast.error("La póliza no cuadra (Partida Doble Inválida)");
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
            toast.success("Póliza creada exitosamente");
            router.push("/provider/dashboard/finance/accounting/journals");
        } catch (error) {
            toast.error("Error al crear la póliza");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link href="/provider/dashboard/finance/accounting/journals" className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold">Capturar Póliza</h2>
                    <p className="text-sm text-gray-500 mt-1">Cumplimiento Anexo 24 (Contabilidad Electrónica)</p>
                </div>
            </div>

            {/* Cabecera */}
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold border-b border-black/10 dark:border-white/10 pb-2 mb-4">Datos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Fecha de Póliza</Label>
                        <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <select 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:cursor-not-allowed disabled:opacity-50"
                            value={type} onChange={e => setType(e.target.value as any)}
                        >
                            <option value="JOURNAL">Diario</option>
                            <option value="INCOME">Ingreso</option>
                            <option value="EXPENSE">Egreso</option>
                        </select>
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label>Concepto General</Label>
                        <Input placeholder="Descripción de la operación..." value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                        <ShieldAlert className="h-4 w-4" />
                        Metadatos SAT (Opcional - Cabecera)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Solicitud</Label>
                            <select 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:cursor-not-allowed disabled:opacity-50"
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
                            <Label>No. Orden</Label>
                            <Input placeholder="Ej. OIM3424..." value={satOrderNumber} onChange={e => setSatOrderNumber(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>No. Trámite</Label>
                            <Input placeholder="Ej. 1234567890..." value={satProcedureNumber} onChange={e => setSatProcedureNumber(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>UUID CFDI (Global)</Label>
                            <Input placeholder="8-4-4-4-12 chars..." value={cfdiUuid} onChange={e => setCfdiUuid(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detalle (Asientos) */}
            <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4 border-b border-black/10 dark:border-white/10 pb-2">
                    <h3 className="font-semibold">Asientos Contables (Detalle)</h3>
                    <Button variant="outline" size="sm" onClick={addLine}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Asiento
                    </Button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-black/10 dark:border-white/10 text-left text-gray-500">
                                <th className="pb-2 font-medium w-1/3">Cuenta</th>
                                <th className="pb-2 font-medium w-1/4">Concepto</th>
                                <th className="pb-2 font-medium w-32 text-right">Cargo ($)</th>
                                <th className="pb-2 font-medium w-32 text-right">Abono ($)</th>
                                <th className="pb-2 font-medium w-24 text-center">SAT</th>
                                <th className="pb-2 font-medium w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {lines.map((line, index) => (
                                <tr key={index} className="group">
                                    <td className="py-2 pr-2">
                                        <select 
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-black/20 dark:border-white/20 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
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
                                    <td className="py-2 pr-2">
                                        <Input 
                                            placeholder="Concepto de la partida"
                                            value={line.description}
                                            onChange={e => updateLine(index, 'description', e.target.value)}
                                        />
                                    </td>
                                    <td className="py-2 pr-2">
                                        <Input 
                                            type="number" 
                                            step="0.01"
                                            className="text-right"
                                            value={line.debit || ''}
                                            onChange={e => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                                            disabled={line.credit > 0}
                                        />
                                    </td>
                                    <td className="py-2 pr-2">
                                        <Input 
                                            type="number" 
                                            step="0.01"
                                            className="text-right"
                                            value={line.credit || ''}
                                            onChange={e => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                                            disabled={line.debit > 0}
                                        />
                                    </td>
                                    <td className="py-2 text-center">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className={line.cfdiUuid || line.thirdPartyRfc ? "border-emerald-500 text-emerald-600" : ""}
                                            onClick={() => setActiveLineIndex(index)}
                                        >
                                            Datos
                                        </Button>
                                    </td>
                                    <td className="py-2 text-right">
                                        <button 
                                            onClick={() => removeLine(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-sm border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                        <div className="flex justify-between p-3 border-b border-black/10 dark:border-white/10 text-sm">
                            <span className="font-semibold text-gray-500">Total Cargos:</span>
                            <span className="font-mono">${totalDebit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-3 border-b border-black/10 dark:border-white/10 text-sm">
                            <span className="font-semibold text-gray-500">Total Abonos:</span>
                            <span className="font-mono">${totalCredit.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between p-3 text-sm font-bold ${isBalanced ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                            <span>Diferencia:</span>
                            <span className="font-mono">${difference.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button 
                        size="lg" 
                        onClick={handleSubmit} 
                        disabled={!isBalanced || isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Guardar Póliza
                    </Button>
                </div>
            </div>

            {/* Modal para Metadatos SAT a nivel de partida */}
            {activeLineIndex !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-blue-500" />
                            Detalle Fiscal (Asiento #{activeLineIndex + 1})
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>UUID CFDI</Label>
                                <Input 
                                    placeholder="8-4-4-4-12"
                                    value={lines[activeLineIndex].cfdiUuid || ''}
                                    onChange={e => updateLine(activeLineIndex, 'cfdiUuid', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>RFC Tercero</Label>
                                <Input 
                                    placeholder="XEXX010101000"
                                    value={lines[activeLineIndex].thirdPartyRfc || ''}
                                    onChange={e => updateLine(activeLineIndex, 'thirdPartyRfc', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Monto Total CFDI</Label>
                                <Input 
                                    type="number" step="0.01"
                                    value={lines[activeLineIndex].cfdiTotalAmount || ''}
                                    onChange={e => updateLine(activeLineIndex, 'cfdiTotalAmount', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Método de Pago (SAT)</Label>
                                <Input 
                                    placeholder="Ej. 01, 03, 99"
                                    value={lines[activeLineIndex].paymentMethodCode || ''}
                                    onChange={e => updateLine(activeLineIndex, 'paymentMethodCode', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-4 border-b pb-1">Bancos y Divisas</h4>
                            </div>
                            <div className="space-y-2">
                                <Label>Moneda</Label>
                                <Input 
                                    placeholder="MXN, USD"
                                    value={lines[activeLineIndex].currencyCode || ''}
                                    onChange={e => updateLine(activeLineIndex, 'currencyCode', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Cambio</Label>
                                <Input 
                                    type="number" step="0.0001"
                                    value={lines[activeLineIndex].exchangeRate || ''}
                                    onChange={e => updateLine(activeLineIndex, 'exchangeRate', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Banco Nacional (Clave)</Label>
                                <Input 
                                    placeholder="Ej. 002"
                                    value={lines[activeLineIndex].nationalBankCode || ''}
                                    onChange={e => updateLine(activeLineIndex, 'nationalBankCode', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cuenta Origen</Label>
                                <Input 
                                    value={lines[activeLineIndex].originAccount || ''}
                                    onChange={e => updateLine(activeLineIndex, 'originAccount', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cuenta Destino</Label>
                                <Input 
                                    value={lines[activeLineIndex].destinationAccount || ''}
                                    onChange={e => updateLine(activeLineIndex, 'destinationAccount', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button onClick={() => setActiveLineIndex(null)}>
                                Listo
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
