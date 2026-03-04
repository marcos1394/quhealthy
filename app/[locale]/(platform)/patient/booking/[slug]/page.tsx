"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { useBookingCheckout } from "@/hooks/useBookingCheckout";
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

export default function BookingPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const t = useTranslations('PatientBooking');

  const { cart, providerId, providerName, providerColor, dependentId, getTotalPrice, getTotalDuration } = useBookingStore();
  const { availableSlots, isLoadingSlots, fetchAvailableSlots } = useAvailability();
  const { processCheckout, isProcessing } = useBookingCheckout();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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
    if (providerId && selectedDate && selectedTime) {
      await processCheckout({
        providerId,
        selectedDate,
        selectedTime,
        cart,
        dependentId, // 🚀 NUEVO
        consumerSymptoms: symptomsText
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans selection:bg-medical-500/30">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 h-11 gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('btn_back')}
          </Button>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
            <p className="font-bold text-lg" style={{ color: safeColor }}>
              {providerName}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col lg:flex-row gap-10">

        <div className="flex-1 space-y-12">

          {/* Step 1: Calendar */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center border-2 border-medical-200 dark:border-medical-500/30">
                <span className="font-bold text-lg text-medical-600 dark:text-medical-400">1</span>
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
                    <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl">
                      <CalendarIcon className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                    </div>
                    <h3 className="text-2xl font-bold capitalize text-slate-900 dark:text-white">
                      {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={prevMonth}
                      disabled={isBefore(currentMonth, startOfMonth(new Date()))}
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 h-11 w-11 p-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={nextMonth}
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 h-11 w-11 p-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-4">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
                    <div key={dayName} className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {dayName}
                    </div>
                  ))}
                </div>

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

          {/* Step 2: Time Slots */}
          <AnimatePresence>
            {selectedDate && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border-2 border-blue-200 dark:border-blue-500/30">
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('step_time')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 h-8">
                    <Clock className="w-3 h-3 mr-1" />
                    {duration} min
                  </Badge>
                </div>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="p-8">
                    {isLoadingSlots ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                          <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
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
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
                          <CalendarX2 className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {t('no_slots')}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                          {t('select_date')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Summary Sidebar */}
        <BookingSummary
          cart={cart}
          total={total}
          providerColor={safeColor}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          isProcessing={isProcessing}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}