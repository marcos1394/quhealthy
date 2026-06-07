"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Syringe, ChevronLeft, CheckCircle2, Circle, Clock, ShieldCheck, FileCheck2, Loader2, ScanFace, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamily } from '@/hooks/useFamily';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/axios';
import { useRef } from 'react';

// Esquema Básico Simulado
const VACCINE_SCHEDULE = [
    {
        ageGroup: 'Al Nacer',
        vaccines: [
            { id: 'bcg', name: 'BCG (Tuberculosis)', description: 'Única dosis' },
            { id: 'hepb_1', name: 'Hepatitis B', description: 'Primera dosis' }
        ]
    },
    {
        ageGroup: '2 Meses',
        vaccines: [
            { id: 'pentavalente_1', name: 'Pentavalente acelular', description: 'Primera dosis (Difteria, Tos ferina, Tétanos, Polio, Haemophilus B)' },
            { id: 'hepb_2', name: 'Hepatitis B', description: 'Segunda dosis' },
            { id: 'rotavirus_1', name: 'Rotavirus', description: 'Primera dosis' },
            { id: 'neumococo_1', name: 'Neumococo conjugada', description: 'Primera dosis' }
        ]
    },
    {
        ageGroup: '4 Meses',
        vaccines: [
            { id: 'pentavalente_2', name: 'Pentavalente acelular', description: 'Segunda dosis' },
            { id: 'rotavirus_2', name: 'Rotavirus', description: 'Segunda dosis' },
            { id: 'neumococo_2', name: 'Neumococo conjugada', description: 'Segunda dosis' }
        ]
    },
    {
        ageGroup: '6 Meses',
        vaccines: [
            { id: 'pentavalente_3', name: 'Pentavalente acelular', description: 'Tercera dosis' },
            { id: 'hepb_3', name: 'Hepatitis B', description: 'Tercera dosis' },
            { id: 'rotavirus_3', name: 'Rotavirus', description: 'Tercera dosis (Depende marca)' },
            { id: 'influenza_1', name: 'Influenza', description: 'Primera dosis' }
        ]
    },
    {
        ageGroup: '12 Meses (1 Año)',
        vaccines: [
            { id: 'srp_1', name: 'SRP (Sarampión, Rubéola, Parotiditis)', description: 'Primera dosis' },
            { id: 'neumococo_3', name: 'Neumococo conjugada', description: 'Refuerzo' }
        ]
    }
];

export default function VaccinationsPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const { family, isLoading } = useFamily();
    const [member, setMember] = useState<any>(null);

    // Estado simulado de vacunas aplicadas
    const [appliedVaccines, setAppliedVaccines] = useState<Record<string, { date: string, documentId?: string }>>({});
    const [simulatingAction, setSimulatingAction] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoading && family) {
            const found = family.find(f => f.id === Number(params.id));
            if (found) {
                setMember(found);
                // Inicializamos vacío como corresponde para la integración real
                setAppliedVaccines({});
            } else {
                toast.error("Familiar no encontrado");
                router.push('/patient/dashboard/family');
            }
        }
    }, [isLoading, family, params.id, router]);

    const handleToggleVaccine = (vaccineId: string) => {
        if (appliedVaccines[vaccineId]) {
            // Desmarcar
            const newObj = { ...appliedVaccines };
            delete newObj[vaccineId];
            setAppliedVaccines(newObj);
            toast.info("Vacuna marcada como pendiente");
        } else {
            // Simular carga de comprobante
            setSimulatingAction(vaccineId);
            setTimeout(() => {
                setAppliedVaccines(prev => ({
                    ...prev,
                    [vaccineId]: { date: new Date().toISOString().split('T')[0], documentId: 'simulated_doc_123' }
                }));
                setSimulatingAction(null);
                toast.success("Vacuna marcada como aplicada. Comprobante guardado en Bóveda.");
            }, 1200);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsScanning(true);
        toast.info("Escaneando cartilla de vacunación con Inteligencia Artificial...");

        try {
            const response = await apiClient.post('/api/onboarding/consumer/vault/vaccinations/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const newVaccines: Record<string, { date: string }> = {};
            for (const item of response.data) {
                if (item.vaccineId && item.dateApplied) {
                    newVaccines[item.vaccineId] = { date: item.dateApplied };
                }
            }
            
            if (Object.keys(newVaccines).length > 0) {
                setAppliedVaccines(prev => ({ ...prev, ...newVaccines }));
                toast.success(`¡Se extrajeron ${Object.keys(newVaccines).length} vacunas exitosamente!`);
            } else {
                toast.warning("La IA no detectó vacunas aplicadas en la imagen.");
            }
            
        } catch (error) {
            console.error("Error extrayendo vacunas:", error);
            toast.error("Hubo un error al leer la cartilla. Intenta tomar la foto más clara.");
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (isLoading || !member) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <QhSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#09090b] font-sans pb-32 text-slate-900 dark:text-white selection:bg-medical-500/30">
            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-sky-500/5 dark:bg-sky-500/10 blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10 space-y-8">
                
                {/* Header Back & Info */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white dark:hover:bg-slate-800">
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Syringe className="w-8 h-8 text-sky-500" />
                            Cartilla de Vacunación
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Esquema oficial para <span className="font-semibold text-slate-700 dark:text-slate-200">{member.firstName} {member.lastName}</span>
                        </p>
                    </div>
                </div>

                {/* Resumen Progress y CTA Scanner */}
                <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Protección Inmunológica</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Mantén el esquema de vacunación al día para prevenir enfermedades graves.</p>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <input 
                            type="file" 
                            accept="image/*,application/pdf" 
                            capture="environment" 
                            hidden 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <Button 
                            size="lg" 
                            disabled={isScanning}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full md:w-auto bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 text-white rounded-full font-bold shadow-lg shadow-medical-500/20 flex items-center gap-2"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analizando con IA...
                                </>
                            ) : (
                                <>
                                    <ScanFace className="w-5 h-5" />
                                    Escanear Cartilla
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Timeline / Grid de Vacunas */}
                <div className="space-y-6">
                    {VACCINE_SCHEDULE.map((stage, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={stage.ageGroup} 
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-medical-500" />
                                    {stage.ageGroup}
                                </h2>
                            </div>
                            
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {stage.vaccines.map(vaccine => {
                                    const isApplied = !!appliedVaccines[vaccine.id];
                                    const isSimulating = simulatingAction === vaccine.id;

                                    return (
                                        <div key={vaccine.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => handleToggleVaccine(vaccine.id)}
                                                    disabled={isSimulating}
                                                    className="mt-1 shrink-0 focus:outline-none"
                                                >
                                                    {isSimulating ? (
                                                        <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                                                    ) : isApplied ? (
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-500 transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 transition-transform group-hover:scale-110" />
                                                    )}
                                                </button>
                                                <div>
                                                    <h4 className={cn(
                                                        "font-bold text-base transition-colors",
                                                        isApplied ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
                                                    )}>
                                                        {vaccine.name}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{vaccine.description}</p>
                                                    
                                                    {isApplied && (
                                                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit">
                                                            <FileCheck2 className="w-3.5 h-3.5" />
                                                            Aplicada el {appliedVaccines[vaccine.id].date}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {!isApplied && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    disabled={isSimulating}
                                                    onClick={() => handleToggleVaccine(vaccine.id)}
                                                    className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-xl border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400"
                                                >
                                                    Marcar Aplicada
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
