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

  // Lógica para mostrar el mensaje correcto dependiendo de si están buscando o viendo una pestaña vacía
  const getEmptyMessage = () => {
    if (searchQuery) return t('empty_search', { defaultValue: 'No se encontraron resultados' });
    if (activeTab === 'upcoming') return t('empty_upcoming', { defaultValue: 'No tienes citas próximas' });
    if (activeTab === 'past') return t('empty_past', { defaultValue: 'No tienes citas pasadas' });
    return t('empty_cancelled', { defaultValue: 'No tienes citas canceladas' });
  };

  const getEmptyHint = () => {
    if (searchQuery) return t('empty_search_hint', { defaultValue: 'Intenta usar otros términos o revisa la ortografía.' });
    return t('empty_hint', { defaultValue: 'Explora nuestro catálogo para encontrar a los mejores profesionales.' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
    >
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 dark:border-slate-700">
        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {getEmptyMessage()}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-light">
        {getEmptyHint()}
      </p>
      
      {!searchQuery && (
        <Button
          onClick={() => router.push('/discover')}
          className="bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('btn_find', { defaultValue: 'Buscar Especialistas' })}
        </Button>
      )}
    </motion.div>
  );
}