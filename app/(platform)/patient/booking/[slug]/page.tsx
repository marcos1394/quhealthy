"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  CreditCard,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CalendarX2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookingStore } from "@/hooks/useBookingStore"; 
import { useAvailability } from "@/hooks/useAvailability";
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
  isSameDay, 
  isToday,
  isBefore,
  startOfDay
} from "date-fns";
import { es } from "date-fns/locale";

export default function BookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  
  const { cart, providerId, providerName, providerColor, getTotalPrice, getTotalDuration } = useBookingStore();
  const { availableSlots, isLoadingSlots, fetchAvailableSlots } = useAvailability();

  // --- ESTADOS DEL CALENDARIO ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0 || !providerId) {
      router.replace(`/patient/store/${params.slug}`);
    }
  }, [cart, providerId, router, params.slug]);

  // --- LÓGICA DEL CALENDARIO MENSUAL ---
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateSelect = (date: Date) => {
    // Evitar seleccionar días en el pasado
    if (isBefore(date, startOfDay(new Date()))) return;

    setSelectedDate(date);
    setSelectedTime(null); // Reseteamos la hora si cambia de día
    
    if (providerId) {
      fetchAvailableSlots(providerId, date, getTotalDuration());
    }
  };

  // Prevenimos renderizado si falta info
  if (cart.length === 0 || !providerId) return null;

  const safeColor = providerColor || '#9333ea';
  const total = getTotalPrice();
  const duration = getTotalDuration();

  // Generar la cuadrícula de días del mes actual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Semana empieza en Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 pb-32">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-500">Agendando con</p>
            <p className="font-bold text-white" style={{ color: safeColor }}>{providerName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* --- COLUMNA IZQUIERDA: CALENDARIO Y HORARIOS --- */}
        <div className="flex-1 space-y-10">
          
          {/* PASO 1: Calendario Mensual */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <span className="font-bold text-sm">1</span>
              </div>
              <h2 className="text-2xl font-black">Elige un día</h2>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl">
              {/* Controles del mes */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold capitalize text-white">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={prevMonth}
                    disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-300" />
                  </button>
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-300" />
                  </button>
                </div>
              </div>

              {/* Días de la semana (L, M, X, J, V, S, D) */}
              <div className="grid grid-cols-7 mb-4">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
                  <div key={dayName} className="text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, i) => {
                  const isPast = isBefore(date, startOfDay(new Date()));
                  const isCurrentMonth = isSameMonth(date, monthStart);
                  const selected = selectedDate ? isSameDay(date, selectedDate) : false;
                  const today = isToday(date);

                  return (
                    <button
                      key={i}
                      onClick={() => handleDateSelect(date)}
                      disabled={isPast || !isCurrentMonth}
                      className={`
                        relative flex flex-col items-center justify-center h-14 rounded-2xl transition-all duration-300
                        ${!isCurrentMonth || isPast ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'}
                        ${selected ? 'shadow-lg scale-105 z-10' : 'bg-transparent'}
                      `}
                      style={selected ? { backgroundColor: safeColor, color: '#fff' } : {}}
                    >
                      {/* Indicador de "Hoy" */}
                      {today && !selected && (
                        <span className="absolute top-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: safeColor }} />
                      )}
                      
                      <span className={`text-lg font-bold ${selected ? 'text-white' : (isCurrentMonth && !isPast ? 'text-zinc-300' : 'text-zinc-600')}`}>
                        {format(date, 'd')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* PASO 2: Horarios Reales (Desde la API) */}
          <AnimatePresence>
            {selectedDate && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-black">Horarios disponibles</h2>
                  <Badge className="ml-auto bg-white/5 text-zinc-400 border-none">
                    <Clock className="w-3 h-3 mr-1" /> {duration} min req.
                  </Badge>
                </div>

                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse border border-white/10" />
                    ))}
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`h-14 rounded-xl border font-bold transition-all duration-300 ${
                            isSelected 
                              ? 'text-white shadow-lg scale-105' 
                              : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20'
                          }`}
                          style={isSelected ? { backgroundColor: safeColor, borderColor: safeColor } : {}}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center flex flex-col items-center">
                    <CalendarX2 className="w-10 h-10 text-zinc-600 mb-3" />
                    <p className="text-zinc-300 font-bold text-lg">No hay horarios disponibles</p>
                    <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                      El doctor no tiene disponibilidad o está fuera de horario en la fecha seleccionada.
                    </p>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* --- COLUMNA DERECHA: RESUMEN (Sticky) --- */}
        <div className="w-full lg:w-96">
          <div className="sticky top-28 bg-[#09090b]/50 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              Resumen de tu cita
            </h3>

            <div className="space-y-4 mb-6">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-zinc-200">{item.name}</p>
                    <p className="text-xs text-zinc-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" /> {item.durationMinutes} min
                    </p>
                  </div>
                  <span className="font-black text-white">${item.price}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-8 space-y-2">
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Subtotal</span>
                <span>${total}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm">
                <span>Impuestos</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                <span className="font-medium text-white">Total a pagar</span>
                <span className="text-2xl font-black text-white" style={{ color: safeColor }}>
                  ${total}
                </span>
              </div>
            </div>

            <Button 
              disabled={!selectedDate || !selectedTime}
              className={`w-full h-14 rounded-xl font-black text-base shadow-xl transition-all ${
                (!selectedDate || !selectedTime) 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'hover:scale-[1.02] hover:brightness-110 text-white'
              }`}
              style={(!selectedDate || !selectedTime) ? {} : { backgroundColor: safeColor }}
            >
              {(!selectedDate || !selectedTime) ? (
                'Selecciona fecha y hora'
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Ir al Checkout
                </>
              )}
            </Button>
            
            <p className="text-center text-xs text-zinc-500 mt-4 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 mr-1" /> No se te cobrará nada aún.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}