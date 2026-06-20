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

  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col xl:flex-row gap-6 items-center justify-between">
      
      {/* Pestañas de Estado */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full xl:w-auto flex-1">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-gray-900 rounded-none h-12 p-1">
          <TabsTrigger 
            value="upcoming" 
            className="rounded-none text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors"
          >
            {t('tab_upcoming', { defaultValue: 'Próximas' })}
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="rounded-none text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors"
          >
            {t('tab_past', { defaultValue: 'Pasadas' })}
          </TabsTrigger>
          <TabsTrigger 
            value="cancelled" 
            className="rounded-none text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black transition-colors"
          >
            {t('tab_cancelled', { defaultValue: 'Canceladas' })}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder', { defaultValue: 'Buscar especialista...' })}
            className="pl-11 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
          />
        </div>

        {/* Selector de Orden */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
          <SelectTrigger className="w-full sm:w-48 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-[10px] font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 focus:border-black dark:focus:border-white">
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