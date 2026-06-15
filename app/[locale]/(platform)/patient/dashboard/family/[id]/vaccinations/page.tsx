"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Syringe, ChevronLeft, CheckCircle2, Circle, Clock, ShieldCheck, FileCheck2, Loader2, ScanFace, Upload, Camera, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamily } from '@/hooks/useFamily';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/axios';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { vaccinationService } from '@/services/vaccination.service';
import { VaccinationStatusDto } from '@/types/vaccination';

// Helper for mapping age to labels
function getAgeLabel(months: number) {
    if (months === 0) return 'Al Nacer';
    if (months === 2) return '2 Meses';
    if (months === 4) return '4 Meses';
    if (months === 6) return '6 Meses';
    if (months === 7) return '7 Meses';
    if (months === 12) return '12 Meses (1 Año)';
    if (months === 18) return '18 Meses (1.5 Años)';
    if (months === 24) return '24 Meses (2 Años)';
    if (months === 36) return '36 Meses (3 Años)';
    if (months === 48) return '48 Meses (4 Años)';
    if (months === 59) return '59 Meses (5 Años)';
    if (months === 72) return '72 Meses (6 Años)';
    if (months === 132) return '11 Años o 5º de primaria';
    return `${months} Meses`;
}

// Mapper to map AI extract IDs to numeric Catalog IDs if possible
// This would need a better backend sync, but for demo:
const ID_MAPPING: Record<string, string> = {
    'bcg': 'Tuberculosis',
    'hepb_1': 'Hepatitis B',
    // We try to match by name roughly
};

export default function VaccinationsPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const { family, isLoading } = useFamily();
    const [member, setMember] = useState<any>(null);

    const [vaccinesData, setVaccinesData] = useState<VaccinationStatusDto[]>([]);
    const [isLoadingVaccines, setIsLoadingVaccines] = useState(true);

    const [simulatingAction, setSimulatingAction] = useState<number | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Modal para seleccionar fecha manual
    const [isManualMarkModalOpen, setIsManualMarkModalOpen] = useState(false);
    const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const loadVaccines = useCallback(async (dependentId: number) => {
        setIsLoadingVaccines(true);
        try {
            const data = await vaccinationService.getVaccinations(dependentId);
            setVaccinesData(data);
        } catch (error) {
            console.error("Error fetching vaccines:", error);
            toast.error("Error al cargar el esquema de vacunación.");
        } finally {
            setIsLoadingVaccines(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && family) {
            const found = family.find(f => f.id === Number(params.id));
            if (found) {
                setMember(found);
                loadVaccines(found.id);
            } else {
                toast.error("Familiar no encontrado");
                router.push('/patient/dashboard/family');
            }
        }
    }, [isLoading, family, params.id, router, loadVaccines]);

    const groupedVaccines = useMemo(() => {
        const groups: Record<number, { ageGroup: string, vaccines: VaccinationStatusDto[] }> = {};
        vaccinesData.forEach(vaccine => {
            const month = vaccine.recommendedAgeMonths;
            if (!groups[month]) {
                groups[month] = { ageGroup: getAgeLabel(month), vaccines: [] };
            }
            groups[month].vaccines.push(vaccine);
        });
        return Object.values(groups).sort((a, b) => a.vaccines[0].recommendedAgeMonths - b.vaccines[0].recommendedAgeMonths);
    }, [vaccinesData]);

    const handleToggleVaccine = (vaccine: VaccinationStatusDto) => {
        if (vaccine.isApplied) {
            toast.info("La vacuna ya fue aplicada. No se puede desmarcar.");
        } else {
            setSelectedVaccineId(vaccine.vaccineCatalogId);
            setSelectedDate(new Date()); 
            setIsManualMarkModalOpen(true);
        }
    };

    const confirmManualMark = async () => {
        if (!selectedVaccineId || !selectedDate || !member) return;
        
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        setSimulatingAction(selectedVaccineId);
        
        try {
            await vaccinationService.markVaccine(member.id, {
                vaccineCatalogId: selectedVaccineId,
                appliedDate: dateStr
            });
            toast.success("Vacuna registrada exitosamente. Comprobante guardado en Bóveda.");
            setIsManualMarkModalOpen(false);
            await loadVaccines(member.id);
        } catch (err) {
            console.error(err);
            toast.error("Hubo un error al registrar la vacuna.");
        } finally {
            setSimulatingAction(null);
            setSelectedVaccineId(null);
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !member) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsScanning(true);
        toast.info("Escaneando cartilla de vacunación con Inteligencia Artificial...");

        try {
            const response = await apiClient.post('/api/onboarding/consumer/vault/vaccinations/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            let markedCount = 0;
            for (const item of response.data) {
                if (item.vaccineId && item.dateApplied) {
                    // Try to match string ID with numeric ID (In real app, backend would return catalog ID)
                    // We'll just try to match the prefix for demo or refresh
                    // Actually, if we get matched dates, we'd fire the POST.
                    // For now, we will just inform user that extraction needs backend ID mapping, or do a fuzzy match.
                    
                    const catalogMatch = vaccinesData.find(v => 
                        v.diseasePrevented.toLowerCase().includes(item.vaccineId.toLowerCase().replace(/_[0-9]+$/, '')) ||
                        v.name.toLowerCase().includes(item.vaccineId.toLowerCase().replace(/_[0-9]+$/, ''))
                    );
                    
                    if (catalogMatch && !catalogMatch.isApplied) {
                        await vaccinationService.markVaccine(member.id, {
                            vaccineCatalogId: catalogMatch.vaccineCatalogId,
                            appliedDate: item.dateApplied
                        });
                        markedCount++;
                    }
                }
            }
            
            if (markedCount > 0) {
                toast.success(`¡Se registraron ${markedCount} vacunas encontradas en la imagen!`);
                loadVaccines(member.id);
            } else {
                toast.warning("La IA no detectó vacunas nuevas o reconocibles en la imagen.");
            }
            
        } catch (error) {
            console.error("Error extrayendo vacunas:", error);
            toast.error("Hubo un error al leer la cartilla. Intenta tomar la foto más clara.");
        } finally {
            setIsScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (cameraInputRef.current) cameraInputRef.current.value = '';
        }
    };

    if (isLoading || !member || isLoadingVaccines) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <QhSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#09090b] font-sans pb-32 text-slate-900 dark:text-white selection:bg-medical-500/30">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-sky-500/5 dark:bg-sky-500/10 blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10 space-y-8">
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
                        <input type="file" accept="image/*,application/pdf" hidden ref={fileInputRef} onChange={handleFileSelect} />
                        <input type="file" accept="image/*" capture="environment" hidden ref={cameraInputRef} onChange={handleFileSelect} />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    size="lg" 
                                    disabled={isScanning}
                                    className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-full font-bold shadow-lg transition-all flex items-center gap-2"
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
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl z-50">
                                <DropdownMenuItem onClick={() => cameraInputRef.current?.click()} className="rounded-xl py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <Camera className="mr-3 h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    <span className="font-medium">Tomar foto ahora</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="rounded-xl py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <FileUp className="mr-3 h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    <span className="font-medium">Subir desde dispositivo</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="space-y-6">
                    {groupedVaccines.map((stage, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={stage.ageGroup} 
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-medical-500" />
                                    {stage.ageGroup}
                                </h2>
                            </div>
                            
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {stage.vaccines.map(vaccine => {
                                    const isApplied = vaccine.isApplied;
                                    const isSimulating = simulatingAction === vaccine.vaccineCatalogId;

                                    return (
                                        <div key={vaccine.vaccineCatalogId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => handleToggleVaccine(vaccine)}
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
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{vaccine.diseasePrevented} (Dosis {vaccine.doseNumber})</p>
                                                    
                                                    {isApplied && vaccine.appliedDate && (
                                                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md w-fit">
                                                            <FileCheck2 className="w-3.5 h-3.5" />
                                                            Aplicada el {vaccine.appliedDate}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {!isApplied && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    disabled={isSimulating}
                                                    onClick={() => handleToggleVaccine(vaccine)}
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

            <Dialog open={isManualMarkModalOpen} onOpenChange={setIsManualMarkModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle>Registrar aplicación de vacuna</DialogTitle>
                        <DialogDescription>
                            Selecciona la fecha en la que se aplicó esta vacuna. Por defecto es la fecha de hoy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2 flex flex-col">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Fecha de aplicación
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[60] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsManualMarkModalOpen(false)}
                            className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmManualMark}
                            disabled={!selectedDate || simulatingAction !== null}
                            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                        >
                            {simulatingAction !== null ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck2 className="w-4 h-4 mr-2" />}
                            Guardar Registro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
