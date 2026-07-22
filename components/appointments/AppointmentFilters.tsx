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

  const tabsTriggerClasses = "rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#1a1a1a] dark:data-[state=active]:text-white transition-all duration-200";

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col xl:flex-row gap-6 items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
 
      {/* Pestañas de Estado */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full xl:w-auto flex-1">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100/50 dark:bg-[#111]/50 rounded-2xl h-14 p-1.5 transition-colors duration-300">
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder', { defaultValue: 'Buscar especialista...' })}
            className="pl-11 rounded-xl bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white border-transparent hover:border-gray-200 dark:hover:border-gray-700 h-12 text-sm focus-visible:ring-1 focus-visible:border-transparent focus-visible:ring-teal-500 transition-all duration-300 placeholder:text-gray-400"
          />
        </div>

        {/* Selector de Orden */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white border-transparent hover:border-gray-200 dark:hover:border-gray-700 h-12 text-sm font-medium focus:ring-1 focus:ring-offset-0 focus:ring-teal-500 transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
            <SelectItem value="date" className="text-sm rounded-lg focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer">{t('sort_date', { defaultValue: 'Por Fecha' })}</SelectItem>
            <SelectItem value="provider" className="text-sm rounded-lg focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer">{t('sort_provider', { defaultValue: 'Por Doctor' })}</SelectItem>
          </SelectContent>
        </Select>
 </div>

 </div>
 );
}