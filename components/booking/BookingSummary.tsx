"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

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
  Info,
  MonitorPlay,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontItem } from "@/types/storefront";
import { appointmentService } from "@/services/appointment.service";
import { useHealthVault } from "@/hooks/useHealthVault";
import { usePackages } from "@/hooks/usePackages";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface BookingSummaryProps {
  cart: StorefrontItem[];
  total: number;
  providerColor: string; // Se mantiene por compatibilidad de API, pero la UI adopta el Manifiesto Monocromático
  selectedDate: Date | null;
  selectedTime: string | null;
  isProcessing?: boolean;
  scheduleNow?: boolean;
  onCheckout: (symptoms: string, shippingAddress?: string, shareVaultAccess?: boolean, allowedDocumentIds?: string[], paymentMethod?: string) => void;
}

export function BookingSummary({
  cart,
  total,
  providerColor,
  selectedDate,
  selectedTime,
  isProcessing = false,
  scheduleNow = true,
  onCheckout
}: BookingSummaryProps) {
  const t = useTranslations('PatientBooking');
  
  // ==========================================
  // ESTADOS LOCALES
  // ==========================================
    const [{ symptoms, shareVaultAccess, shareVaultMode, selectedDocumentIds, rates, selectedCurrency, isLoadingRates }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_SYMPTOMS': return { ...state, symptoms: typeof action.payload === 'function' ? action.payload(state.symptoms) : action.payload };
      case 'SET_SHAREVAULTACCESS': return { ...state, shareVaultAccess: typeof action.payload === 'function' ? action.payload(state.shareVaultAccess) : action.payload };
      case 'SET_SHAREVAULTMODE': return { ...state, shareVaultMode: typeof action.payload === 'function' ? action.payload(state.shareVaultMode) : action.payload };
      case 'SET_SELECTEDDOCUMENTIDS': return { ...state, selectedDocumentIds: typeof action.payload === 'function' ? action.payload(state.selectedDocumentIds) : action.payload };
      case 'SET_RATES': return { ...state, rates: typeof action.payload === 'function' ? action.payload(state.rates) : action.payload };
      case 'SET_SELECTEDCURRENCY': return { ...state, selectedCurrency: typeof action.payload === 'function' ? action.payload(state.selectedCurrency) : action.payload };
      case 'SET_ISLOADINGRATES': return { ...state, isLoadingRates: typeof action.payload === 'function' ? action.payload(state.isLoadingRates) : action.payload };
          default: return state;
        }
      },
      {
        symptoms: "", shareVaultAccess: true, shareVaultMode: 'FULL', selectedDocumentIds: [], rates: { MXN: 1 }, selectedCurrency: "MXN", isLoadingRates: true
      }
    );

    const setSymptoms = (val: any) => dispatch({ type: 'SET_SYMPTOMS', payload: val });
    const setShareVaultAccess = (val: any) => dispatch({ type: 'SET_SHAREVAULTACCESS', payload: val });
    const setShareVaultMode = (val: any) => dispatch({ type: 'SET_SHAREVAULTMODE', payload: val });
    const setSelectedDocumentIds = (val: any) => dispatch({ type: 'SET_SELECTEDDOCUMENTIDS', payload: val });
    const setRates = (val: any) => dispatch({ type: 'SET_RATES', payload: val });
    const setSelectedCurrency = (val: any) => dispatch({ type: 'SET_SELECTEDCURRENCY', payload: val });
    const setIsLoadingRates = (val: any) => dispatch({ type: 'SET_ISLOADINGRATES', payload: val });




  




  const { documents, fetchDocuments, isLoading: isLoadingDocs } = useHealthVault();
  const { packages, isLoading: isLoadingPackages } = usePackages();

  useEffect(() => {
    if (shareVaultAccess && shareVaultMode === 'GRANULAR' && documents.length === 0) {
      fetchDocuments();
    }
  }, [shareVaultAccess, shareVaultMode, documents.length, fetchDocuments]);

  // ==========================================
  // FETCH DE DIVISAS
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
  // CÁLCULOS MEMOIZADOS
  // ==========================================
  const cartAnalysis = useMemo(() => {
    const hasServices = cart.some(item => item.type === 'SERVICE' || item.type === 'PACKAGE');
    const hasProducts = cart.some(item => item.type === 'PRODUCT');
    const hasCourses = cart.some(item => item.type === 'COURSE');
    const isEmpty = cart.length === 0;

    return { hasServices, hasProducts, hasCourses, isEmpty };
  }, [cart]);

  const validationRules = useMemo(() => {
    const isTimeValid = (cartAnalysis.hasServices && scheduleNow) ? (selectedDate !== null && selectedTime !== null) : true;
    const isReady = isTimeValid && !cartAnalysis.isEmpty;

    return { isTimeValid, isReady };
  }, [cartAnalysis, selectedDate, selectedTime, scheduleNow]);

  const packageDetails = useMemo(() => {
    if (cart.length === 1 && (cart[0].type === 'SERVICE' || cart[0].type === 'PACKAGE')) {
      const itemId = cart[0].id;
      let availableCredits = 0;
      
      for (const pkg of packages) {
        const credit = pkg.creditsRemaining?.find(c => c.serviceId === itemId);
        if (credit) {
          availableCredits += credit.quantity;
        }
      }
      
      const canUsePackage = availableCredits >= (cart[0].quantity || 1);
      return { canUsePackage, availableCredits };
    }
    return { canUsePackage: false, availableCredits: 0 };
  }, [cart, packages]);

  const isUsingPackage = packageDetails.canUsePackage;
  const finalTotal = isUsingPackage ? 0 : total;

  const currencyCalculations = useMemo(() => {
    const currentRate = rates[selectedCurrency] || 1;
    const convertedTotal = (finalTotal * currentRate).toFixed(2);
    const isForeignCurrency = selectedCurrency !== "MXN";
    return { convertedTotal, isForeignCurrency };
  }, [finalTotal, rates, selectedCurrency]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleCheckoutClick = () => {
    if (!validationRules.isReady || isProcessing) return;

    const finalNotes = symptoms.trim() !== "" 
      ? symptoms.trim() 
      : `Orden Híbrida generada web. Ítems: ${cart.length}`;

    onCheckout(
      finalNotes, 
      undefined, 
      shareVaultAccess, 
      shareVaultMode === 'GRANULAR' ? selectedDocumentIds : undefined,
      isUsingPackage ? 'PACKAGE_BALANCE' : 'CREDIT_CARD'
    );
  };

  // ==========================================
  // HELPERS DE RENDERIZADO
  // ==========================================
  const safeColor = providerColor || '#000000';
  const renderItemIconAndBadge = (item: StorefrontItem) => {
    switch (item.type) {
      case 'SERVICE':
      case 'PACKAGE':
        return (
          <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-black dark:text-white w-fit">
            <Clock className="w-3 h-3" strokeWidth={2} />
            {scheduleNow ? `${item.durationMinutes || 30} MIN` : 'CRÉDITO'}
          </span>
        );
      case 'COURSE':
        return (
          <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-black dark:text-white w-fit">
            <MonitorPlay className="w-3 h-3" strokeWidth={2} />
            DIGITAL
          </span>
        );
      case 'PRODUCT':
      default:
        return (
          <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-black dark:text-white w-fit">
            <Package className="w-3 h-3" strokeWidth={2} />
            x{item.quantity || 1} FÍSICO
          </span>
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
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-[420px]"
    >
      <div className="sticky top-24">
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex flex-col">
            
            {/* 🟦 HEADER DE RESUMEN */}
            <div className="p-6 md:p-8 bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 flex items-start gap-5">
              <div 
                className="w-12 h-12 border flex items-center justify-center shrink-0 transition-colors"
                style={{ backgroundColor: safeColor, color: '#ffffff', borderColor: safeColor }}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                  {(cartAnalysis.hasServices && scheduleNow) ? (t('cart_summary') || 'Resumen de Cita') : 'Resumen de Orden'}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-500">
                  {cart.length === 0 ? 'Sin selección actual' : `${cart.length} ÍTEM(S) SELECCIONADO(S)`}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-8">
              
              {/* 💱 SELECTOR DE DIVISAS */}
              {!cartAnalysis.isEmpty && (
                <div className="flex border border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
                  {['MXN', 'USD', 'EUR'].map((cur, index) => (
                    <button
                      key={cur}
                      onClick={() => setSelectedCurrency(cur)}
                      disabled={isLoadingRates}
                      className={cn(
                        "flex-1 h-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center",
                        selectedCurrency === cur
                          ? "text-white"
                          : "text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#111]",
                        index !== 0 && "border-l border-black dark:border-white"
                      )}
                      style={selectedCurrency === cur ? { backgroundColor: safeColor } : {}}
                      aria-label={`Cambiar moneda a ${cur}`}
                    >
                      {isLoadingRates && selectedCurrency === cur ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                      ) : (
                        cur
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* 🛒 LISTA DE ÍTEMS DEL CARRITO */}
              {cartAnalysis.isEmpty ? (
                <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]">
                  <ShoppingCart className="w-6 h-6 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Directorio de adquisiciones vacío</p>
                </div>
              ) : (
                <div className="space-y-0 border-t border-gray-200 dark:border-gray-800">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex flex-col py-4 border-b border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase tracking-widest text-black dark:text-white truncate mb-2" title={item.name}>
                            {item.name}
                          </p>
                          {renderItemIconAndBadge(item)}
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-black dark:text-white">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 📝 NOTAS / SÍNTOMAS */}
              {(!cartAnalysis.isEmpty && scheduleNow) && (
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                      <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                      {cartAnalysis.hasServices ? t('label_symptoms') || 'Observaciones Clínicas' : 'Especificaciones Adicionales'}
                      <span className="font-light">[{t('optional') || 'OPCIONAL'}]</span>
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder={cartAnalysis.hasServices 
                        ? "EJ. CUADRO SINTOMATOLÓGICO, ANTECEDENTES RELEVANTES..." 
                        : "INSTRUCCIONES DE PROCESAMIENTO..."}
                      className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-none p-4 text-xs text-black dark:text-white focus:outline-none focus:ring-1 transition-colors resize-none placeholder:text-[9px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
                      style={{ '--tw-ring-color': safeColor, borderColor: symptoms ? safeColor : undefined } as React.CSSProperties}
                      rows={3}
                      maxLength={300}
                      disabled={isProcessing}
                    />
                  </div>
                  
                  {/* COMPARTIR BÓVEDA MÉDICA */}
                  <div className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="shareVaultAccess" 
                        checked={shareVaultAccess}
                        onCheckedChange={(checked) => {
                          setShareVaultAccess(checked === true);
                          if (!checked) {
                            setShareVaultMode('FULL');
                            setSelectedDocumentIds([]);
                          }
                        }}
                        disabled={isProcessing}
                        className="mt-0.5 rounded-none border-black dark:border-white transition-colors"
                        style={shareVaultAccess ? { backgroundColor: safeColor, borderColor: safeColor, color: '#ffffff' } : {}}
                      />
                      <label htmlFor="shareVaultAccess" className="text-[10px] uppercase tracking-widest text-black dark:text-white cursor-pointer">
                        <strong>Conceder Acceso a Expediente</strong>
                        <p className="text-[9px] text-gray-500 mt-1 font-light leading-relaxed">
                          Habilita la revisión de antecedentes y laboratorios por parte del especialista.
                        </p>
                      </label>
                    </div>

                    <AnimatePresence>
                      {shareVaultAccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-7 space-y-4 pt-2 overflow-hidden"
                        >
                          <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest cursor-pointer text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                              <input 
                                type="radio" 
                                name="vaultMode"
                                checked={shareVaultMode === 'FULL'}
                                onChange={() => setShareVaultMode('FULL')}
                                className="w-3.5 h-3.5"
                                style={{ accentColor: safeColor }}
                              />
                              Acceso Integral (Recomendado)
                            </label>
                            <label className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest cursor-pointer text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                              <input 
                                type="radio" 
                                name="vaultMode"
                                checked={shareVaultMode === 'GRANULAR'}
                                onChange={() => setShareVaultMode('GRANULAR')}
                                className="w-3.5 h-3.5"
                                style={{ accentColor: safeColor }}
                              />
                              Selección Granular
                            </label>
                          </div>

                          {shareVaultMode === 'GRANULAR' && (
                            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-4 max-h-48 overflow-y-auto">
                              {isLoadingDocs ? (
                                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" strokeWidth={1.5} /></div>
                              ) : documents.length === 0 ? (
                                <p className="text-[9px] font-bold uppercase tracking-widest text-center text-gray-500 py-4">Sin documentos indexados.</p>
                              ) : (
                                <div className="space-y-3">
                                  {documents.map(doc => (
                                    <div key={doc.id} className="flex items-start gap-3 group">
                                      <Checkbox 
                                        id={`doc-${doc.id}`}
                                        checked={selectedDocumentIds.includes(doc.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedDocumentIds((prev: any) => [...prev, doc.id]);
                                          } else {
                                            setSelectedDocumentIds((prev: any) => prev.filter((id: any) => id !== doc.id));
                                          }
                                        }}
                                        className="mt-0.5 rounded-none border-gray-400 data-[state=checked]:bg-black data-[state=checked]:border-black dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white"
                                      />
                                      <label htmlFor={`doc-${doc.id}`} className="text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white cursor-pointer flex-1 truncate transition-colors">
                                        {doc.title || doc.documentType}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* 💰 SECCIÓN DE TOTALES */}
              {!cartAnalysis.isEmpty && (
                <div className="border-t-2 border-black dark:border-white pt-6 mt-2 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <span>Subtotal Operativo</span>
                    <span className="text-black dark:text-white">${total.toLocaleString()} MXN</span>
                  </div>

                  {isUsingPackage && (
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      <span>Crédito de Paquete Aplicado</span>
                      <span>-${total.toLocaleString()} MXN</span>
                    </div>
                  )}

                  <div className="flex flex-col pt-2 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                      Liquidación Total
                    </span>

                    <div className="text-right">
                      {currencyCalculations.isForeignCurrency ? (
                        <>
                          <span className="text-3xl font-semibold text-black dark:text-white block tracking-tight">
                            ≈ ${currencyCalculations.convertedTotal} <span className="text-lg font-light text-gray-500">{selectedCurrency}</span>
                          </span>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-3 flex items-start justify-end gap-2 bg-gray-50 dark:bg-[#050505] p-3 border border-gray-200 dark:border-gray-800 text-right">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
                            <span>
                              El cargo definitivo será procesado en <strong>${finalTotal.toLocaleString()} MXN</strong>.
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-3xl font-semibold text-black dark:text-white block tracking-tight">
                          ${finalTotal.toLocaleString()} <span className="text-lg font-light text-gray-500">MXN</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 🚀 BOTÓN DE CHECKOUT INTELIGENTE */}
              <div className="pt-4">
                <Button
                  onClick={handleCheckoutClick}
                  disabled={!validationRules.isReady || isProcessing || cartAnalysis.isEmpty}
                  className={cn(
                    "w-full h-14 rounded-none text-[10px] font-bold uppercase tracking-widest transition-opacity flex items-center justify-center border-0",
                    (!validationRules.isReady || isProcessing || cartAnalysis.isEmpty)
                      ? "bg-gray-100 text-gray-400 dark:bg-[#111] dark:text-gray-600 cursor-not-allowed"
                      : "hover:opacity-90"
                  )}
                  style={(!validationRules.isReady || isProcessing || cartAnalysis.isEmpty) ? {} : { backgroundColor: providerColor, color: '#ffffff' }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-3 animate-spin" strokeWidth={2} />
                      Ejecutando Transacción...
                    </>
                  ) : cartAnalysis.isEmpty ? (
                    "Directorio Vacío"
                  ) : !validationRules.isTimeValid ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-3" strokeWidth={2} />
                      Definir Parámetro Temporal
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-3" strokeWidth={1.5} />
                      Inicializar Pasarela Segura
                    </>
                  )}
                </Button>
                
                {/* Trust Badge */}
                {!cartAnalysis.isEmpty && validationRules.isReady && (
                  <p className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center justify-center gap-2 mt-4">
                    <span className="w-1.5 h-1.5 border border-transparent" style={{ backgroundColor: providerColor }} />
                    Protocolo de Pago Cifrado
                  </p>
                )}
              </div>

            </div>
        </div>
      </div>
    </motion.div>
  );
}