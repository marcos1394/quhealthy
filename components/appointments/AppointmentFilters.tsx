"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Pestañas de Estado */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 transition-colors">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">
                {t('tab_upcoming', { defaultValue: 'Próximas' })}
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">
                {t('tab_past', { defaultValue: 'Pasadas' })}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all">
                {t('tab_cancelled', { defaultValue: 'Canceladas' })}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Barra de Búsqueda */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', { defaultValue: 'Buscar doctor o especialidad...' })}
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-colors focus-visible:ring-medical-500"
            />
          </div>

          {/* Selector de Orden */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortValue)}>
            <SelectTrigger className="w-full md:w-40 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white transition-colors focus:ring-medical-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="date">{t('sort_date', { defaultValue: 'Por Fecha' })}</SelectItem>
              <SelectItem value="provider">{t('sort_provider', { defaultValue: 'Por Doctor' })}</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </CardContent>
    </Card>
  );
}