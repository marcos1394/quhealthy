import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Share2, Printer, Syringe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamily } from '@/hooks/useFamily';
import { vaccinationService } from '@/services/vaccination.service';
import { VaccinationStatusDto } from '@/types/vaccination';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface DigitalVaccinationCardProps {
    memberId: number;
}

export function DigitalVaccinationCard({ memberId }: DigitalVaccinationCardProps) {
    const { family } = useFamily();
    const [vaccines, setVaccines] = useState<VaccinationStatusDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const member = family?.find(f => f.id === memberId);

    useEffect(() => {
        if (!memberId) return;
        setIsLoading(true);
        vaccinationService.getVaccinations(memberId)
            .then(data => setVaccines(data))
            .catch(err => console.error("Error fetching vaccines for card", err))
            .finally(() => setIsLoading(false));
    }, [memberId]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Cartilla de Vacunación - ${member?.firstName}`,
                    text: 'Aquí está mi cartilla de vacunación digital.',
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error al compartir", err);
            }
        } else {
            alert('Compartir no está soportado en este navegador.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <QhSpinner size="md" />
            </div>
        );
    }

    if (!member) return null;

    const appliedVaccines = vaccines.filter(v => v.isApplied);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-sky-100 dark:border-sky-900 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none"
        >
            <div className="bg-sky-50 dark:bg-sky-900/20 p-6 md:p-8 border-b border-sky-100 dark:border-sky-800 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-8 h-8 text-sky-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cartilla Digital</h2>
                        <p className="text-sky-600 dark:text-sky-400 font-semibold">{member.firstName} {member.lastName}</p>
                    </div>
                </div>
                <div className="flex gap-2 print:hidden">
                    <Button variant="outline" size="icon" onClick={handlePrint} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Printer className="w-5 h-5 text-slate-500" />
                    </Button>
                    <Button variant="default" size="icon" onClick={handleShare} className="rounded-full bg-sky-500 hover:bg-sky-600 text-white">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Aplicadas</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{appliedVaccines.length}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl col-span-2 md:col-span-3 flex items-center gap-3">
                        <Syringe className="w-8 h-8 text-sky-300" />
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Este documento certifica el historial de vacunación registrado en el sistema.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        Historial de Dosis
                    </h3>
                    {appliedVaccines.length > 0 ? (
                        <div className="space-y-3">
                            {appliedVaccines.map((v, i) => (
                                <div key={i} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{v.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{v.diseasePrevented}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">Aplicada</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{v.appliedDate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <p className="text-slate-500 font-medium">Aún no hay vacunas registradas como aplicadas.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 p-4 text-center text-xs text-slate-400 font-medium border-t border-slate-100 dark:border-slate-900">
                Generado a través de QuHealthy &copy; {new Date().getFullYear()}
            </div>
        </motion.div>
    );
}
