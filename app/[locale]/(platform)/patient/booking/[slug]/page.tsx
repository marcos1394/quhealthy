"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, ChevronLeft, ChevronRight, CalendarX2,
  Calendar as CalendarIcon, Loader2, MapPin, Truck, Zap, GraduationCap, Package, Store
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // 🚀 Añadido para la dirección
import { Label } from "@/components/ui/label"; // 🚀 Añadido

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

  // --- NUEVO: ESTADOS DE E-COMMERCE ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [pendingSymptoms, setPendingSymptoms] = useState("");
  const [scheduleNow, setScheduleNow] = useState(true); // 🚀 Toggle para agendar ahora o después
  const [shippingMethod, setShippingMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY'); // 🚀 Toggle para recoger o envío

  // 🧠 CEREBRO DEL CHECKOUT HÍBRIDO
  const requiresScheduling = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
  const requiresShipping = cart.some(item => item.type === 'PRODUCT' && item.isDigital !== true);
  const needsPrescription = cart.some(item => item.type === 'PRODUCT' && item.requiresPrescription === true);
  const isOnlyDigital = !requiresScheduling && !requiresShipping;

  useEffect(() => {
    if (cart.length === 0 || !providerId) {
      router.replace(`/patient/store/${slug}`);
    }
  }, [cart, providerId, router, slug]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
    if (providerId) {
      // 🚀 TODO: Reemplazar con el locationId de la sede seleccionada por el paciente
      // cuando se implemente la UI de selección de sede en el flujo de booking.
      const locationId = 1; // Sede principal del proveedor por defecto
      fetchAvailableSlots(providerId, locationId, date, getTotalDuration());
    }
  };

  const handleCheckout = async (symptomsText: string) => {
    // Validaciones extra para E-commerce
    if (requiresScheduling && scheduleNow && (!selectedDate || !selectedTime)) {
      return; 
    }

    if (requiresShipping || needsPrescription) {
      // Abrimos modal para que suba receta / ponga dirección
      setPendingSymptoms(symptomsText);
      setShowCheckoutModal(true);
    } else {
      // Todo digital y sin receta, procedemos
      if (providerId) {
        await processCheckout({
          providerId,
          selectedDate: (requiresScheduling && scheduleNow) ? selectedDate : null,
          selectedTime: (requiresScheduling && scheduleNow) ? selectedTime : null,
          cart,
          dependentId: (requiresScheduling && scheduleNow) ? dependentId : undefined, 
          consumerSymptoms: symptomsText,
        });
      }
    }
  };

  if (cart.length === 0 || !providerId) return null;

  const safeColor = providerColor || '#0ea5e9';
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

  // Contadores dinámicos de pasos
  let stepCounter = 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans selection:bg-medical-500/30">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 h-11 gap-2">
            <ArrowLeft className="w-5 h-5" /> {t('btn_back')}
          </Button>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
            <p className="font-bold text-lg" style={{ color: safeColor }}>{providerName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col lg:flex-row gap-10">

        <div className="flex-1 space-y-12">

          {/* 🚀 ESTADO: SOLO DIGITAL (Cursos) */}
          {isOnlyDigital && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Estás a un paso</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Tu carrito contiene únicamente contenido digital. No es necesario agendar cita ni especificar dirección de envío. Revisa tu orden a la derecha y procede al pago para acceder inmediatamente.
              </p>
            </motion.div>
          )}

          {/* 🩺 LÓGICA DE SERVICIOS (Calendario y Paciente) */}
          {requiresScheduling && (
            <>
              {/* Opción de Agendar Ahora o Comprar para Después */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center border-2 border-medical-200 dark:border-medical-500/30">
                    <span className="font-bold text-lg text-medical-600 dark:text-medical-400">{stepCounter++}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">¿Cuándo deseas agendar?</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-14">
                  <Card 
                    className={`cursor-pointer transition-all ${scheduleNow ? 'ring-2 ring-medical-500 bg-medical-50 dark:bg-medical-500/10' : 'hover:border-medical-300'}`}
                    onClick={() => setScheduleNow(true)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <CalendarIcon className={`w-8 h-8 ${scheduleNow ? 'text-medical-600' : 'text-slate-400'}`} />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Agendar Ahora</h4>
                        <p className="text-sm text-slate-500">Selecciona fecha y hora</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${!scheduleNow ? 'ring-2 ring-medical-500 bg-medical-50 dark:bg-medical-500/10' : 'hover:border-medical-300'}`}
                    onClick={() => setScheduleNow(false)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Package className={`w-8 h-8 ${!scheduleNow ? 'text-medical-600' : 'text-slate-400'}`} />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Comprar para Después</h4>
                        <p className="text-sm text-slate-500">Guarda los créditos en tu cuenta</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.section>

              {/* Step: Calendar (Solo si scheduleNow es true) */}
              <AnimatePresence>
                {scheduleNow && (
                  <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center border-2 border-medical-200 dark:border-medical-500/30">
                    <span className="font-bold text-lg text-medical-600 dark:text-medical-400">{stepCounter++}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('step_date')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('select_date')}</p>
                  </div>
                </div>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl"><CalendarIcon className="w-6 h-6 text-medical-600 dark:text-medical-400" /></div>
                        <h3 className="text-2xl font-bold capitalize text-slate-900 dark:text-white">{format(currentMonth, "MMMM yyyy", { locale: es })}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={prevMonth} disabled={isBefore(currentMonth, startOfMonth(new Date()))} className="h-11 w-11 p-0"><ChevronLeft className="w-5 h-5" /></Button>
                        <Button variant="outline" onClick={nextMonth} className="h-11 w-11 p-0"><ChevronRight className="w-5 h-5" /></Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 mb-4">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((date, i) => (
                        <CalendarDay key={i} date={date} isCurrentMonth={isSameMonth(date, monthStart)} isPast={isBefore(date, startOfDay(new Date()))} selectedDate={selectedDate} providerColor={safeColor} onSelect={handleDateSelect} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
                )}
              </AnimatePresence>

              {/* Step: Time Slots */}
              <AnimatePresence>
                {scheduleNow && selectedDate && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border-2 border-blue-200 dark:border-blue-500/30">
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{stepCounter++}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('step_time')}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}</p>
                      </div>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 h-8">
                        <Clock className="w-3 h-3 mr-1" /> {duration} min
                      </Badge>
                    </div>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                      <CardContent className="p-8">
                        {isLoadingSlots ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />)}
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {availableSlots.map((time) => (
                              <TimeSlot key={time} time={time} isSelected={selectedTime === time} providerColor={safeColor} onSelect={setSelectedTime} />
                            ))}
                          </div>
                        ) : (
                          <div className="py-16 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6"><CalendarX2 className="w-10 h-10 text-slate-400" /></div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_slots')}</p>
                            <p className="text-sm text-slate-500">{t('select_date')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Step: Patient Selector */}
              <AnimatePresence>
                {scheduleNow && selectedTime && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-500/30">
                        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{stepCounter++}</span>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Paciente</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Confirma quién recibirá la atención médica</p>
                      </div>
                    </div>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                      <CardContent className="p-6 md:p-8">
                        <PatientSelector />
                      </CardContent>
                    </Card>
                  </motion.section>
                )}
              </AnimatePresence>
            </>
          )}

          {/* La sección de dirección física fue movida al CheckoutModal */}        </div>

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
        onConfirm={(shippingAddress, prescriptionUrls) => {
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
            });
          }
        }}
      />
    </div>
  );
}