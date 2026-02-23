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
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookingStore } from "@/hooks/useBookingStore";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

export default function BookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  
  // 🚀 LEEMOS EL ESTADO GLOBAL (El carrito que llenamos en la página anterior)
  const { cart, providerName, providerColor, getTotalPrice, getTotalDuration } = useBookingStore();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Redirigir si el carrito está vacío (ej. si el usuario recarga la página de golpe)
  useEffect(() => {
    if (cart.length === 0) {
      router.replace(`/patient/store/${params.slug}`); // Ajusta la ruta a la de tu tienda
    }
  }, [cart, router, params.slug]);

  // --- GENERAR DÍAS PARA EL SELECTOR ---
  // Generamos los próximos 14 días para el UI
  const nextDays = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));

  // --- MOCK DE HORARIOS (Sustituiremos esto por tu Backend) ---
  const mockSlots = ["09:00", "09:30", "10:00", "11:30", "16:00", "16:30", "17:00"];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setIsLoadingSlots(true);
    
    // 🚧 AQUÍ HAREMOS LA LLAMADA AL BACKEND EN EL FUTURO:
    // fetch(`/api/appointments/slots?date=${date}&duration=${getTotalDuration()}`)
    
    // Simulamos el tiempo de carga de la API
    setTimeout(() => setIsLoadingSlots(false), 800);
  };

  if (cart.length === 0) return null; // Evita parpadeos mientras redirige

  const safeColor = providerColor || '#9333ea';
  const total = getTotalPrice();
  const duration = getTotalDuration();

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
        
        {/* --- COLUMNA IZQUIERDA: SELECCIÓN DE FECHA Y HORA --- */}
        <div className="flex-1 space-y-10">
          
          {/* PASO 1: Fecha */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <span className="font-bold text-sm">1</span>
              </div>
              <h2 className="text-2xl font-black">Elige un día</h2>
            </div>

            {/* Scroll Horizontal de Días */}
            <div className="flex overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-3">
              {nextDays.map((date, i) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(date)}
                    className={`flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl border transition-all duration-300 ${
                      isSelected 
                        ? 'bg-white/10 border-transparent shadow-lg transform -translate-y-1' 
                        : 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                    style={isSelected ? { borderColor: safeColor, boxShadow: `0 10px 25px -5px ${safeColor}40` } : {}}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider mb-1" style={isSelected ? { color: safeColor } : { color: '#a1a1aa' }}>
                      {format(date, 'EEE', { locale: es })}
                    </span>
                    <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {format(date, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* PASO 2: Horarios (Aparece solo si hay fecha) */}
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
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {mockSlots.map((time) => {
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