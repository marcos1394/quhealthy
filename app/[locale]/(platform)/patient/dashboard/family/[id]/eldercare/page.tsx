"use client";

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

export default function EldercarePage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations();
    const { family, isLoading } = useFamily();
    const [member, setMember] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && family) {
            const found = family.find(f => f.id === Number(params.id));
            if (found) {
                setMember(found);
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
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10 space-y-8">
                
                {/* Header Back & Info */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-white dark:hover:bg-slate-800">
                        <ChevronLeft className="w-6 h-6 text-slate-500" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <HeartHandshake className="w-8 h-8 text-emerald-500" />
                            Cuidados Geriátricos
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Panel de seguimiento para <span className="font-semibold text-slate-700 dark:text-slate-200">{member.firstName} {member.lastName}</span>
                        </p>
                    </div>
                </div>

                {/* Main Hero CTA */}
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-xl shadow-emerald-500/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-20 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
                    
                    <div className="relative z-10 max-w-xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                            <Activity className="w-4 h-4" />
                            <span>Servicios a Domicilio</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Atención profesional en la comodidad de su hogar
                        </h2>
                        <p className="text-emerald-50 text-lg mb-8 leading-relaxed">
                            Solicita cuidadores, enfermeros o terapeutas físicos certificados para brindar la mejor atención a tus seres queridos cuando más lo necesitan.
                        </p>
                        <Button 
                            onClick={handleRequestCare}
                            className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-full h-14 px-8 font-bold text-base shadow-lg transition-transform hover:scale-105"
                        >
                            Solicitar Asistencia
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>

                    <div className="relative z-10 hidden md:block">
                        <div className="w-48 h-48 bg-white/10 rounded-[2rem] backdrop-blur-sm border border-white/20 p-6 flex flex-col justify-center items-center shadow-2xl rotate-3">
                            <PhoneCall className="w-16 h-16 text-white mb-4" />
                            <div className="font-bold text-lg">Asistencia 24/7</div>
                            <div className="text-emerald-100 text-sm text-center mt-2">Cobertura total en servicios de cuidado</div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Signos Vitales (Simulado) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <HeartPulse className="w-6 h-6 text-rose-500" />
                                Últimos Signos Vitales
                            </h3>
                            <Button variant="ghost" size="sm" className="text-medical-500 hover:bg-medical-50 dark:hover:bg-medical-500/10 rounded-full">
                                <Plus className="w-4 h-4 mr-1" /> Registrar
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-rose-100 dark:bg-rose-500/20 p-2.5 rounded-xl">
                                        <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium">Presión Arterial</div>
                                        <div className="font-bold text-lg text-slate-900 dark:text-white">120/80 <span className="text-xs text-slate-400 font-normal">mmHg</span></div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">Hoy 08:00 AM</div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-100 dark:bg-orange-500/20 p-2.5 rounded-xl">
                                        <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium">Temperatura</div>
                                        <div className="font-bold text-lg text-slate-900 dark:text-white">36.5 <span className="text-xs text-slate-400 font-normal">°C</span></div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">Ayer 20:30 PM</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Medicamentos Activos (Simulado) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-6 sm:p-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Pill className="w-6 h-6 text-medical-500" />
                                Medicación Actual
                            </h3>
                            <Button variant="ghost" size="sm" className="text-medical-500 hover:bg-medical-50 dark:hover:bg-medical-500/10 rounded-full">
                                <Plus className="w-4 h-4 mr-1" /> Añadir
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="group border border-slate-100 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-800 bg-white dark:bg-slate-900 p-5 rounded-2xl transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">Losartán</h4>
                                        <p className="text-sm text-slate-500">50 mg • Tableta</p>
                                    </div>
                                    <div className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                        <CalendarClock className="w-3.5 h-3.5" />
                                        Cada 12 hrs
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <div className="h-2 flex-1 bg-emerald-500 rounded-full" />
                                    <div className="h-2 flex-1 bg-emerald-500 rounded-full" />
                                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">Próxima toma: 20:00 hrs</p>
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </div>
    );
}
