"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  CalendarX2,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingStore } from "@/hooks/useBookingStore"; 
import { useAvailability } from "@/hooks/useAvailability";
import { CalendarDay } from "@/components/booking/CalendarDay";
import { TimeSlot } from "@/components/booking/TimeSlot";
import { BookingSummary } from "@/components/booking/BookingSummary";
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
  startOfDay
} from "date-fns";
import { es } from "date-fns/locale";

export default function BookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  
  const { cart, providerId, providerName, providerColor, getTotalPrice, getTotalDuration } = useBookingStore();
  const { availableSlots, isLoadingSlots, fetchAvailableSlots } = useAvailability();

  // Estados del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (cart.length === 0 || !providerId) {
      router.replace(`/patient/store/${params.slug}`);
    }
  }, [cart, providerId, router, params.slug]);

  // Lógica del calendario
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

  const handleCheckout = () => {
    // Lógica de checkout
    console.log('Ir a checkout');
  };

  // Prevenimos renderizado si falta info
  if (cart.length === 0 || !providerId) return null;

  const safeColor = providerColor || '#9333ea';
  const total = getTotalPrice();
  const duration = getTotalDuration();

  // Generar cuadrícula de días
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

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-32">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white hover:bg-gray-800 h-11 gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Button>
          
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-500">Agendando con</p>
            <p className="font-black text-lg text-white" style={{ color: safeColor }}>
              {providerName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col lg:flex-row gap-10">
        
        {/* Columna Izquierda: Calendario y Horarios */}
        <div className="flex-1 space-y-12">
          
          {/* PASO 1: Calendario */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/30">
                <span className="font-black text-lg text-purple-400">1</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Elige un día</h2>
                <p className="text-sm text-gray-500 mt-1">Selecciona la fecha de tu cita</p>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                
                {/* Controles del mes */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <CalendarIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-black capitalize text-white">
                      {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={prevMonth}
                      disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                      className="border-gray-800 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 h-11 w-11 p-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={nextMonth}
                      className="border-gray-800 bg-gray-900 hover:bg-gray-800 h-11 w-11 p-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 mb-4">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
                    <div key={dayName} className="text-center text-xs font-black text-gray-500 uppercase tracking-wider">
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Cuadrícula de días */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, i) => {
                    const isPast = isBefore(date, startOfDay(new Date()));
                    const isCurrentMonth = isSameMonth(date, monthStart);

                    return (
                      <CalendarDay
                        key={i}
                        date={date}
                        isCurrentMonth={isCurrentMonth}
                        isPast={isPast}
                        selectedDate={selectedDate}
                        providerColor={safeColor}
                        onSelect={handleDateSelect}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* PASO 2: Horarios */}
          <AnimatePresence>
            {selectedDate && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center border-2 border-pink-500/30">
                    <span className="font-black text-lg text-pink-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black text-white">Horarios disponibles</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <Badge className="bg-gray-900 text-gray-400 border-gray-800 h-8">
                    <Clock className="w-3 h-3 mr-1" /> 
                    {duration} min requeridos
                  </Badge>
                </div>

                <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl">
                  <CardContent className="p-8">
                    {isLoadingSlots ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                          <div key={i} className="h-16 rounded-2xl bg-gray-900 animate-pulse border border-gray-800" />
                        ))}
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
                      <div className="py-16 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center mb-6 border border-gray-800">
                          <CalendarX2 className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-xl font-black text-white mb-2">
                          No hay horarios disponibles
                        </p>
                        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                          El profesional no tiene disponibilidad en la fecha seleccionada. Intenta con otro día.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Columna Derecha: Resumen */}
        <BookingSummary
          cart={cart}
          total={total}
          providerColor={safeColor}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}