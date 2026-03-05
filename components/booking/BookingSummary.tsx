// components/booking/BookingSummary.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  ShoppingCart, 
  Loader2, 
  FileText, 
  Globe, 
  MapPin, 
  Truck, 
  Package,
  MonitorPlay,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StorefrontItem } from "@/types/storefront";
import { appointmentService } from "@/services/appointment.service";

interface BookingSummaryProps {
  cart: StorefrontItem[];
  total: number;
  providerColor: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  isProcessing?: boolean;
  onCheckout: (symptoms: string, shippingAddress?: string) => void;
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
  
  // ==========================================
  // ESTADOS LOCALES
  // ==========================================
  const [symptoms, setSymptoms] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [rates, setRates] = useState<Record<string, number>>({ MXN: 1 });
  const [selectedCurrency, setSelectedCurrency] = useState<string>("MXN");
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // ==========================================
  // FETCH DE DIVISAS (Con degradación elegante)
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const data = await appointmentService.getExchangeRates();
        if (isMounted) setRates(data);
      } catch (error) {
        console.warn("No se pudieron cargar las tasas de cambio. Usando fallback.");
        if (isMounted) setRates({ MXN: 1, USD: 0.05, EUR: 0.045 });
      } finally {
        if (isMounted) setIsLoadingRates(false);
      }
    };
    fetchRates();
    return () => { isMounted = false; };
  }, []);

  // ==========================================
  // CÁLCULOS MEMOIZADOS (Performance)
  // ==========================================
  const cartAnalysis = useMemo(() => {
    const hasServices = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
    const hasProducts = cart.some(item => item.type === 'PRODUCT');
    const hasCourses = cart.some(item => item.type === 'COURSE');
    const isEmpty = cart.length === 0;

    return { hasServices, hasProducts, hasCourses, isEmpty };
  }, [cart]);

  const validationRules = useMemo(() => {
    const isTimeValid = cartAnalysis.hasServices ? (selectedDate !== null && selectedTime !== null) : true;
    const isAddressValid = cartAnalysis.hasProducts ? shippingAddress.trim().length >= 10 : true;
    const isReady = isTimeValid && isAddressValid && !cartAnalysis.isEmpty;

    return { isTimeValid, isAddressValid, isReady };
  }, [cartAnalysis, selectedDate, selectedTime, shippingAddress]);

  const currencyCalculations = useMemo(() => {
    const currentRate = rates[selectedCurrency] || 1;
    const convertedTotal = (total * currentRate).toFixed(2);
    const isForeignCurrency = selectedCurrency !== "MXN";
    return { convertedTotal, isForeignCurrency };
  }, [total, rates, selectedCurrency]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleCheckoutClick = () => {
    if (!validationRules.isReady || isProcessing) return;

    const finalNotes = symptoms.trim() !== "" 
      ? symptoms.trim() 
      : `Orden Híbrida generada web. Ítems: ${cart.length}`;

    onCheckout(finalNotes, cartAnalysis.hasProducts ? shippingAddress.trim() : undefined);
  };

  // ==========================================
  // HELPERS DE RENDERIZADO
  // ==========================================
  const renderItemIconAndBadge = (item: StorefrontItem) => {
    switch (item.type) {
      case 'SERVICE':
      case 'PACKAGE':
        return (
          <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 font-medium">
            <Clock className="w-3 h-3 mr-1.5 text-blue-500" />
            {item.durationMinutes || 30} min
          </Badge>
        );
      case 'COURSE':
        return (
          <Badge className="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20 font-medium">
            <MonitorPlay className="w-3 h-3 mr-1.5" />
            Digital
          </Badge>
        );
      case 'PRODUCT':
      default:
        return (
          <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-medium">
            <Package className="w-3 h-3 mr-1.5" />
            x{item.quantity || 1} físico
          </Badge>
        );
    }
  };

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full lg:w-[400px]"
    >
      <div className="sticky top-24">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            
            {/* 🟦 HEADER DE RESUMEN */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: providerColor }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('cart_summary') || 'Resumen de Compra'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {cart.length === 0 ? 'El carrito está vacío' : `${cart.length} artículo(s) seleccionados`}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* 💱 SELECTOR DE DIVISAS */}
              {!cartAnalysis.isEmpty && (
                <div className="bg-slate-100/80 dark:bg-slate-800/50 p-1.5 rounded-xl flex border border-slate-200 dark:border-slate-700">
                  {['MXN', 'USD', 'EUR'].map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setSelectedCurrency(cur)}
                      disabled={isLoadingRates}
                      className={`
                        flex-1 text-xs font-bold py-2.5 rounded-lg transition-all duration-200
                        ${selectedCurrency === cur
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }
                      `}
                      aria-label={`Cambiar moneda a ${cur}`}
                    >
                      {isLoadingRates && selectedCurrency === cur ? (
                        <Loader2 className="w-3.5 h-3.5 mx-auto animate-spin" />
                      ) : (
                        cur
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* 🛒 LISTA DE ÍTEMS DEL CARRITO */}
              {cartAnalysis.isEmpty ? (
                <div className="text-center py-8 px-4 text-slate-500 dark:text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aún no has agregado servicios o productos a tu compra.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start w-full gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            {renderItemIconAndBadge(item)}
                          </div>
                        </div>
                        <span className="font-bold text-base text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* 📦 FORMULARIO DINÁMICO: DIRECCIÓN DE ENVÍO */}
              <AnimatePresence>
                {cartAnalysis.hasProducts && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                      <Truck className="w-4 h-4 text-emerald-500" />
                      <h4>Datos de Envío <span className="text-red-500 ml-0.5">*</span></h4>
                    </div>
                    <div className="relative">
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Calle, Número, Colonia, Ciudad, Código Postal..."
                        className={`
                          w-full bg-slate-50 dark:bg-slate-800/80 border rounded-xl p-3.5 text-sm 
                          text-slate-900 dark:text-white placeholder:text-slate-400 
                          focus:outline-none focus:ring-2 transition-all resize-none
                          ${shippingAddress.length > 0 && !validationRules.isAddressValid 
                            ? 'border-red-300 focus:ring-red-500/50 dark:border-red-900' 
                            : 'border-slate-200 dark:border-slate-700 focus:ring-medical-500/50'
                          }
                        `}
                        rows={3}
                        maxLength={500}
                        disabled={isProcessing}
                        aria-invalid={!validationRules.isAddressValid}
                      />
                      {shippingAddress.length > 0 && !validationRules.isAddressValid && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          La dirección debe ser más descriptiva (min. 10 caract.)
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 📝 NOTAS / SÍNTOMAS */}
              {!cartAnalysis.isEmpty && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h4>
                      {cartAnalysis.hasServices ? t('label_symptoms') || 'Motivo de consulta' : 'Notas adicionales'} 
                      <span className="text-slate-400 font-normal text-xs ml-1.5">({t('optional') || 'Opcional'})</span>
                    </h4>
                  </div>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={cartAnalysis.hasServices 
                      ? "Ej. Me duele la espalda baja desde hace 3 días..." 
                      : "Instrucciones especiales para tu pedido..."}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500/50 transition-all resize-none"
                    rows={2}
                    maxLength={300}
                    disabled={isProcessing}
                  />
                </div>
              )}

              {/* 💰 SECCIÓN DE TOTALES */}
              {!cartAnalysis.isEmpty && (
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 space-y-4">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-sm">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">${total.toLocaleString()} MXN</span>
                  </div>

                  <Separator className="bg-slate-200 dark:bg-slate-700" />

                  <div className="flex flex-col pt-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm mb-1 uppercase tracking-wider opacity-80">
                      Total a Pagar
                    </span>

                    <div className="text-right mt-1">
                      {currencyCalculations.isForeignCurrency ? (
                        <>
                          <span className="text-4xl font-black text-slate-900 dark:text-white block leading-none tracking-tight" style={{ color: providerColor }}>
                            ≈ ${currencyCalculations.convertedTotal} <span className="text-xl font-bold opacity-80">{selectedCurrency}</span>
                          </span>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-end gap-1.5 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                            El cargo final en tu banco será de <strong>${total.toLocaleString()} MXN</strong>.
                          </div>
                        </>
                      ) : (
                        <span className="text-4xl font-black text-slate-900 dark:text-white block leading-none tracking-tight" style={{ color: providerColor }}>
                          ${total.toLocaleString()} <span className="text-xl font-bold opacity-80">MXN</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 🚀 BOTÓN DE CHECKOUT INTELIGENTE */}
              <Button
                onClick={handleCheckoutClick}
                disabled={!validationRules.isReady || isProcessing || cartAnalysis.isEmpty}
                className={`
                  w-full h-14 rounded-xl font-bold text-base shadow-sm transition-all duration-300 relative overflow-hidden
                  ${(!validationRules.isReady || isProcessing || cartAnalysis.isEmpty)
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-2 border-slate-200 dark:border-slate-700'
                    : 'text-white border-2 hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
                style={(!validationRules.isReady || isProcessing || cartAnalysis.isEmpty) ? {} : {
                  backgroundColor: providerColor,
                  borderColor: providerColor,
                  boxShadow: `0 10px 25px -5px ${providerColor}60`
                }}
              >
                {/* Lógica de Mensajes del Botón */}
                {isProcessing ? (
                  <span className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Procesando orden...
                  </span>
                ) : cartAnalysis.isEmpty ? (
                  <span className="flex items-center">Carrito vacío</span>
                ) : !validationRules.isTimeValid ? (
                  <span className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Selecciona horario
                  </span>
                ) : !validationRules.isAddressValid ? (
                  <span className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Ingresa dirección de envío
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceder al Pago Seguro
                    <Sparkles className="w-4 h-4 ml-2 opacity-80" />
                  </span>
                )}
              </Button>
              
              {/* Trust Badge */}
              {!cartAnalysis.isEmpty && validationRules.isReady && (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center gap-1.5 mt-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Conexión encriptada vía Stripe
                </p>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}