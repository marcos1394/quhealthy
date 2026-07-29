"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TabValue = "upcoming" | "past" | "cancelled";
export type SortValue = "date" | "provider";

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
  setSortBy,
}: AppointmentFiltersProps) {
  const t = useTranslations("PatientAppointments");

  const tabsTriggerClasses =
    "rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 h-10";

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col xl:flex-row gap-4 items-center justify-between shadow-sm font-sans transition-colors duration-500">
      {/* Pestañas de Estado */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="w-full xl:w-auto flex-1"
      >
        <TabsList className="w-full grid grid-cols-3 bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800/80 rounded-2xl h-12 p-1 transition-colors duration-300">
          <TabsTrigger value="upcoming" className={tabsTriggerClasses}>
            {t("tab_upcoming")}
          </TabsTrigger>
          <TabsTrigger value="past" className={tabsTriggerClasses}>
            {t("tab_past")}
          </TabsTrigger>
          <TabsTrigger value="cancelled" className={tabsTriggerClasses}>
            {t("tab_cancelled")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
        {/* Barra de Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="pl-10 h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 text-xs font-semibold focus-visible:ring-emerald-500/20 shadow-sm transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Selector de Orden */}
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortValue)}
        >
          <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 text-xs font-semibold focus:ring-emerald-500/20 shadow-sm transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl p-1">
            <SelectItem
              value="date"
              className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer"
            >
              {t("sort_date")}
            </SelectItem>
            <SelectItem
              value="provider"
              className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-600 dark:focus:text-emerald-400 cursor-pointer"
            >
              {t("sort_provider")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}