import React, { useState } from 'react';
import { useTranslations } from "next-intl";
import { Activity, X, PlusCircle } from "lucide-react";
import { VitalSignRequest } from '@/types/ehr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VitalSignsCaptureProps {
    vitalSigns: VitalSignRequest[];
    addVitalSign: (vs: VitalSignRequest) => void;
    removeVitalSign: (index: number) => void;
}

const VITAL_SIGN_TYPES = [
    { value: 'HEART_RATE', label: 'FRECUENCIA CARDÍACA (BPM)' },
    { value: 'BLOOD_PRESSURE', label: 'PRESIÓN ARTERIAL (MMHG)' },
    { value: 'BLOOD_OXYGEN', label: 'OXÍGENO EN SANGRE (%)' },
    { value: 'BODY_TEMPERATURE', label: 'TEMPERATURA CORPORAL (°C)' },
    { value: 'WEIGHT', label: 'PESO (KG)' },
    { value: 'HEIGHT', label: 'ALTURA (CM)' },
    { value: 'BMI', label: 'IMC' },
    { value: 'RESPIRATORY_RATE', label: 'FRECUENCIA RESPIRATORIA' },
    { value: 'GLUCOSE', label: 'GLUCOSA (MG/DL)' }
];

export const VitalSignsCapture: React.FC<VitalSignsCaptureProps> = ({ vitalSigns, addVitalSign, removeVitalSign }) => {
    const t = useTranslations('EHR');
    
    const [type, setType] = useState('HEART_RATE');
    const [value, setValue] = useState('');
    const [secondaryValue, setSecondaryValue] = useState('');

    const handleAdd = () => {
        if (!value) return;

        let unit = '';
        switch(type) {
            case 'HEART_RATE': unit = 'bpm'; break;
            case 'BLOOD_PRESSURE': unit = 'mmHg'; break;
            case 'BLOOD_OXYGEN': unit = '%'; break;
            case 'BODY_TEMPERATURE': unit = 'C'; break;
            case 'WEIGHT': unit = 'kg'; break;
            case 'HEIGHT': unit = 'cm'; break;
            case 'GLUCOSE': unit = 'mg/dL'; break;
            default: unit = '';
        }

        addVitalSign({
            type,
            value: parseFloat(value),
            secondaryValue: secondaryValue ? parseFloat(secondaryValue) : undefined,
            unit,
            measuredAt: new Date().toISOString(),
            source: 'MANUAL',
            deviceModel: 'CONSULTORIO'
        });

        setValue('');
        setSecondaryValue('');
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        TIPO DE SIGNO VITAL
                    </label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase rounded-none focus:ring-0 focus:ring-offset-0 focus:border-black dark:focus:border-white h-[34px] px-2">
                            <SelectValue placeholder="TIPO" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                            {VITAL_SIGN_TYPES.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs font-semibold uppercase cursor-pointer focus:bg-gray-100 dark:focus:bg-[#1a1a1a]">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="flex-1 w-full">
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        VALOR {type === 'BLOOD_PRESSURE' && '(SISTÓLICA)'}
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="block w-full border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase p-2 rounded-none focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white"
                        placeholder="0.0"
                    />
                </div>

                {type === 'BLOOD_PRESSURE' && (
                    <div className="flex-1 w-full">
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                            DIASTÓLICA
                        </label>
                        <input
                            type="number"
                            value={secondaryValue}
                            onChange={(e) => setSecondaryValue(e.target.value)}
                            className="block w-full border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-xs font-semibold uppercase p-2 rounded-none focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white"
                            placeholder="0.0"
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!value || (type === 'BLOOD_PRESSURE' && !secondaryValue)}
                    className="h-9 px-4 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-colors rounded-none w-full sm:w-auto"
                >
                    <PlusCircle className="w-3.5 h-3.5" /> AGREGAR
                </button>
            </div>

            {/* Selected Vital Signs */}
            {vitalSigns.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {vitalSigns.map((vs, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                                    {VITAL_SIGN_TYPES.find(t => t.value === vs.type)?.label || vs.type}
                                </span>
                                <span className="text-xs font-bold uppercase text-black dark:text-white">
                                    {vs.value} {vs.secondaryValue ? `/ ${vs.secondaryValue}` : ''} <span className="text-gray-400 font-normal">{vs.unit}</span>
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeVitalSign(idx)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
