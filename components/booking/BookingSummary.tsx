// components/booking/BookingSummary.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, CreditCard, AlertCircle, ShoppingCart, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StorefrontItem } from "@/types/storefront";

interface BookingSummaryProps {
  cart: StorefrontItem[];
  total: number;
  providerColor: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  isProcessing?: boolean;
  // 🚀 ACTUALIZADO: Ahora enviamos los síntomas al componente padre
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
  // 🚀 ESTADO PARA EL MOTIVO DE LA CITA
  const [symptoms, setSymptoms] = useState("");
  
  const isReady = selectedDate && selectedTime;

  // 🚀 SIMULACIÓN DE TASA DE CAMBIO (Esto luego vendrá de tu Cron Job en el backend)
  const EXCHANGE_RATE_USD = 17.50; // 1 USD = 17.50 MXN (Ejemplo)
  const estimatedUSD = (total / EXCHANGE_RATE_USD).toFixed(2);

  const handleCheckoutClick = () => {
    // Si el usuario no escribió nada, enviamos un texto por defecto limpio
    const finalSymptoms = symptoms.trim() !== "" 
      ? symptoms.trim() 
      : "Consulta general agendada desde la tienda web.";
      
    onCheckout(finalSymptoms);
  };

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
                  <span className="font-black text-xl text-white">${item.price}</span>
                </motion.div>
              ))}
            </div>

            <Separator className="bg-gray-800" />

            {/* 🚀 NUEVO: Campo para el motivo de la cita */}
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
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Impuestos</span>
                  <span className="font-semibold">$0.00 MXN</span>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="flex flex-col pt-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-white text-base mb-1">Total a pagar</span>
                    <div className="text-right">
                      {/* 🚀 PRECIO REAL A COBRAR EN STRIPE */}
                      <span 
                        className="text-3xl font-black text-white block leading-none"
                        style={{ color: providerColor }}
                      >
                        ${total} <span className="text-lg font-bold">MXN</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* 🚀 UX MAGIA: Estimación en USD para extranjeros */}
                  <div className="flex justify-end mt-1">
                    <span className="text-sm font-medium text-gray-500 bg-gray-800/50 px-2 py-1 rounded-md">
                      ≈ ${estimatedUSD} USD (Aprox)
                    </span>
                  </div>
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
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3" />
                <span>No se te cobrará hasta confirmar en Stripe</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}