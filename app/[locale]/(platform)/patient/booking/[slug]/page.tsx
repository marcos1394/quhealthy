"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, ChevronLeft, ChevronRight, CalendarX2,
  Calendar as CalendarIcon, Loader2, MapPin, Truck, Zap, GraduationCap
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
  const [shippingAddress, setShippingAddress] = useState("");

  // 🧠 CEREBRO DEL CHECKOUT HÍBRIDO
  const requiresScheduling = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
  const requiresShipping = cart.some(item => item.type === 'PRODUCT' && !item.isDigital);
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
      fetchAvailableSlots(providerId, date, getTotalDuration());
    }
  };

  const handleCheckout = async (symptomsText: string) => {
    // Validaciones extra para E-commerce
    if (requiresScheduling && (!selectedDate || !selectedTime)) {
      return; // El componente BookingSummary probablemente ya bloquea esto, pero por si acaso.
    }

    if (providerId) {
      await processCheckout({
        providerId,
        // Si no requiere agendar, mandamos valores nulos
        selectedDate: requiresScheduling ? selectedDate : null,
        selectedTime: requiresScheduling ? selectedTime : null,
        cart,
        dependentId: requiresScheduling ? dependentId : undefined, 
        consumerSymptoms: symptomsText,
        shippingAddress: requiresShipping ? shippingAddress : undefined // 🚀 Nueva inyección
      });
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
              {/* Step: Calendar */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

              {/* Step: Time Slots */}
              <AnimatePresence>
                {selectedDate && (
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
                {selectedTime && (
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

          {/* 📦 LÓGICA DE PRODUCTOS (Dirección de Envío) */}
          {requiresShipping && (
            <AnimatePresence>
              {(!requiresScheduling || (requiresScheduling && selectedTime)) && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border-2 border-amber-200 dark:border-amber-500/30">
                      <span className="font-bold text-lg text-amber-600 dark:text-amber-400">{stepCounter++}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Dirección de Envío <Truck className="w-6 h-6 text-amber-500" />
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Has agregado productos físicos. Indícanos a dónde enviarlos.
                      </p>
                    </div>
                  </div>

                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    <CardContent className="p-6 md:p-8 space-y-4">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> Domicilio Completo
                      </Label>
                      <Textarea 
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Calle, Número, Colonia, Ciudad, Código Postal..."
                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 min-h-[100px] resize-none focus:ring-amber-500 focus:border-amber-500"
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg inline-flex">
                        <Zap className="w-3 h-3" /> Los gastos de envío se calcularán y acordarán directamente con el especialista.
                      </p>
                    </CardContent>
                  </Card>
                </motion.section>
              )}
            </AnimatePresence>
          )}

        </div>

        {/* Summary Sidebar */}
        <BookingSummary
          cart={cart}
          total={total}
          providerColor={safeColor}
          // Si no requiere agendar, le pasamos una fecha "dummy" para que el componente no bloquee el botón
          selectedDate={requiresScheduling ? selectedDate : new Date()}
          selectedTime={requiresScheduling ? selectedTime : "00:00"}
          isProcessing={isProcessing}
          onCheckout={handleCheckout}
          // Puedes usar requiresScheduling en tu BookingSummary para ocultar los labels de Fecha/Hora si deseas
        />
      </div>
    </div>
  );
}