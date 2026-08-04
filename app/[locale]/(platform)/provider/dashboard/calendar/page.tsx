"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Plus,
  Settings,
  Link as LinkIcon,
  CheckCircle2,
  RefreshCcw,
  CalendarDays,
  Sparkles,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { OperatingHoursModal } from "@/components/dashboard/OperatingHours";
import { TimeBlockModal } from "@/components/dashboard/TimeBlockModal";
import { useCalendarIntegration } from "@/hooks/useCalendarIntegration";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { useProviderLocations } from "@/hooks/useProviderLocations";
import { useStaff } from "@/hooks/useStaff";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

function CalendarLoading() {
  const t = useTranslations("DashboardCalendar");
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
      <QhSpinner size="lg" />
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
        {t("loading")}
      </p>
    </div>
  );
}

function CalendarContent() {
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasConfiguredHours, setHasConfiguredHours] = useState<boolean | null>(
    null
  );
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  const { isGoogleConnected, isCheckingGoogle, handleGoogleConnect } =
    useCalendarIntegration();
  const { fetchSchedules } = useOperatingHours();
  const { locations, fetchLocations, isLoading: isLoadingLocations } =
    useProviderLocations();
  const { staff, fetchStaff } = useStaff();
  const t = useTranslations("DashboardCalendar");

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    fetchLocations();
    fetchStaff();
  }, [fetchLocations, fetchStaff]);

  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      const mainLocation =
        locations.find((location) => location.isMain) || locations[0];
      setSelectedLocationId(mainLocation.id);
    }
  }, [locations, selectedLocationId]);

  useEffect(() => {
    const status = searchParams.get("calendar_status");
    const code = searchParams.get("code");

    if (status === "error") {
      toast.error(
        code === "AUTH_FAILED" ? t("toast_auth_failed") : t("toast_auth_error")
      );
      router.replace("/provider/dashboard/calendar", { scroll: false });
    } else if (status === "success") {
      toast.success(t("toast_auth_success"));
      router.replace("/provider/dashboard/calendar", { scroll: false });
    }
  }, [searchParams, router, t]);

  useEffect(() => {
    const loadHours = async () => {
      if (!selectedLocationId) return;
      const data = await fetchSchedules(selectedLocationId, selectedStaffId || undefined);
      setHasConfiguredHours(data.length > 0 && data.some((d) => d.isActive));
    };
    loadHours();
  }, [fetchSchedules, refreshKey, selectedLocationId, selectedStaffId]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <CalendarDays className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            {/* SELECTOR DE SEDE */}
            <div className="w-full sm:w-64">
              <Select
                value={selectedLocationId?.toString()}
                onValueChange={(value) => setSelectedLocationId(Number(value))}
                disabled={isLoadingLocations || locations.length === 0}
              >
                <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm font-bold text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                    <SelectValue placeholder="Seleccionar Sede" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg z-50">
                  {locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                      className="text-xs font-bold cursor-pointer rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                    >
                      {location.name} {location.isMain ? "(Principal)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SELECTOR DE STAFF (Opcional) */}
            <div className="w-full sm:w-64">
              <Select
                value={selectedStaffId ? selectedStaffId.toString() : "all"}
                onValueChange={(value) => setSelectedStaffId(value === "all" ? null : Number(value))}
                disabled={staff.length === 0}
              >
                <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm font-bold text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <SelectValue placeholder="General (Todos)" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg z-50">
                  <SelectItem value="all" className="text-xs font-bold cursor-pointer rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30">
                    General (Todos)
                  </SelectItem>
                  {staff.map((member) => (
                    <SelectItem
                      key={member.id}
                      value={member.id.toString()}
                      className="text-xs font-bold cursor-pointer rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                    >
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsHoursModalOpen(true)}
              disabled={!selectedLocationId}
              className="w-full sm:w-auto rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all h-11 px-5 shadow-sm flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("operating_hours")}</span>
            </Button>

            <Button
              onClick={() => setIsBlockModalOpen(true)}
              disabled={!selectedLocationId}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{t("block_time")}</span>
            </Button>
          </div>
        </div>

        {/* ── ALERTA DE HORARIOS NO CONFIGURADOS ──────────────────────── */}
        <AnimatePresence>
          {hasConfiguredHours === false && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-amber-200/80 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/40 shadow-sm">
                    <AlertCircle className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 dark:text-amber-300 mb-0.5">
                      {t("missing_hours_title")}
                    </h3>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-400/80 max-w-2xl leading-relaxed">
                      {t("missing_hours_desc")}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsHoursModalOpen(true)}
                  className="w-full md:w-auto rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold h-11 px-5 border-0 shadow-sm shrink-0 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_configure_hours")}</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BANNER DE INTEGRACIÓN GOOGLE ────────────────────────────── */}
        <AnimatePresence>
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-[#0a0a0a]">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505] shadow-sm flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z"
                    />
                    <path fill="#1666D5" d="M3 10.5v12h42v-12H3z" />
                    <path fill="#E8EAED" d="M3 10.5h42V20H3z" />
                    <text
                      x="24"
                      y="34"
                      fill="#1666D5"
                      fontFamily="Arial"
                      fontSize="16"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      31
                    </text>
                    <path fill="#EA4335" d="M9.5 4h5v9h-5z" />
                    <path fill="#FBBC04" d="M33.5 4h5v9h-5z" />
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {t("sync_title")}
                    </h3>
                    {isGoogleConnected ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                        {t("sync_active")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 rounded-full shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        {t("sync_recommended")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                    {isGoogleConnected
                      ? t("sync_connected_desc")
                      : t("sync_disconnected_desc")}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                {isCheckingGoogle ? (
                  <div className="h-11 w-44 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                ) : isGoogleConnected ? (
                  <Button
                    variant="outline"
                    className="w-full md:w-auto rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all h-11 px-5 shadow-sm flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" strokeWidth={2} />
                    <span>{t("settings")}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleGoogleConnect}
                    className="w-full md:w-auto rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 text-xs font-bold transition-all h-11 px-5 shadow-sm border-0 flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" strokeWidth={2} />
                    <span>{t("connect_google")}</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── ÁREA DEL CALENDARIO ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-all">
          <div className="w-full relative p-4 sm:p-6 flex flex-col">
            {selectedLocationId ? (
              <CalendarView
                key={`${refreshKey}-${selectedLocationId}`}
                locationId={selectedLocationId}
              />
            ) : (
              <div className="min-h-[50vh] flex items-center justify-center">
                <QhSpinner size="lg" />
              </div>
            )}
          </div>
        </div>

        {/* ── MÉTRICAS DE ESTADO OPERATIVO ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: t("metrics.operating_hours"),
              value: t("metrics.configured"),
              icon: Clock,
            },
            {
              label: t("metrics.sync"),
              value: isGoogleConnected
                ? t("metrics.real_time")
                : t("metrics.manual"),
              icon: RefreshCcw,
            },
            {
              label: t("metrics.booking_engine"),
              value: t("metrics.active"),
              icon: Sparkles,
            },
          ].map((metric, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[150px] shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <metric.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {metric.label}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── MODALES OPERATIVOS ───────────────────────────────────────── */}
        {selectedLocationId && (
          <OperatingHoursModal
            isOpen={isHoursModalOpen}
            onClose={() => setIsHoursModalOpen(false)}
            onSaveSuccess={() => setRefreshKey((p) => p + 1)}
            locationId={selectedLocationId}
            staffId={selectedStaffId}
            staffName={staff.find(s => s.id === selectedStaffId)?.name}
          />
        )}
        <TimeBlockModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onSaveSuccess={() => setRefreshKey((p) => p + 1)}
        />

      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarContent />
    </Suspense>
  );
}