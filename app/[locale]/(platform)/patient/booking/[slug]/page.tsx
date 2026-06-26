"use client"
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, ChevronLeft, ChevronRight, CalendarX2,
  Calendar as CalendarIcon, Loader2, MapPin, Truck, Zap, GraduationCap, Package, Store
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useBookingStore } from "@/hooks/useBookingStore";
import { useAvailability } from "@/hooks/useAvailability";
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
import { CalendarDay } from "@/components/booking/CalendarDay";
import { TimeSlot } from "@/components/booking/TimeSlot";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { PatientSelector } from "@/components/booking/PatientSelector";
import { CheckoutModal } from "@/components/store/CheckoutModal";

import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays, isSameMonth, isBefore, startOfDay
} from "date-fns";
import { es } from "date-fns/locale";

export default function BookingPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const t = useTranslations('PatientBooking');

  const { cart, providerId, providerName, providerColor, dependentId, getTotalPrice, getTotalDuration } = useBookingStore();
  const { availableSlots, isLoadingSlots, fetchAvailableSlots } = useAvailability();
  const { processCheckout, isProcessing } = useBookingCheckout();

  // --- ESTADOS DE AGENDAMIENTO ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // --- ESTADOS DE E-COMMERCE ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingSymptoms, setPendingSymptoms] = useState("");
  const [scheduleNow, setScheduleNow] = useState(true);

  // 🧠 CEREBRO DEL CHECKOUT HÍBRIDO
  const requiresScheduling = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
  const requiresShipping = cart.some(item => item.type === 'PRODUCT' && item.isDigital !== true);
  const needsPrescription = cart.some(item => item.type === 'PRODUCT' && item.requiresPrescription === true);
  const isOnlyDigital = !requiresScheduling && !requiresShipping;

  useEffect(() => {
    if (cart.length === 0 || !providerId) {
      router.replace(`/store/${slug}`);
    }
  }, [cart, providerId, router, slug]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
    if (providerId) {
      const locationId = 1; 
      fetchAvailableSlots(providerId, locationId, date, getTotalDuration());
    }
  };

  const handleCheckout = async (symptomsText: string, shippingAddress?: string, shareVaultAccess?: boolean) => {
    if (requiresScheduling && scheduleNow && (!selectedDate || !selectedTime)) {
      return; 
    }

    if (requiresShipping || needsPrescription) {
      setPendingSymptoms(symptomsText);
      setShowCheckoutModal(true);
    } else {
      if (providerId) {
        await processCheckout({
          providerId,
          selectedDate: (requiresScheduling && scheduleNow) ? selectedDate : null,
          selectedTime: (requiresScheduling && scheduleNow) ? selectedTime : null,
          cart,
          dependentId: (requiresScheduling && scheduleNow) ? dependentId : undefined, 
          consumerSymptoms: symptomsText,
          scheduleNow: requiresScheduling ? scheduleNow : true,
          shareVaultAccess
        });
      }
    }
  };

  if (cart.length === 0 || !providerId) return null;

  const safeColor = providerColor || '#000000';
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

  let stepCounter = 1;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white pb-32 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">

      {/* Header Arquitectónico */}
      <div className="sticky top-0 z-40 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} /> RETORNAR AL DIRECTORIO
          </button>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('subtitle')}</p>
            <p className="font-bold text-sm uppercase tracking-wider" style={{ color: safeColor }}>{providerName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 flex flex-col lg:flex-row gap-12">

        <div className="flex-1 space-y-16">

          {/* 🚀 ESTADO: SOLO DIGITAL */}
          {isOnlyDigital && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center p-12 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
              <div className="w-16 h-16 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-4">Autorización de Acceso Inmediato</h2>
              <p className="text-[10px] text-gray-500 font-bold max-w-md leading-relaxed uppercase tracking-widest">
                EL CARRITO CONTIENE ÚNICAMENTE ACTIVOS DIGITALES. VERIFIQUE LA ORDEN A LA DERECHA Y PROCEDA A LA LIQUIDACIÓN PARA HABILITAR EL ACCESO EN SU BÓVEDA.
              </p>
            </motion.div>
          )}

          {/* 🩺 LÓGICA DE SERVICIOS (Calendario y Paciente) */}
          {requiresScheduling && (
            <>
              {/* Opción de Agendar Ahora o Comprar para Después */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                  <div 
                    className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 transition-colors"
                    style={{ backgroundColor: safeColor, color: '#ffffff' }}
                  >
                    <span className="font-bold text-sm">{stepCounter++}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">¿Qué deseas hacer?</h2>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-300 dark:border-gray-700 ml-0 md:ml-16" style={{ '--provider-color': safeColor } as React.CSSProperties}>
                  <button 
                    className={cn(
                      "p-6 flex items-center gap-4 transition-all duration-300 group",
                      !scheduleNow && "bg-white text-gray-500 dark:bg-[#0a0a0a] hover:-translate-y-1 hover:shadow-lg hover:[border-color:var(--provider-color)] hover:bg-gray-50 dark:hover:bg-[#111]"
                    )}
                    style={scheduleNow ? { backgroundColor: safeColor, color: '#ffffff' } : {}}
                    onClick={() => setScheduleNow(true)}
                  >
                    <div className={cn(
                        "w-10 h-10 flex items-center justify-center shrink-0 transition-colors",
                        scheduleNow ? "text-white" : "text-gray-500 group-hover:[color:var(--provider-color)]"
                    )}>
                        <CalendarIcon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest">Agendar Cita</h4>
                      <p className="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">Elegir fecha y pagar</p>
                    </div>
                  </button>
                  <button 
                    className={cn(
                      "p-6 flex items-center gap-4 transition-all duration-300 border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-700 group",
                      scheduleNow && "bg-white text-gray-500 dark:bg-[#0a0a0a] hover:-translate-y-1 hover:shadow-lg hover:[border-color:var(--provider-color)] hover:bg-gray-50 dark:hover:bg-[#111]"
                    )}
                    style={!scheduleNow ? { backgroundColor: safeColor, color: '#ffffff' } : {}}
                    onClick={() => setScheduleNow(false)}
                  >
                    <div className={cn(
                        "w-10 h-10 flex items-center justify-center shrink-0 transition-colors",
                        !scheduleNow ? "text-white" : "text-gray-500 group-hover:[color:var(--provider-color)]"
                    )}>
                        <Package className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest">Comprar para después</h4>
                      <p className="text-[9px] uppercase tracking-widest opacity-70 mt-0.5">Paga ahora, agenda cuando quieras</p>
                    </div>
                  </button>
                </div>
              </motion.section>

              {/* Step: Calendar */}
              <AnimatePresence>
                {scheduleNow && (
                  <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
                      <div 
                        className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 transition-colors"
                        style={{ backgroundColor: safeColor, color: '#ffffff' }}
                      >
                        <span className="font-bold text-sm">{stepCounter++}</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">{t('step_date')}</h2>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">DEFINA EL DÍA DE ATENCIÓN CLÍNICA.</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-12 ml-0 md:ml-16">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                          </div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
                            {format(currentMonth, "MMMM yyyy", { locale: es })}
                          </h3>
                        </div>
                        <div className="flex gap-0 border border-gray-300 dark:border-gray-700">
                          <button onClick={prevMonth} disabled={isBefore(currentMonth, startOfMonth(new Date()))} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] disabled:opacity-30 border-r border-gray-300 dark:border-gray-700 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                          </button>
                          <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                            <ChevronRight className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 mb-4">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
                        {calendarDays.map((date, i) => (
                          <div key={i} className="border-b border-r border-gray-200 dark:border-gray-800 p-1">
                             <CalendarDay date={date} isCurrentMonth={isSameMonth(date, monthStart)} isPast={isBefore(date, startOfDay(new Date()))} selectedDate={selectedDate} providerColor={safeColor} onSelect={handleDateSelect} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Step: Time Slots */}
              <AnimatePresence>
                {scheduleNow && selectedDate && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
                      <div 
                        className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 transition-colors"
                        style={{ backgroundColor: safeColor, color: '#ffffff' }}
                      >
                        <span className="font-bold text-sm">{stepCounter++}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">{t('step_time')}</h2>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</p>
                      </div>
                      <span 
                        className="border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                        style={{ backgroundColor: safeColor, color: '#ffffff' }}
                      >
                        <Clock className="w-3 h-3" strokeWidth={2} /> {duration} MIN
                      </span>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 md:p-12 ml-0 md:ml-16">
                        {isLoadingSlots ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-12 border-b border-r border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 animate-pulse" />)}
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {availableSlots.map((time) => (
                              <TimeSlot key={time} time={time} isSelected={selectedTime === time} providerColor={safeColor} onSelect={setSelectedTime} />
                            ))}
                          </div>
                        ) : (
                          <div className="py-16 flex flex-col items-center text-center border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]">
                            <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6"><CalendarX2 className="w-5 h-5 text-gray-400" strokeWidth={1.5} /></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">{t('no_slots')}</p>
                            <p className="text-xs text-gray-500 font-light">{t('select_date')}</p>
                          </div>
                        )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Step: Patient Selector */}
              <AnimatePresence>
                {scheduleNow && selectedTime && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-8">
                      <div 
                        className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 transition-colors"
                        style={{ backgroundColor: safeColor, color: '#ffffff' }}
                      >
                        <span className="font-bold text-sm">{stepCounter++}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white">Identidad Clínica</h2>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">ASIGNAR TITULAR O DEPENDIENTE PARA LA ATENCIÓN.</p>
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-12 ml-0 md:ml-16">
                        <PatientSelector />
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </>
          )}

        </div>

        {/* Summary Sidebar */}
        <BookingSummary
          cart={cart}
          total={total}
          providerColor={safeColor}
          selectedDate={requiresScheduling ? selectedDate : new Date()}
          selectedTime={requiresScheduling ? selectedTime : "00:00"}
          isProcessing={isProcessing}
          scheduleNow={scheduleNow}
          onCheckout={handleCheckout}
        />
      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        isProcessing={isProcessing}
        onConfirm={(shippingAddress, prescriptionUrls, pickupTime, destinationState) => {
          setShowCheckoutModal(false);
          if (providerId) {
            processCheckout({
              providerId,
              selectedDate: requiresScheduling ? selectedDate : null,
              selectedTime: requiresScheduling ? selectedTime : null,
              cart,
              dependentId: requiresScheduling ? dependentId : undefined,
              consumerSymptoms: pendingSymptoms,
              shippingAddress,
              prescriptionUrls,
              pickupTime,
              destinationState,
              scheduleNow: requiresScheduling ? scheduleNow : true,
              shareVaultAccess: true
            });
          }
        }}
      />
    </div>
  );
}