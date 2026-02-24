// components/booking/BookingSummary.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, CreditCard, AlertCircle, ShoppingCart, Loader2, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StorefrontItem } from "@/types/storefront";
import { appointmentService } from "@/services/appointment.service"; // 🚀 Usando el servicio existente

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
  const [symptoms, setSymptoms] = useState("");
  
  // 🚀 ESTADOS PARA EL SELECTOR DE MONEDA
  const [rates, setRates] = useState<Record<string, number>>({ MXN: 1 });
  const [selectedCurrency, setSelectedCurrency] = useState<string>("MXN");
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const isReady = selectedDate && selectedTime;

  // 🚀 CARGAR TASAS DE CAMBIO AL MONTAR
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

  // 🚀 CÁLCULOS DE MONEDA
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
        <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <ShoppingCart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white flex-1">
                Resumen
              </h3>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                {cart.length} {cart.length === 1 ? 'servicio' : 'servicios'}
              </Badge>
            </div>

            {/* 🚀 SELECTOR DE MONEDA (Pills) */}
            <div className="bg-gray-950/50 p-1 rounded-lg flex border border-gray-800">
              {['MXN', 'USD', 'EUR'].map((cur) => (
                <button
                  key={cur}
                  onClick={() => setSelectedCurrency(cur)}
                  disabled={isLoadingRates}
                  className={`
                    flex-1 text-xs font-bold py-2 rounded-md transition-all
                    ${selectedCurrency === cur 
                      ? 'bg-gray-800 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300'
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

            <Separator className="bg-gray-800" />

            {/* Cart Items */}
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 hide-scrollbar">
              {cart.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex justify-between items-start p-4 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-white mb-2">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.durationMinutes || 0} min
                      </Badge>
                    </div>
                  </div>
                  {/* El precio base siempre se muestra en MXN para no confundir al item individual */}
                  <span className="font-bold text-md text-gray-400">${item.price} MXN</span>
                </motion.div>
              ))}
            </div>

            <Separator className="bg-gray-800" />

            {/* Campo para el motivo de la cita */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4>Motivo de la cita <span className="text-gray-500 font-normal text-sm">(Opcional)</span></h4>
              </div>
              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ej. Me duele la espalda baja desde hace 3 días..."
                className="w-full bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                rows={2}
                maxLength={200}
                disabled={isProcessing}
              />
            </div>

            <Separator className="bg-gray-800" />

            {/* Totals */}
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-2xl p-5 border border-gray-800 space-y-3">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">${total} MXN</span>
                </div>
                
                <Separator className="bg-gray-800" />
                
                {/* 🚀 LÓGICA DE VISUALIZACIÓN DE MONEDA */}
                <div className="flex flex-col pt-2">
                  <span className="font-bold text-white text-base mb-1">Total a pagar</span>
                  
                  {isForeignCurrency ? (
                    <>
                      {/* Vista Extranjera: Destaca su moneda, aclara que el cobro es en MXN */}
                      <div className="text-right">
                        <span className="text-3xl font-black text-white block leading-none" style={{ color: providerColor }}>
                          ≈ ${convertedTotal} <span className="text-lg font-bold">{selectedCurrency}</span>
                        </span>
                        <p className="text-xs text-gray-500 mt-2 flex items-center justify-end gap-1">
                          <Globe className="w-3 h-3" />
                          Se te cobrarán exactamente ${total} MXN.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Vista Local: Destaca MXN */}
                      <div className="text-right">
                        <span className="text-3xl font-black text-white block leading-none" style={{ color: providerColor }}>
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
                  w-full h-16 rounded-2xl font-black text-lg shadow-2xl transition-all duration-300
                  ${!isReady || isProcessing
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700' 
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
                    Procesando...
                  </>
                ) : !isReady ? (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Selecciona horario
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Ir al Checkout
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