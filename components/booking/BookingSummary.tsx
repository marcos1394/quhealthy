// components/booking/BookingSummary.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Sparkles, Clock, CreditCard, AlertCircle, ShoppingCart, Loader2, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StorefrontItem } from "@/types/storefront";
import { appointmentService } from "@/services/appointment.service";
import { PatientSelector } from "@/components/booking/PatientSelector";

interface BookingSummaryProps {
  cart: StorefrontItem[];
  total: number;
  providerColor: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  isProcessing?: boolean;
  onCheckout: (symptoms: string) => void;
}

export function BookingSummary({
  cart,
  total,
  providerColor,
  selectedDate,
  selectedTime,
  isProcessing = false,
  onCheckout
}: BookingSummaryProps) {
  const t = useTranslations('PatientBooking');
  const [symptoms, setSymptoms] = useState("");

  const [rates, setRates] = useState<Record<string, number>>({ MXN: 1 });
  const [selectedCurrency, setSelectedCurrency] = useState<string>("MXN");
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const isReady = selectedDate && selectedTime;

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      const data = await appointmentService.getExchangeRates();
      setRates(data);
      setIsLoadingRates(false);
    };
    fetchRates();
  }, []);

  const handleCheckoutClick = () => {
    const finalSymptoms = symptoms.trim() !== ""
      ? symptoms.trim()
      : "Consulta general agendada desde la tienda web.";

    onCheckout(finalSymptoms);
  };

  const currentRate = rates[selectedCurrency] || 1;
  const convertedTotal = (total * currentRate).toFixed(2);
  const isForeignCurrency = selectedCurrency !== "MXN";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full lg:w-96"
    >
      <div className="sticky top-28">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                <ShoppingCart className="w-6 h-6 text-medical-600 dark:text-medical-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex-1">
                {t('cart_summary')}
              </h3>
              <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-medical-200 dark:border-medical-500/20">
                {cart.length} {cart.length === 1 ? 'servicio' : 'servicios'}
              </Badge>
            </div>

            {/* Currency Selector */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg flex border border-slate-200 dark:border-slate-700">
              {['MXN', 'USD', 'EUR'].map((cur) => (
                <button
                  key={cur}
                  onClick={() => setSelectedCurrency(cur)}
                  disabled={isLoadingRates}
                  className={`
                    flex-1 text-xs font-bold py-2 rounded-md transition-all
                    ${selectedCurrency === cur
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }
                  `}
                >
                  {isLoadingRates && selectedCurrency === cur ? (
                    <Loader2 className="w-3 h-3 mx-auto animate-spin" />
                  ) : (
                    cur
                  )}
                </button>
              ))}
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Cart Items */}
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 hide-scrollbar">
              {cart.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex justify-between items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-900 dark:text-white mb-2">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.durationMinutes || 0} min
                      </Badge>
                    </div>
                  </div>
                  <span className="font-bold text-md text-slate-500 dark:text-slate-400">${item.price} MXN</span>
                </motion.div>
              ))}
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Selector de Paciente */}
            <PatientSelector />

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Symptoms */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h4>{t('label_symptoms')} <span className="text-slate-400 dark:text-slate-500 font-normal text-sm">({t('optional') || 'Opcional'})</span></h4>
              </div>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ej. Me duele la espalda baja desde hace 3 días..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-medical-500/50 transition-all resize-none"
                rows={2}
                maxLength={200}
                disabled={isProcessing}
              />
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Totals */}
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 space-y-3">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">${total} MXN</span>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div className="flex flex-col pt-2">
                  <span className="font-bold text-slate-900 dark:text-white text-base mb-1">{t('label_price')}</span>

                  {isForeignCurrency ? (
                    <>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white block leading-none" style={{ color: providerColor }}>
                          ≈ ${convertedTotal} <span className="text-lg font-bold">{selectedCurrency}</span>
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-end gap-1">
                          <Globe className="w-3 h-3" />
                          Se te cobrarán exactamente ${total} MXN.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white block leading-none" style={{ color: providerColor }}>
                          ${total} <span className="text-lg font-bold">MXN</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckoutClick}
                disabled={!isReady || isProcessing}
                className={`
                  w-full h-16 rounded-2xl font-bold text-lg shadow-sm transition-all duration-300
                  ${!isReady || isProcessing
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-2 border-slate-300 dark:border-slate-700'
                    : 'hover:scale-[1.02] text-white border-2'
                  }
                `}
                style={(!isReady || isProcessing) ? {} : {
                  backgroundColor: providerColor,
                  borderColor: providerColor,
                  boxShadow: `0 20px 40px -15px ${providerColor}60`
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : !isReady ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {t('select_time')}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t('btn_checkout')}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}