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
      className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] transition-colors"
    >
      <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center mb-6">
        <Calendar className="w-6 h-6 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2 text-center">
        {getEmptyMessage()}
      </h3>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 font-light mb-8 max-w-sm text-center leading-relaxed">
        {getEmptyHint()}
      </p>
      
      {!searchQuery && (
        <Button
          onClick={() => router.push('/discover')}
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
        >
          <Plus className="w-4 h-4 mr-3" strokeWidth={2} />
          {t('btn_find', { defaultValue: 'Agendar Consulta' })}
        </Button>
      )}
    </motion.div>
  );
}