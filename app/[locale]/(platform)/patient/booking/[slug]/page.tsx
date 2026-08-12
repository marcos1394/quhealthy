"use client";

/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarX2,
  Calendar as CalendarIcon,
  GraduationCap,
  Package,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { useBookingStore } from "@/hooks/useBookingStore";
import { useAvailability } from "@/hooks/useAvailability";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { CalendarDay } from "@/components/booking/CalendarDay";
import { TimeSlot } from "@/components/booking/TimeSlot";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { PatientSelector } from "@/components/booking/PatientSelector";
import { ProfessionalSelector } from "@/components/booking/ProfessionalSelector";
import { LocationSelector } from "@/components/booking/LocationSelector";
import { ServiceCheckoutModal } from "@/components/booking/ServiceCheckoutModal";
import { ActiveCreditsBanner } from "@/components/packages/ActiveCreditsBanner";
import { PackageMultiScheduler } from "@/components/booking/PackageMultiScheduler";
import { useStorefront } from "@/hooks/useStorefront";
import { StorefrontItem } from "@/types/storefront";

import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isBefore,
  startOfDay,
} from "date-fns";
import { es, enUS } from "date-fns/locale";

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : "5 150 105";
};

export default function BookingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const t = useTranslations("PatientBooking");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;

  const {
    cart,
    dependentId,
    getTotalPrice,
    getTotalDuration,
    setProvider,
    addToCart,
  } = useBookingStore();
  const { availableSlots, isLoadingSlots, fetchAvailableSlots, monthAvailability, fetchMonthAvailability, isLoadingMonth } =
    useAvailability();
  const { processCheckout, isProcessing } = useBookingCheckout();

  const searchParams = useSearchParams();
  const serviceIdParam = searchParams?.get("serviceId");

  // Storefront para obtener información del servicio si es necesario
  const { store, isLoading: isStoreLoading } = useStorefront(slug);

  // Derivar datos del proveedor desde el store del storefront
  const providerId = store?.providerId;
  const providerName = store?.displayName || "Proveedor";
  const providerColor = store?.primaryColor;

  // --- ESTADOS DE AGENDAMIENTO ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  // --- ESTADOS DE E-COMMERCE ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingSymptoms, setPendingSymptoms] = useState("");
  const [scheduleNow, setScheduleNow] = useState(true);

  // 🧠 LÓGICA DEL CHECKOUT HÍBRIDO
  const requiresScheduling = cart.some(
    (item) =>
      item.type === "SERVICE" ||
      (item.type === "PACKAGE" &&
        item.packageContents?.some((sub) => sub.type === "SERVICE"))
  );

  const requiresShipping = cart.some(
    (item) =>
      (item.type === "PRODUCT" && item.isDigital !== true) ||
      (item.type === "PACKAGE" &&
        item.packageContents?.some(
          (sub) => sub.type === "PRODUCT" && sub.isDigital !== true
        ))
  );

  const needsPrescription = cart.some(
    (item) =>
      (item.type === "PRODUCT" && item.requiresPrescription === true) ||
      (item.type === "PACKAGE" &&
        item.packageContents?.some((sub) => sub.requiresPrescription === true))
  );

  const isOnlyDigital = !requiresScheduling && !requiresShipping;
  const isPackageMultiSchedule = cart.some(
    (item) =>
      item.type === "PACKAGE" &&
      item.packageContents?.some((sub) => sub.type === "SERVICE")
  );

  // Filtrar profesionales que pueden realizar los servicios
  const cartServiceIds = cart.filter(item => item.type === "SERVICE").map(item => item.id);
  const relevantStaff = store?.staff?.filter(member => {
    if (!member.assignedServices || member.assignedServices.length === 0) return false;
    return cartServiceIds.every(id => member.assignedServices?.some(as => as.catalogItemId === id));
  }) || [];

  // ESTADO PARA AGENDAMIENTO MÚLTIPLE DE PAQUETES
  const [scheduledPackageServices, setScheduledPackageServices] = useState<
    Record<number, { date: Date; time: string }>
  >({});

  // Agendar un servicio individual de un paquete
  const handleSchedulePackageService = (
    serviceId: number,
    date: Date | null,
    time: string | null
  ) => {
    setScheduledPackageServices((prev) => {
      if (!date || !time) {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      }
      return {
        ...prev,
        [serviceId]: { date, time },
      };
    });
  };

  // LÓGICA DE DISPONIBILIDAD MENSUAL
  useEffect(() => {
    if (providerId) {
      const currentMonthStart = startOfMonth(currentMonth);
      const currentMonthEnd = endOfMonth(currentMonth);
      fetchMonthAvailability(
        providerId,
        selectedLocationId || undefined,
        currentMonthStart,
        currentMonthEnd,
        getTotalDuration(),
        selectedStaffId || undefined
      );
    }
  }, [providerId, selectedLocationId, currentMonth, getTotalDuration, selectedStaffId, fetchMonthAvailability]);

  const nextAvailableSlot = useMemo(() => {
    if (!monthAvailability || Object.keys(monthAvailability).length === 0) return null;
    const sortedDates = Object.keys(monthAvailability).sort();
    
    for (const dateStr of sortedDates) {
      const parts = dateStr.split("-");
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      if (!isBefore(dateObj, startOfDay(new Date()))) {
        const slots = monthAvailability[dateStr];
        if (slots && slots.length > 0) {
          return { date: dateObj, time: slots.sort()[0] };
        }
      }
    }
    return null;
  }, [monthAvailability]);

  // LÓGICA DE AUTO-RESERVA
  useEffect(() => {
    if (cart.length === 0 && serviceIdParam && store && !isStoreLoading) {
      const serviceIdNum = Number(serviceIdParam);
      const serviceToBook = store.services?.find(
        (s: StorefrontItem) => s.id === serviceIdNum
      );
      if (serviceToBook) {
        setProvider(
          store.providerId,
          slug,
          store.displayName,
          store.primaryColor || "#059669"
        );
        addToCart(serviceToBook, slug, store.displayName, store.primaryColor || "#059669");
      }
    }
  }, [
    cart.length,
    serviceIdParam,
    store,
    isStoreLoading,
    setProvider,
    addToCart,
    slug,
  ]);

  useEffect(() => {
    if (cart.length === 0 && !serviceIdParam && !providerId) {
      router.replace(`/store/${slug}`);
    }
  }, [cart, providerId, router, slug, serviceIdParam]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
    if (providerId) {
      fetchAvailableSlots(providerId, selectedLocationId || undefined, date, getTotalDuration(), selectedStaffId || undefined);
    }
  };

  const handleCheckout = async (
    symptomsText: string,
    shippingAddress?: string,
    shareVaultAccess?: boolean,
    allowedDocumentIds?: string[],
    paymentMethod?: string
  ) => {
    // Validar si requiere cita simple
    if (
      requiresScheduling &&
      scheduleNow &&
      !isPackageMultiSchedule &&
      (!selectedDate || !selectedTime)
    ) {
      return;
    }

    if (requiresShipping || needsPrescription) {
      setPendingSymptoms(symptomsText);
      setShowCheckoutModal(true);
    } else {
      if (providerId) {
        await processCheckout({
          providerId: providerId,
          locationId: selectedLocationId || undefined,
          staffId: selectedStaffId || undefined,
          selectedDate:
            requiresScheduling && scheduleNow && !isPackageMultiSchedule
              ? selectedDate
              : null,
          selectedTime:
            requiresScheduling && scheduleNow && !isPackageMultiSchedule
              ? selectedTime
              : null,
          scheduledPackageServices,
          cart,
          dependentId:
            requiresScheduling && scheduleNow ? dependentId : undefined,
          consumerSymptoms: symptomsText,
          scheduleNow: requiresScheduling ? scheduleNow : true,
          shareVaultAccess,
          allowedDocumentIds,
          paymentMethod,
        });
      }
    }
  };

  if ((cart.length === 0 && serviceIdParam) || isStoreLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("preparing_booking")}
        </p>
      </div>
    );
  }

  if (cart.length === 0 || !providerId) return null;

  const safeColor = providerColor || "#059669";
  const total = getTotalPrice();
  const duration = getTotalDuration();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const weekdaysList: string[] = t.raw("weekdays");
  let stepCounter = 1;

  return (
    <div 
      className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white pb-32 font-sans selection:bg-store-100 dark:selection:bg-store-950/30 transition-colors duration-500"
      style={{ 
        "--theme-color": safeColor, 
        "--theme-rgb": hexToRgb(safeColor) 
      } as React.CSSProperties}
    >
      
      {/* ── HEADER ARQUITECTÓNICO HOMOLOGADO ───────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>{t("back_to_directory")}</span>
          </button>
          
          <div className="text-right">
            <p className="text-[11px] font-semibold text-gray-400">
              {t("subtitle")}
            </p>
            <p
              className="font-bold text-sm tracking-tight"
              style={{ color: safeColor }}
            >
              {providerName}
            </p>
          </div>
        </div>
      </div>

      <ActiveCreditsBanner
        providerId={providerId}
        brandColor={safeColor}
        isBookingView={true}
      />

      <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-12">
          
          {/* 🚀 ESTADO: SOLO DIGITAL */}
          {isOnlyDigital && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center p-8 sm:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-store-50 dark:bg-store-950/30 border border-store-100 dark:border-store-900/40 text-store-600 dark:text-store-400 flex items-center justify-center mb-4 shadow-sm">
                <GraduationCap className="w-7 h-7" strokeWidth={2} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                {t("digital_content_title")}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                {t("digital_content_desc")}
              </p>
            </motion.div>
          )}

          {/* 🩺 LÓGICA DE SERVICIOS (Calendario y Paciente) */}
          {requiresScheduling && (
            <>
              {/* Opción de Agendar Ahora o Comprar para Después */}
              {!serviceIdParam && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"
                      style={{ backgroundColor: safeColor, color: "#ffffff" }}
                    >
                      {stepCounter++}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        {t("action_selection_title")}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      className={cn(
                        "p-6 rounded-2xl border flex items-center gap-4 transition-all duration-300 text-left shadow-sm",
                        scheduleNow
                          ? "border-store-500/40 bg-store-50/50 dark:bg-store-950/20 text-gray-900 dark:text-white ring-2 ring-store-500/20"
                          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
                      )}
                      onClick={() => setScheduleNow(true)}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          scheduleNow
                            ? "bg-store-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        <CalendarIcon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                          {t("schedule_now_title")}
                        </h4>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          {t("schedule_now_desc")}
                        </p>
                      </div>
                    </button>

                    <button
                      className={cn(
                        "p-6 rounded-2xl border flex items-center gap-4 transition-all duration-300 text-left shadow-sm",
                        !scheduleNow
                          ? "border-store-500/40 bg-store-50/50 dark:bg-store-950/20 text-gray-900 dark:text-white ring-2 ring-store-500/20"
                          : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
                      )}
                      onClick={() => setScheduleNow(false)}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          !scheduleNow
                            ? "bg-store-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        <Package className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                          {t("buy_for_later_title")}
                        </h4>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          {t("buy_for_later_desc")}
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.section>
              )}

              {/* Paso: Selección de Ubicación (Si hay más de 1) */}
              <AnimatePresence>
                {scheduleNow && (store?.locations || []).length > 1 && (
                  <LocationSelector
                    locations={store?.locations || []}
                    selectedLocationId={selectedLocationId}
                    onSelect={(id) => {
                      setSelectedLocationId(id);
                      setSelectedDate(null);
                      setSelectedTime(null);
                    }}
                    safeColor={safeColor}
                    stepCounter={stepCounter++}
                    title={t("location_selector_title") || "Ubicación"}
                    subtitle={t("location_selector_desc") || "¿Dónde te gustaría atenderte?"}
                  />
                )}
              </AnimatePresence>

              {/* Paso: Selección de Profesional (Si hay más de 1 que puede dar el servicio) */}
              <AnimatePresence>
                {scheduleNow && relevantStaff.length > 0 && (
                  <ProfessionalSelector
                    staff={relevantStaff}
                    selectedStaffId={selectedStaffId}
                    onSelect={(id) => {
                       setSelectedStaffId(id);
                       setSelectedDate(null);
                       setSelectedTime(null);
                    }}
                    safeColor={safeColor}
                    stepCounter={stepCounter++}
                    title={t("step_professional") || "Selecciona un Profesional"}
                    subtitle={t("step_professional_desc") || "Elige con quién deseas atenderte"}
                    noPreferenceText={t("no_preference") || "Cualquiera disponible"}
                  />
                )}
              </AnimatePresence>

              {/* Paso: Agendamiento Múltiple de Paquetes */}
              <AnimatePresence>
                {scheduleNow && isPackageMultiSchedule && (
                  <PackageMultiScheduler
                    cart={cart}
                    providerId={selectedStaffId || providerId}
                    providerColor={safeColor}
                    onSchedulePackageService={handleSchedulePackageService}
                    stepCounterStart={stepCounter++}
                    scheduledPackageServices={scheduledPackageServices}
                  />
                )}
              </AnimatePresence>

              {/* Paso: Calendario de Citas Directo */}
              <AnimatePresence>
                {scheduleNow && !isPackageMultiSchedule && (
                  <motion.section
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"
                          style={{
                            backgroundColor: safeColor,
                            color: "#ffffff",
                          }}
                        >
                          {stepCounter++}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                            {t("date_time_title")}
                          </h2>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                            {t("date_time_subtitle")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                      {/* Cabecera del Mes */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <CalendarIcon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <h3 className="text-base font-bold capitalize tracking-tight text-gray-900 dark:text-white">
                            {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#111] p-1 rounded-xl border border-gray-100 dark:border-gray-800">
                          <button
                            onClick={prevMonth}
                            disabled={isBefore(
                              currentMonth,
                              startOfMonth(new Date())
                            )}
                            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-[#222] disabled:opacity-30 transition-colors shadow-sm"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" strokeWidth={2} />
                          </button>
                          <button
                            onClick={nextMonth}
                            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors shadow-sm"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      {/* Recomendación de próximo espacio */}
                      {nextAvailableSlot && !selectedDate && (
                        <div className="mb-6 p-4 rounded-2xl border border-store-200 bg-store-50 dark:bg-store-950/20 dark:border-store-900/40 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-store-100 dark:bg-store-900/50 flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-5 h-5 text-store-600 dark:text-store-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              Próximo espacio disponible
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-3">
                              {format(nextAvailableSlot.date, locale === "en" ? "EEEE, MMMM d" : "EEEE, d 'de' MMMM", { locale: dateLocale })} a las {nextAvailableSlot.time}
                            </p>
                            <button
                              onClick={() => {
                                handleDateSelect(nextAvailableSlot.date);
                                setSelectedTime(nextAvailableSlot.time);
                              }}
                              className="text-xs font-bold text-store-700 dark:text-store-400 bg-store-200 dark:bg-store-900/60 px-3 py-1.5 rounded-lg hover:bg-store-300 dark:hover:bg-store-800 transition-colors"
                            >
                              Seleccionar este horario
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Días de la Semana */}
                      <div className="grid grid-cols-7 mb-3 text-center">
                        {weekdaysList.map((d, idx) => (
                          <div
                            key={idx}
                            className="text-xs font-bold text-gray-400 uppercase tracking-wider"
                          >
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Cuadrícula de Días */}
                      <div className="grid grid-cols-7 gap-1.5">
                        {calendarDays.map((date, i) => {
                          const dateStr = format(date, "yyyy-MM-dd");
                          const hasSlots = monthAvailability ? Boolean(monthAvailability[dateStr]?.length > 0) : false;
                          return (
                            <CalendarDay
                              key={i}
                              date={date}
                              isCurrentMonth={isSameMonth(date, monthStart)}
                              isPast={isBefore(date, startOfDay(new Date()))}
                              selectedDate={selectedDate}
                              providerColor={safeColor}
                              onSelect={handleDateSelect}
                              hasSlots={hasSlots}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Paso: Horarios Disponibles */}
              <AnimatePresence>
                {scheduleNow && !isPackageMultiSchedule && selectedDate && (
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"
                        style={{ backgroundColor: safeColor, color: "#ffffff" }}
                      >
                        {stepCounter++}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                          {t("step_time")}
                        </h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                          {format(
                            selectedDate,
                            locale === "en" ? "EEEE, MMMM d" : "EEEE, d 'de' MMMM",
                            { locale: dateLocale }
                          )}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-store-50 text-store-700 dark:bg-store-950/30 dark:text-store-400 border border-store-200 dark:border-store-900/40 text-[11px] font-bold shadow-sm">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{t("duration_min", { minutes: duration })}</span>
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                      {isLoadingSlots ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                              key={i}
                              className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800/50 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {availableSlots.map((time) => (
                            <TimeSlot
                              key={time}
                              time={time}
                              isSelected={selectedTime === time}
                              providerColor={safeColor}
                              onSelect={setSelectedTime}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                            <CalendarX2 className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {t("no_slots")}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {t("select_date")}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Paso: Selección de Paciente */}
              <AnimatePresence>
                {scheduleNow && (isPackageMultiSchedule || selectedTime) && (
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"
                        style={{ backgroundColor: safeColor, color: "#ffffff" }}
                      >
                        {stepCounter++}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                          {t("step_patient_title")}
                        </h2>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          {t("step_patient_desc")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
                      <PatientSelector />
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Resumen Lateral de la Orden */}
        <BookingSummary
          cart={cart}
          total={total}
          providerColor={safeColor}
          selectedDate={
            isPackageMultiSchedule
              ? new Date()
              : requiresScheduling
                ? selectedDate
                : new Date()
          }
          selectedTime={
            isPackageMultiSchedule
              ? "00:00"
              : requiresScheduling
                ? selectedTime
                : "00:00"
          }
          isProcessing={isProcessing}
          scheduleNow={scheduleNow}
          onCheckout={handleCheckout}
        />
      </div>

      <ServiceCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        totalAmount={getTotalPrice()}
        onProcessCheckout={async (payload) => {
          if (providerId) {
            await processCheckout({
              providerId,
              scheduleNow: true,
              selectedDate: selectedDate,
              selectedTime,
              locationId: selectedLocationId || undefined,
              staffId: selectedStaffId || undefined,
              dependentId: dependentId || undefined,
              cart,
              shareVaultAccess: payload.shareVaultAccess,
              allowedDocumentIds: undefined, // Or pass it if you add it back to modal
              consumerSymptoms: payload.consumerSymptoms,
              paymentMethod: payload.paymentMethod,
            });
          }
          setShowCheckoutModal(false);
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
}