import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { approvalService, ApprovalChainStepDTO, ApprovalScope } from "@/services/approval.service";

interface ApprovalChainConfigProps {
    providerId: number;
}

export function ApprovalChainConfig({ providerId }: ApprovalChainConfigProps) {
    const [chain, setChain] = useState<ApprovalChainStepDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadChain();
    }, [providerId]);

    const loadChain = async () => {
        setIsLoading(true);
        try {
            const data = await approvalService.getApprovalChain(providerId);
            setChain(data);
        } catch (error) {
            toast.error("Error al cargar la cadena de aprobación", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    const addStep = () => {
        const newStep: ApprovalChainStepDTO = {
            stepOrder: chain.length + 1,
            scope: ApprovalScope.ALL,
            active: true,
            minimumRole: "FINANCE_APPROVER",
        };
        setChain([...chain, newStep]);
    };

    const updateStep = (index: number, field: keyof ApprovalChainStepDTO, value: any) => {
        const newChain = [...chain];
        newChain[index] = { ...newChain[index], [field]: value };
        setChain(newChain);
    };

    const removeStep = async (index: number) => {
        const step = chain[index];
        if (step.id) {
            try {
                await approvalService.deleteChainStep(providerId, step.id);
            } catch (error) {
                toast.error("Error al eliminar el paso de la base de datos", { theme: "colored" });
                return;
            }
        }
        
        const newChain = chain.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 }));
        setChain(newChain);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Guarda paso por paso (en un caso real, podría ser un endpoint batch)
            const savedSteps = [];
            for (const step of chain) {
                const saved = await approvalService.saveChainStep(providerId, step);
                savedSteps.push(saved);
            }
            setChain(savedSteps);
            toast.success("Cadena de aprobación guardada", { theme: "colored" });
        } catch (error) {
            toast.error("Error al guardar la cadena", { theme: "colored" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><QhSpinner size="md" className="text-emerald-600" /></div>;
    }

    return (
        <div className="space-y-4">
            {chain.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <p className="text-sm font-bold text-gray-500">
                        No hay una cadena de aprobación configurada
                    </p>
                    <Button 
                        onClick={addStep}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors h-10 px-6 rounded-xl font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Paso
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {chain.map((step, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow items-start md:items-center relative group">
                            <div className="flex items-center gap-3">
                                <GripVertical className="w-5 h-5 text-gray-300 cursor-move group-hover:text-gray-400" />
                                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-sm font-bold shadow-sm">
                                    {step.stepOrder}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full pl-2 md:pl-0">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Rol Mínimo</Label>
                                    <Select 
                                        value={step.minimumRole || ""} 
                                        onValueChange={(val) => updateStep(index, 'minimumRole', val)}
                                    >
                                        <SelectTrigger className="h-10 text-sm rounded-xl border-gray-200 shadow-sm bg-white dark:bg-[#111]">
                                            <SelectValue placeholder="Seleccione un rol" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-200">
                                            <SelectItem value="FINANCE_VIEWER">Observador Financiero</SelectItem>
                                            <SelectItem value="FINANCE_OPERATOR">Operador Financiero</SelectItem>
                                            <SelectItem value="FINANCE_APPROVER">Aprobador Financiero</SelectItem>
                                            <SelectItem value="FINANCE_DIRECTOR">Director Financiero</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Alcance</Label>
                                    <Select 
                                        value={step.scope} 
                                        onValueChange={(val) => updateStep(index, 'scope', val as ApprovalScope)}
                                    >
                                        <SelectTrigger className="h-10 text-sm rounded-xl border-gray-200 shadow-sm bg-white dark:bg-[#111]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-200">
                                            <SelectItem value={ApprovalScope.ALL}>Todo (Gasto y Transf.)</SelectItem>
                                            <SelectItem value={ApprovalScope.EXECUTION}>Solo Gastos</SelectItem>
                                            <SelectItem value={ApprovalScope.TRANSFER}>Solo Transferencias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Aprobador Específico</Label>
                                    <Input 
                                        placeholder="ID usuario (opcional)"
                                        className="h-10 text-sm rounded-xl border-gray-200 shadow-sm bg-white dark:bg-[#111]" 
                                        value={step.approverId || ''} 
                                        onChange={(e) => updateStep(index, 'approverId', e.target.value ? parseInt(e.target.value) : undefined)} 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Monto Mínimo</Label>
                                    <Input 
                                        type="number"
                                        placeholder="Sin mínimo"
                                        className="h-10 text-sm rounded-xl border-gray-200 shadow-sm bg-white dark:bg-[#111]" 
                                        value={step.amountThreshold || ''} 
                                        onChange={(e) => updateStep(index, 'amountThreshold', e.target.value ? parseFloat(e.target.value) : undefined)} 
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl absolute top-3 right-3 md:static opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
                                onClick={() => removeStep(index)}
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    ))}
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 gap-4">
                        <Button 
                            variant="outline" 
                            onClick={addStep}
                            className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold border-gray-200 shadow-sm gap-2"
                        >
                            <Plus className="w-4 h-4" /> Agregar Paso
                        </Button>
                        
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 transition-colors"
                        >
                            {isSaving ? <QhSpinner size="sm" /> : <Save className="w-4 h-4" />} Guardar Cadena
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
