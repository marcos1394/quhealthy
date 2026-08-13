"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  CreditCard,
  AlertCircle,
  ShoppingCart,
  FileText,
  Info,
  MonitorPlay,
  Package,
  Wallet,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { StorefrontItem } from "@/types/storefront";
import { appointmentService } from "@/services/appointment.service";
import { useHealthVault } from "@/hooks/useHealthVault";
import { usePackages } from "@/hooks/usePackages";
import { consumerWalletService } from "@/services/consumer-wallet.service";
import { cn } from "@/lib/utils";

interface BookingSummaryProps {
  cart: StorefrontItem[];
  total: number;
  providerColor?: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  isProcessing?: boolean;
  scheduleNow?: boolean;
  onCheckout: (
    symptoms: string,
    shippingAddress?: string,
    shareVaultAccess?: boolean,
    allowedDocumentIds?: string[],
    paymentMethod?: string,
    canAccessWomensHealth?: boolean
  ) => void;
}

export function BookingSummary({
  cart,
  total,
  providerColor,
  selectedDate,
  selectedTime,
  isProcessing = false,
  scheduleNow = true,
  onCheckout,
}: BookingSummaryProps) {
  const t = useTranslations("PatientBooking");

  // ── ESTADOS LOCALES REDUCER ──────────────────────────────────────────────
  const [
    {
      symptoms,
      shareVaultAccess,
      shareVaultMode,
      selectedDocumentIds,
      rates,
      selectedCurrency,
      isLoadingRates,
      selectedPaymentMethod,
      canAccessWomensHealth,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_SYMPTOMS":
          return { ...state, symptoms: action.payload };
        case "SET_SHAREVAULTACCESS":
          return { ...state, shareVaultAccess: action.payload };
        case "SET_SHAREVAULTMODE":
          return { ...state, shareVaultMode: action.payload };
        case "SET_SELECTEDDOCUMENTIDS":
          return { ...state, selectedDocumentIds: action.payload };
        case "SET_RATES":
          return { ...state, rates: action.payload };
        case "SET_SELECTEDCURRENCY":
          return { ...state, selectedCurrency: action.payload };
        case "SET_ISLOADINGRATES":
          return { ...state, isLoadingRates: action.payload };
        case "SET_SELECTEDPAYMENTMETHOD":
          return { ...state, selectedPaymentMethod: action.payload };
        case "SET_CANACCESSWOMENSHEALTH":
          return { ...state, canAccessWomensHealth: action.payload };
        default:
          return state;
      }
    },
    {
      symptoms: "",
      shareVaultAccess: true,
      shareVaultMode: "FULL",
      selectedDocumentIds: [],
      rates: { MXN: 1 },
      selectedCurrency: "MXN",
      isLoadingRates: true,
      selectedPaymentMethod: "CREDIT_CARD",
      canAccessWomensHealth: false,
    }
  );

  const setSymptoms = (val: any) =>
    dispatch({ type: "SET_SYMPTOMS", payload: val });
  const setShareVaultAccess = (val: any) =>
    dispatch({ type: "SET_SHAREVAULTACCESS", payload: val });
  const setShareVaultMode = (val: any) =>
    dispatch({ type: "SET_SHAREVAULTMODE", payload: val });
  const setSelectedDocumentIds = (val: any) =>
    dispatch({ type: "SET_SELECTEDDOCUMENTIDS", payload: val });
  const setRates = (val: any) => dispatch({ type: "SET_RATES", payload: val });
  const setSelectedCurrency = (val: any) =>
    dispatch({ type: "SET_SELECTEDCURRENCY", payload: val });
  const setIsLoadingRates = (val: any) =>
    dispatch({ type: "SET_ISLOADINGRATES", payload: val });
  const setSelectedPaymentMethod = (val: any) =>
    dispatch({ type: "SET_SELECTEDPAYMENTMETHOD", payload: val });
  const setCanAccessWomensHealth = (val: any) =>
    dispatch({ type: "SET_CANACCESSWOMENSHEALTH", payload: val });

  // Saldo de Billetera
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWallet = async () => {
      setIsLoadingWallet(true);
      try {
        const data = await consumerWalletService.getMyWallet();
        if (isMounted) setWalletBalance(data.balance || 0);
      } catch (error) {
        console.warn("Could not fetch wallet balance:", error);
      } finally {
        if (isMounted) setIsLoadingWallet(false);
      }
    };
    fetchWallet();
    return () => {
      isMounted = false;
    };
  }, []);

  const { documents, fetchDocuments, isLoading: isLoadingDocs } = useHealthVault();
  const { packages } = usePackages();

  useEffect(() => {
    if (
      shareVaultAccess &&
      shareVaultMode === "GRANULAR" &&
      documents.length === 0
    ) {
      fetchDocuments();
    }
  }, [shareVaultAccess, shareVaultMode, documents.length, fetchDocuments]);

  // Tasas de Cambio
  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const data = await appointmentService.getExchangeRates();
        if (isMounted) setRates(data);
      } catch (error) {
        if (isMounted) setRates({ MXN: 1, USD: 0.05, EUR: 0.045 });
      } finally {
        if (isMounted) setIsLoadingRates(false);
      }
    };
    fetchRates();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── CÁLCULOS MEMOIZADOS ──────────────────────────────────────────────
  const cartAnalysis = useMemo(() => {
    const hasServices = cart.some(
      (item) => item.type === "SERVICE" || item.type === "PACKAGE"
    );
    const hasProducts = cart.some((item) => item.type === "PRODUCT");
    const hasCourses = cart.some((item) => item.type === "COURSE");
    const isEmpty = cart.length === 0;

    return { hasServices, hasProducts, hasCourses, isEmpty };
  }, [cart]);

  const validationRules = useMemo(() => {
    const isTimeValid =
      cartAnalysis.hasServices && scheduleNow
        ? selectedDate !== null && selectedTime !== null
        : true;
    const paymentOk =
      selectedPaymentMethod === "CREDIT_CARD" ||
      (selectedPaymentMethod === "WALLET_BALANCE" && walletBalance >= total);
    const isReady = isTimeValid && !cartAnalysis.isEmpty && paymentOk;

    return { isTimeValid, isReady };
  }, [
    cartAnalysis,
    selectedDate,
    selectedTime,
    scheduleNow,
    selectedPaymentMethod,
    walletBalance,
    total,
  ]);

  const packageDetails = useMemo(() => {
    if (
      cart.length === 1 &&
      cart[0].type === "SERVICE" &&
      !cart[0].isPackage &&
      packages.length > 0
    ) {
      const itemId = cart[0].id;
      let availableCredits = 0;

      for (const pkg of packages) {
        const credit = pkg.creditsRemaining?.find((c) => c.serviceId === itemId);
        if (credit) {
          availableCredits += credit.quantity;
        }
      }

      const hasCredits = availableCredits > 0;
      const canUsePackage = scheduleNow && availableCredits >= (cart[0].quantity || 1);
      return { canUsePackage, availableCredits, hasCredits };
    }
    return { canUsePackage: false, availableCredits: 0, hasCredits: false };
  }, [cart, packages, scheduleNow]);

  const isUsingPackage = packageDetails.canUsePackage;
  const finalTotal = isUsingPackage ? 0 : total;

  const currencyCalculations = useMemo(() => {
    const currentRate = rates[selectedCurrency] || 1;
    const convertedTotal = (finalTotal * currentRate).toFixed(2);
    const isForeignCurrency = selectedCurrency !== "MXN";
    return { convertedTotal, isForeignCurrency };
  }, [finalTotal, rates, selectedCurrency]);

  const safeColor = providerColor || "#059669";

  const handleCheckoutClick = () => {
    if (validationRules.isReady && !isProcessing) {
      onCheckout(
        symptoms,
        undefined,
        shareVaultAccess,
        shareVaultMode === "GRANULAR" ? selectedDocumentIds : undefined,
        isUsingPackage ? "PACKAGE_BALANCE" : selectedPaymentMethod,
        canAccessWomensHealth
      );
    }
  };

  const renderItemBadge = (item: StorefrontItem) => {
    switch (item.type) {
      case "SERVICE":
      case "PACKAGE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-store-50 text-store-700 dark:bg-store-950/30 dark:text-store-400 border border-store-200 dark:border-store-900/40">
            <Clock className="w-3 h-3" strokeWidth={2} />
            {scheduleNow
              ? t("duration_min", { minutes: item.durationMinutes || 30 })
              : t("credit_badge")}
          </span>
        );
      case "COURSE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-store-50 text-store-700 dark:bg-store-950/30 dark:text-store-400 border border-store-200 dark:border-store-900/40">
            <MonitorPlay className="w-3 h-3" strokeWidth={2} />
            {t("digital_badge")}
          </span>
        );
      case "PRODUCT":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-store-50 text-store-700 dark:bg-store-950/30 dark:text-store-400 border border-store-200 dark:border-store-900/40">
            <Package className="w-3 h-3" strokeWidth={2} />
            {t("physical_badge", { quantity: item.quantity || 1 })}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full lg:w-[420px] font-sans"
    >
      <div className="sticky top-24">
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
          {/* ── HEADER DE RESUMEN ──────────────────────────────────────── */}
          <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl bg-store-50 dark:bg-store-950/30 border border-store-100 dark:border-store-900/30 flex items-center justify-center text-store-600 dark:text-store-400 shrink-0 shadow-xs"
              style={
                providerColor
                  ? { backgroundColor: `${safeColor}15`, color: safeColor }
                  : undefined
              }
            >
              <ShoppingCart className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                {cartAnalysis.hasServices && scheduleNow
                  ? t("cart_summary")
                  : t("order_summary")}
              </h3>
              <p className="text-xs font-medium text-gray-500">
                {cart.length === 0
                  ? t("empty_cart")
                  : t("selected_items_count", { count: cart.length })}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* ── SELECTOR DE DIVISAS ─────────────────────────────────── */}
            {!cartAnalysis.isEmpty && (
              <div className="flex bg-gray-50 dark:bg-[#050505] p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                {["MXN", "USD", "EUR"].map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setSelectedCurrency(cur)}
                    disabled={isLoadingRates}
                    className={cn(
                      "flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer",
                      selectedCurrency === cur
                        ? "bg-store-600 text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                    style={
                      selectedCurrency === cur && providerColor
                        ? { backgroundColor: safeColor }
                        : undefined
                    }
                  >
                    {isLoadingRates && selectedCurrency === cur ? (
                      <QhSpinner size="sm" className="text-white" />
                    ) : (
                      cur
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── LISTA DE ÍTEMS ───────────────────────────────────────── */}
            {cartAnalysis.isEmpty ? (
              <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-[#050505] space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
                <p className="text-xs font-semibold text-gray-400">
                  {t("empty_directory")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.map((item, idx) => (
                  <motion.div
                    key={`${item.id}-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      {renderItemBadge(item)}
                    </div>
                    <span className="text-sm font-bold font-mono text-gray-900 dark:text-white">
                      ${item.price.toLocaleString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── OBSERVACIONES / SÍNTOMAS ────────────────────────────── */}
            {!cartAnalysis.isEmpty && scheduleNow && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <FileText className="w-4 h-4 text-store-600 dark:text-store-400" strokeWidth={2} />
                    <span>
                      {cartAnalysis.hasServices
                        ? t("label_symptoms")
                        : t("additional_notes")}
                    </span>
                    <span className="text-[10px] font-normal text-gray-400">
                      [{t("optional")}]
                    </span>
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={
                      cartAnalysis.hasServices
                        ? t("symptoms_placeholder")
                        : t("instructions_placeholder")
                    }
                    className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-store-500/20 transition-all resize-none placeholder:text-gray-400"
                    rows={3}
                    maxLength={300}
                    disabled={isProcessing}
                  />
                </div>

                {/* COMPARTIR BÓVEDA MÉDICA */}
                <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="shareVaultAccess"
                      checked={shareVaultAccess}
                      onCheckedChange={(checked) => {
                        setShareVaultAccess(checked === true);
                        if (!checked) {
                          setShareVaultMode("FULL");
                          setSelectedDocumentIds([]);
                        }
                      }}
                      disabled={isProcessing}
                      className="mt-0.5 rounded-md border-gray-300 dark:border-gray-700 data-[state=checked]:bg-store-600 data-[state=checked]:border-store-600 w-4 h-4 shadow-xs"
                    />
                    <label
                      htmlFor="shareVaultAccess"
                      className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer space-y-0.5"
                    >
                      <p>{t("grant_vault_access")}</p>
                      <p className="text-[11px] font-normal text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t("grant_vault_desc")}
                      </p>
                    </label>
                  </div>

                  <AnimatePresence>
                    {shareVaultAccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-7 space-y-3 pt-1 overflow-hidden"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input
                              type="radio"
                              name="vaultMode"
                              checked={shareVaultMode === "FULL"}
                              onChange={() => setShareVaultMode("FULL")}
                              className="accent-store-600"
                            />
                            <span>{t("vault_full_access")}</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input
                              type="radio"
                              name="vaultMode"
                              checked={shareVaultMode === "GRANULAR"}
                              onChange={() => setShareVaultMode("GRANULAR")}
                              className="accent-store-600"
                            />
                            <span>{t("vault_granular_access")}</span>
                          </label>
                        </div>

                        {shareVaultMode === "GRANULAR" && (
                          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 max-h-48 overflow-y-auto space-y-3 custom-scrollbar">
                            <div className="flex items-start gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <Checkbox
                                    id="womensHealthPerm"
                                    checked={canAccessWomensHealth}
                                    onCheckedChange={(checked) => setCanAccessWomensHealth(checked === true)}
                                    disabled={isProcessing}
                                    className="mt-0.5 rounded-md border-gray-300 dark:border-gray-700 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 w-4 h-4"
                                />
                                <label htmlFor="womensHealthPerm" className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                                    <p>Módulo de Salud Femenina</p>
                                    <p className="text-[10px] text-gray-500 font-normal">Permite al médico visualizar tu historial de ciclo menstrual y predicciones.</p>
                                </label>
                            </div>
                            {isLoadingDocs ? (
                              <div className="flex justify-center py-3">
                                <QhSpinner size="sm" className="text-store-600" />
                              </div>
                            ) : documents.length === 0 ? (
                              <p className="text-xs font-semibold text-center text-gray-400 py-2">
                                {t("no_docs_indexed")}
                              </p>
                            ) : (
                              documents.map((doc) => (
                                <div key={doc.id} className="flex items-start gap-2.5">
                                  <Checkbox
                                    id={`doc-${doc.id}`}
                                    checked={(selectedDocumentIds || []).includes(doc.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedDocumentIds([...(selectedDocumentIds || []), doc.id]);
                                      } else {
                                        setSelectedDocumentIds(
                                          (selectedDocumentIds || []).filter((id: any) => id !== doc.id)
                                        );
                                      }
                                    }}
                                    className="mt-0.5 rounded-md border-gray-300 data-[state=checked]:bg-store-600 w-3.5 h-3.5"
                                  />
                                  <label
                                    htmlFor={`doc-${doc.id}`}
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer truncate flex-1"
                                  >
                                    {doc.title || doc.documentType}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ── ADVERTENCIA DE CRÉDITO EXISTENTE ────────────────────────────── */}
            {!scheduleNow && packageDetails.hasCredits && (
              <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 rounded-2xl p-4 text-xs font-medium text-amber-800 dark:text-amber-300 flex gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-0.5">
                    {t("existing_credit_warning_title")}
                  </h4>
                  <p className="leading-relaxed">
                    {t("existing_credit_warning_desc")}
                  </p>
                </div>
              </div>
            )}

            {/* ── SECCIÓN DE TOTALES Y PAGO ────────────────────────────── */}
            {!cartAnalysis.isEmpty && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>{t("subtotal_label")}</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    ${total.toLocaleString()} MXN
                  </span>
                </div>

                {isUsingPackage && (
                  <div className="flex justify-between items-center text-xs font-bold text-store-600 dark:text-store-400">
                    <span>{t("package_credit_applied")}</span>
                    <span className="font-mono">-${total.toLocaleString()} MXN</span>
                  </div>
                )}

                <div className="flex flex-col pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-500 mb-1">
                    {t("total_settlement")}
                  </span>

                  <div className="text-right">
                    {currencyCalculations.isForeignCurrency ? (
                      <>
                        <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                          ≈ ${currencyCalculations.convertedTotal}{" "}
                          <span className="text-sm font-sans font-medium text-gray-400">
                            {selectedCurrency}
                          </span>
                        </span>
                        <div className="text-[11px] font-medium text-gray-500 mt-2 flex items-start justify-end gap-2 bg-gray-50 dark:bg-[#050505] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 text-right leading-relaxed">
                          <Info className="w-4 h-4 text-store-600 shrink-0 mt-0.5" strokeWidth={2} />
                          <span>
                            {t("foreign_currency_notice", {
                              amount: finalTotal.toLocaleString(),
                            })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
                        ${finalTotal.toLocaleString()}{" "}
                        <span className="text-sm font-sans font-medium text-gray-400">
                          MXN
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Métodos de Pago */}
                {!isUsingPackage && finalTotal > 0 && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("payment_method_title")}
                    </h3>
                    <div className="space-y-2">
                      {/* Stripe */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("CREDIT_CARD")}
                        className={cn(
                          "w-full p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer shadow-xs text-left",
                          selectedPaymentMethod === "CREDIT_CARD"
                            ? "bg-store-50/40 dark:bg-store-950/20 border-store-500 dark:border-store-500/80 ring-2 ring-store-500/20"
                            : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:bg-gray-50/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-store-50 dark:bg-store-950/30 border border-store-100 dark:border-store-900/30 flex items-center justify-center text-store-600 dark:text-store-400 shrink-0">
                            <CreditCard className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {t("stripe_method")}
                          </span>
                        </div>
                        {selectedPaymentMethod === "CREDIT_CARD" && (
                          <CheckCircle2 className="w-5 h-5 text-store-600 dark:text-store-400 shrink-0" strokeWidth={2} />
                        )}
                      </button>

                      {/* QuWallet */}
                      <button
                        type="button"
                        onClick={() => {
                          if (walletBalance >= finalTotal) {
                            setSelectedPaymentMethod("WALLET_BALANCE");
                          }
                        }}
                        disabled={walletBalance < finalTotal}
                        className={cn(
                          "w-full p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer shadow-xs text-left",
                          selectedPaymentMethod === "WALLET_BALANCE"
                            ? "bg-store-50/40 dark:bg-store-950/20 border-store-500 dark:border-store-500/80 ring-2 ring-store-500/20"
                            : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-store-50 dark:bg-store-950/30 border border-store-100 dark:border-store-900/30 flex items-center justify-center text-store-600 dark:text-store-400 shrink-0">
                            <Wallet className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {t("quwallet_method")}
                              {isLoadingWallet && <QhSpinner size="sm" className="text-store-600" />}
                            </p>
                            <p className="text-[11px] font-medium text-gray-500 font-mono">
                              {t("wallet_balance", { amount: walletBalance.toLocaleString() })}
                            </p>
                          </div>
                        </div>

                        {walletBalance < finalTotal ? (
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/40">
                            {t("insufficient_balance")}
                          </span>
                        ) : (
                          selectedPaymentMethod === "WALLET_BALANCE" && (
                            <CheckCircle2 className="w-5 h-5 text-store-600 dark:text-store-400 shrink-0" strokeWidth={2} />
                          )
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🚀 BOTÓN DE CHECKOUT */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleCheckoutClick}
                disabled={
                  !validationRules.isReady ||
                  isProcessing ||
                  cartAnalysis.isEmpty
                }
                className="w-full h-12 rounded-xl bg-store-600 hover:bg-store-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  providerColor && validationRules.isReady && !isProcessing
                    ? { backgroundColor: safeColor }
                    : undefined
                }
              >
                {isProcessing ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("processing_transaction")}</span>
                  </>
                ) : cartAnalysis.isEmpty ? (
                  <span>{t("empty_directory_btn")}</span>
                ) : !validationRules.isTimeValid ? (
                  <>
                    <AlertCircle className="w-4 h-4" strokeWidth={2} />
                    <span>{t("select_time_btn")}</span>
                  </>
                ) : isUsingPackage ? (
                  <>
                    <Sparkles className="w-4 h-4" strokeWidth={2} />
                    <span>{t("confirm_package_btn")}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" strokeWidth={2} />
                    <span>{t("checkout_btn")}</span>
                  </>
                )}
              </Button>

              {/* Sello de Confianza */}
              {!cartAnalysis.isEmpty && validationRules.isReady && (
                <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] font-semibold text-gray-400 text-center">
                  <ShieldCheck className="w-4 h-4 text-store-600 dark:text-store-400 shrink-0" strokeWidth={2} />
                  <span>{t("encrypted_protocol")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}