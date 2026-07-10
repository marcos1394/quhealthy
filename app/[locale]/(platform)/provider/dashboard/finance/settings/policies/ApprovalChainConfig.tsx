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
        return <div className="flex justify-center p-8"><QhSpinner size="sm" /></div>;
    }

    return (
        <div className="space-y-4">
            {chain.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-black/20 dark:border-white/20 bg-gray-50 dark:bg-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
                        No hay una cadena de aprobación configurada
                    </p>
                    <Button 
                        onClick={addStep}
                        className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 rounded-none h-8 px-4 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <Plus className="w-3 h-3 mr-2" />
                        Crear Primer Paso
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {chain.map((step, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] items-start md:items-center relative">
                            <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                                <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">
                                    {step.stepOrder}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full">
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase tracking-wider text-gray-500">Rol Mínimo</Label>
                                    <Select 
                                        value={step.minimumRole || ""} 
                                        onValueChange={(val) => updateStep(index, 'minimumRole', val)}
                                    >
                                        <SelectTrigger className="h-8 text-xs rounded-none">
                                            <SelectValue placeholder="Seleccione un rol" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            <SelectItem value="FINANCE_VIEWER">Observador Financiero</SelectItem>
                                            <SelectItem value="FINANCE_OPERATOR">Operador Financiero</SelectItem>
                                            <SelectItem value="FINANCE_APPROVER">Aprobador Financiero</SelectItem>
                                            <SelectItem value="FINANCE_DIRECTOR">Director Financiero</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase tracking-wider text-gray-500">Alcance</Label>
                                    <Select 
                                        value={step.scope} 
                                        onValueChange={(val) => updateStep(index, 'scope', val as ApprovalScope)}
                                    >
                                        <SelectTrigger className="h-8 text-xs rounded-none">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            <SelectItem value={ApprovalScope.ALL}>Todo (Gasto y Transf.)</SelectItem>
                                            <SelectItem value={ApprovalScope.EXECUTION}>Solo Gastos</SelectItem>
                                            <SelectItem value={ApprovalScope.TRANSFER}>Solo Transferencias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase tracking-wider text-gray-500">Aprobador Específico (Opcional)</Label>
                                    <Input 
                                        placeholder="ID de usuario..."
                                        className="h-8 text-xs rounded-none" 
                                        value={step.approverId || ''} 
                                        onChange={(e) => updateStep(index, 'approverId', e.target.value ? parseInt(e.target.value) : undefined)} 
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase tracking-wider text-gray-500">Monto Mínimo (Opcional)</Label>
                                    <Input 
                                        type="number"
                                        placeholder="Sin mínimo"
                                        className="h-8 text-xs rounded-none" 
                                        value={step.amountThreshold || ''} 
                                        onChange={(e) => updateStep(index, 'amountThreshold', e.target.value ? parseFloat(e.target.value) : undefined)} 
                                    />
                                </div>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-none absolute top-2 right-2 md:static"
                                onClick={() => removeStep(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-4">
                        <Button 
                            variant="outline" 
                            onClick={addStep}
                            className="border-black dark:border-white text-black dark:text-white rounded-none h-8 px-4 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <Plus className="w-3 h-3 mr-2" /> Agregar Paso
                        </Button>
                        
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 rounded-none h-8 px-4 text-[10px] font-bold uppercase tracking-widest gap-2"
                        >
                            {isSaving ? <QhSpinner size="sm" /> : <Save className="w-3 h-3" />} Guardar Cadena
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
