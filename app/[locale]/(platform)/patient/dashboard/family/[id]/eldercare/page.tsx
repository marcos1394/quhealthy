"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    HeartHandshake, ChevronLeft, Activity, Thermometer, 
    HeartPulse, Pill, CalendarClock, PhoneCall, Plus, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamily } from '@/hooks/useFamily';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { eldercareService, EldercareDashboardDto } from '@/services/eldercare.service';

export default function EldercarePage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const { family, isLoading } = useFamily();
    const [member, setMember] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<EldercareDashboardDto | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!isLoading && family) {
            const found = family.find(f => f.id === Number(params.id));
            if (found) {
                setMember(found);
                eldercareService.getDashboard(found.id)
                    .then(data => {
                        setDashboardData(data);
                        setIsLoadingData(false);
                    })
                    .catch(err => {
                        console.error(err);
                        toast.error("Error al cargar datos clínicos");
                        setIsLoadingData(false);
                    });
            } else {
                toast.error("Familiar no encontrado");
                router.push('/patient/dashboard/family');
            }
        }
    }, [isLoading, family, params.id, router]);

    const handleRequestCare = () => {
        toast.info("Redirigiendo a solicitud de servicios de enfermería a domicilio...");
        router.push('/patient/dashboard/appointments/book?service=nursing');
    };

    if (isLoading || !member || isLoadingData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a]">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
                    Accediendo a expediente...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans pb-32 text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
            
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
                
                {/* Header Back & Info */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => router.back()} 
                            className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
                        >
                            <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight uppercase flex items-center gap-3 mb-1">
                                <HeartHandshake className="w-8 h-8" strokeWidth={1.5} />
                                Cuidados Geriátricos
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                Panel de seguimiento y telemetría para <span className="text-black dark:text-white">{member.firstName} {member.lastName}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Hero CTA (Blueprint Block) */}
                <div className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex flex-col md:flex-row">
                    <div className="p-8 md:p-12 flex-1">
                        <span className="border border-white/30 dark:border-black/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest mb-6 inline-flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                            Servicios a Domicilio
                        </span>
                        <h2 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight leading-tight">
                            Atención profesional en la comodidad de su hogar
                        </h2>
                        <p className="text-xs font-light text-gray-400 dark:text-gray-600 mb-8 max-w-xl leading-relaxed">
                            Solicite cuidadores, enfermeros o terapeutas físicos certificados para brindar atención clínica a sus seres queridos con monitoreo constante.
                        </p>
                        <Button 
                            onClick={handleRequestCare}
                            className="rounded-none bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center border-0"
                        >
                            Solicitar Asistencia
                            <ArrowRight className="w-4 h-4 ml-3" strokeWidth={2} />
                        </Button>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-white/20 dark:border-black/20 p-8 md:w-64 flex flex-col items-center justify-center text-center bg-white/5 dark:bg-black/5">
                        <PhoneCall className="w-10 h-10 mb-4 opacity-80" strokeWidth={1.5} />
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2">
                            Asistencia 24/7
                        </div>
                        <div className="text-[9px] font-light uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            Cobertura Integral
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Signos Vitales */}
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
                        <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                                <HeartPulse className="w-4 h-4" strokeWidth={1.5} />
                                Signos Vitales
                            </h3>
                            <Button 
                                variant="outline" 
                                className="rounded-none border border-black dark:border-white h-8 px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            >
                                <Plus className="w-3 h-3 mr-2" strokeWidth={2} /> Registrar
                            </Button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-800">
                            {dashboardData?.recentVitals?.length === 0 && (
                                <div className="p-6 text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">No hay registros recientes</p>
                                </div>
                            )}
                            {dashboardData?.recentVitals?.map(vital => (
                                <div key={vital.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center shrink-0">
                                            {vital.type === 'BLOOD_PRESSURE' ? (
                                                <HeartPulse className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                            ) : vital.type === 'TEMPERATURE' ? (
                                                <Thermometer className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                            ) : (
                                                <Activity className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{vital.type}</div>
                                            <div className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                                                {vital.value} {vital.secondaryValue ? `/${vital.secondaryValue}` : ''} <span className="text-xs font-light text-gray-500 ml-1">{vital.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="border border-gray-300 dark:border-gray-700 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap w-fit">
                                        {new Date(vital.measuredAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Medicación Activa */}
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col">
                        <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                                <Pill className="w-4 h-4" strokeWidth={1.5} />
                                Medicación Activa
                            </h3>
                            <Button 
                                variant="outline" 
                                className="rounded-none border border-black dark:border-white h-8 px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            >
                                <Plus className="w-3 h-3 mr-2" strokeWidth={2} /> Añadir
                            </Button>
                        </div>

                        <div className="p-6 grid grid-cols-1 gap-4">
                            {dashboardData?.activeMedications?.length === 0 && (
                                <div className="text-center p-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sin medicación activa</p>
                                </div>
                            )}
                            {dashboardData?.activeMedications?.map(med => (
                                <div key={med.id} className="border border-gray-200 dark:border-gray-800 p-6 hover:border-black dark:hover:border-white transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div>
                                            <h4 className="text-lg font-semibold tracking-tight text-black dark:text-white uppercase mb-1">{med.medicationName}</h4>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{med.dosage}</p>
                                        </div>
                                        <div className="border border-black dark:border-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 w-fit">
                                            <CalendarClock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            {med.frequency}
                                        </div>
                                    </div>
                                    
                                    {med.isManual && (
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500 mb-2">Ingresado manualmente</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}