"use client"
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Share2, Printer, Syringe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamily } from '@/hooks/useFamily';
import { vaccinationService } from '@/services/vaccination.service';
import { VaccinationStatusDto } from '@/types/vaccination';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

interface DigitalVaccinationCardProps {
 memberId: number;
 hideHeader?: boolean;
}

export function DigitalVaccinationCard({ memberId, hideHeader }: DigitalVaccinationCardProps) {
 const { family } = useFamily();
 const [vaccines, setVaccines] = useState<VaccinationStatusDto[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 const member = family?.find(f => f.id === memberId);

 const [prevMemberId, setPrevMemberId] = useState(memberId);
 if (memberId !== prevMemberId) {
 setPrevMemberId(memberId);
 setIsLoading(true);
 setVaccines([]);
 }

 useEffect(() => {
 if (!memberId) return;
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
  className={cn(
  "w-full max-w-2xl mx-auto bg-white dark:bg-[#0a0a0a] overflow-hidden print:shadow-none print:border-none",
  !hideHeader && "border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm"
  )}
  >
  {!hideHeader && (
  <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
  <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" strokeWidth={2} />
  </div>
  <div>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cartilla Digital</h2>
  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{member.firstName} {member.lastName}</p>
  </div>
  </div>
  <div className="flex gap-2 print:hidden">
  <Button
  variant="outline"
  size="icon"
  onClick={handlePrint}
  className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 hover:text-teal-600 dark:hover:bg-gray-700 transition-colors"
  >
  <Printer className="w-5 h-5" />
  </Button>
  <Button
  variant="outline"
  size="icon"
  onClick={handleShare}
  className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 hover:text-teal-600 dark:hover:bg-gray-700 transition-colors"
  >
  <Share2 className="w-5 h-5" />
  </Button>
  </div>
  </div>
  )}

  <div className="p-6 md:p-8 space-y-6">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4">
  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Aplicadas</p>
  <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{appliedVaccines.length}</p>
  </div>
  <div className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4 col-span-2 md:col-span-3 flex items-center gap-4">
  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
  <Syringe className="w-6 h-6 text-teal-500" strokeWidth={2} />
  </div>
  <div>
  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Este documento certifica el historial de vacunación registrado en el sistema y validado digitalmente.</p>
  </div>
  </div>
  </div>

  <div>
  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
  Historial de Dosis
  </h3>
  {appliedVaccines.length > 0 ? (
  <div className="space-y-3">
  {appliedVaccines.map((v, i) => (
  <div key={i} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm transition-all bg-white dark:bg-[#0a0a0a]">
  <div>
  <p className="font-bold text-gray-900 dark:text-white">{v.name}</p>
  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{v.diseasePrevented}</p>
  </div>
  <div className="text-right">
  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 mb-1">Aplicada</span>
  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{v.appliedDate}</p>
  </div>
  </div>
  ))}
  </div>
  ) : (
  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/20">
  <p className="text-gray-500 dark:text-gray-400 font-medium">Aún no hay vacunas registradas como aplicadas.</p>
  </div>
  )}
  </div>
  </div>
  
  <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 p-4 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
  Generado a través de QuHealthy &copy; {new Date().getFullYear()}
  </div>
  </motion.div>
 );
}