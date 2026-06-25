"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type TabValue = 'upcoming' | 'past' | 'cancelled';
export type SortValue = 'date' | 'provider';

interface AppointmentFiltersProps {
  activeTab: TabValue;
  setActiveTab: (val: TabValue) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: SortValue;
  setSortBy: (val: SortValue) => void;
}

export function AppointmentFilters({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy
}: AppointmentFiltersProps) {
  const t = useTranslations('PatientAppointments');

  // Extraemos las clases del TabTrigger a una constante porque la inversión de estados activos/inactivos es compleja
  const tabsTriggerClasses = "rounded-none text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 dark:group-hover:text-gray-500 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black group-hover:data-[state=active]:bg-white group-hover:data-[state=active]:text-black dark:group-hover:data-[state=active]:bg-black dark:group-hover:data-[state=active]:text-white transition-colors duration-300";

  return (
    // CONTENEDOR PADRE: Agregamos group, z-index relativo, salto y sombra brutalista
    <div className="group relative z-0 hover:z-10 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col xl:flex-row gap-6 items-center justify-between transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]">
      
      {/* Pestañas de Estado */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full xl:w-auto flex-1">
        {/* TAB LIST: Invierte el color de fondo gris claro a gris oscuro para contrastar con el fondo negro nuevo */}
        <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-[#111] group-hover:bg-[#111] dark:group-hover:bg-gray-100 rounded-none h-12 p-1 transition-colors duration-300">
          <TabsTrigger value="upcoming" className={tabsTriggerClasses}>
            {t('tab_upcoming', { defaultValue: 'Próximas' })}
          </TabsTrigger>
          <TabsTrigger value="past" className={tabsTriggerClasses}>
            {t('tab_past', { defaultValue: 'Pasadas' })}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className={tabsTriggerClasses}>
            {t('tab_cancelled', { defaultValue: 'Canceladas' })}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:w-72">
          {/* ICONO: Invierte su contraste */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors duration-300" strokeWidth={1.5} />
          
          {/* INPUT: Fondo transparente en hover, borde invertido, placeholder dinámico */}
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder', { defaultValue: 'Buscar especialista...' })}
            className="pl-11 rounded-none bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent dark:group-hover:bg-transparent text-black dark:text-white group-hover:text-white dark:group-hover:text-black border-gray-200 dark:border-gray-800 group-hover:border-gray-700 dark:group-hover:border-gray-300 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white group-hover:focus-visible:border-white dark:group-hover:focus-visible:border-black transition-colors duration-300 placeholder:text-gray-400 group-hover:placeholder:text-gray-500 dark:group-hover:placeholder:text-gray-400"
          />
        </div>

        {/* Selector de Orden */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
          {/* TRIGGER: Misma lógica de inversión que el Input */}
          <SelectTrigger className="w-full sm:w-48 rounded-none bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent dark:group-hover:bg-transparent text-black dark:text-white group-hover:text-white dark:group-hover:text-black border-gray-200 dark:border-gray-800 group-hover:border-gray-700 dark:group-hover:border-gray-300 h-12 text-[10px] font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 focus:border-black dark:focus:border-white group-hover:focus:border-white dark:group-hover:focus:border-black transition-colors duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            <SelectItem value="date" className="text-[10px] font-bold uppercase tracking-widest focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">{t('sort_date', { defaultValue: 'Por Fecha' })}</SelectItem>
            <SelectItem value="provider" className="text-[10px] font-bold uppercase tracking-widest focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">{t('sort_provider', { defaultValue: 'Por Doctor' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}