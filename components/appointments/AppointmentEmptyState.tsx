"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabValue } from './AppointmentFilters';

interface AppointmentEmptyStateProps {
 activeTab: TabValue;
 searchQuery: string;
}

export function AppointmentEmptyState({ activeTab, searchQuery }: AppointmentEmptyStateProps) {
 const router = useRouter();
 const t = useTranslations('PatientAppointments');

 const getEmptyMessage = () => {
 if (searchQuery) return t('empty_search', { defaultValue: 'Resultados no encontrados' });
 if (activeTab === 'upcoming') return t('empty_upcoming', { defaultValue: 'Sin Citas Próximas' });
 if (activeTab === 'past') return t('empty_past', { defaultValue: 'Sin Citas Pasadas' });
 return t('empty_cancelled', { defaultValue: 'Sin Citas Canceladas' });
 };

 const getEmptyHint = () => {
 if (searchQuery) return t('empty_search_hint', { defaultValue: 'Intenta modificar tus términos de búsqueda o revisar la ortografía.' });
 return t('empty_hint', { defaultValue: 'Explora el catálogo de especialistas para agendar tu próxima valoración médica.' });
 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-4 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 transition-colors"
    >
      <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-6">
        <Calendar className="w-7 h-7 text-teal-600 dark:text-teal-400" strokeWidth={2} />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center tracking-tight">
        {getEmptyMessage()}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm text-center leading-relaxed">
        {getEmptyHint()}
      </p>
      
      {!searchQuery && (
        <Button
          onClick={() => router.push('/discover')}
          className="rounded-xl bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 h-12 px-8 text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          {t('btn_find', { defaultValue: 'Agendar Consulta' })}
        </Button>
      )}
    </motion.div>
  );
}