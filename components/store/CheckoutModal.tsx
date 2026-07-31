"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-noninteractive-element-interactions */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect, useReducer } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Truck,
  FileText,
  Upload,
  X,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Store,
  MonitorPlay,
  Calendar as CalendarIcon,
  Package,
  CreditCard,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StorefrontItem } from "@/types/storefront";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import { storageService } from "@/services/storage.service";
import { useBookingStore } from "@/hooks/useBookingStore";
import { consumerWalletService } from "@/services/consumer-wallet.service";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: StorefrontItem[];
  onConfirm: (
    shippingAddress: string | undefined,
    prescriptionUrls: string | undefined,
    pickupTime: string | undefined,
    destinationState: string | undefined,
    paymentMethod: string
  ) => void;
  isProcessing: boolean;
  themeColor?: string;
}

interface AddressForm {
  street: string;
  colony: string;
  city: string;
  state: string;
  zip: string;
}

const EMPTY_ADDRESS: AddressForm = {
  street: "",
  colony: "",
  city: "",
  state: "",
  zip: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildAddressString(f: AddressForm): string {
  return `${f.street}, Col. ${f.colony}, CP ${f.zip}, ${f.city}, ${f.state}`.trim();
}

function isAddressComplete(f: AddressForm): boolean {
  return !!(f.street && f.colony && f.city && f.state && f.zip);
}

// ── Componente Principal ──────────────────────────────────────────────────────
export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onConfirm,
  isProcessing,
  themeColor = "#059669",
}: CheckoutModalProps) {
  const t = useTranslations("CheckoutModal");
  const { updateQuantity, removeFromCart } = useBookingStore();
  const [paymentMethod, setPaymentMethod] = useState<
    "CREDIT_CARD" | "WALLET_BALANCE"
  >("CREDIT_CARD");

  // Obtener saldo de la QuWallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      const fetchWallet = async () => {
        setIsLoadingWallet(true);
        try {
          const data = await consumerWalletService.getMyWallet();
          if (isMounted) setWalletBalance(data.balance || 0);
        } catch (error) {
          console.warn("No se pudo obtener el saldo de QuWallet:", error);
        } finally {
          if (isMounted) setIsLoadingWallet(false);
        }
      };
      fetchWallet();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Propiedades derivadas del carrito
  const hasPhysical = cart.some(
    (i) => i.type === "PRODUCT" && i.isDigital !== true
  );
  const itemsNeedingRx = cart.filter(
    (i) => i.type === "PRODUCT" && i.requiresPrescription === true
  );
  const needsPrescription = itemsNeedingRx.length > 0;

  const hasPackage = cart.some((i) => i.type === "PACKAGE");
  const hasService = cart.some((i) => i.type === "SERVICE");
  const isBooking = hasPackage || hasService;

  // Estado con Reducer
  const [
    {
      address,
      prescriptionUrls,
      uploadingId,
      uploadErrors,
      shippingMethod,
      pickupDate,
      pickupTimeStr,
    },
    dispatch,
  ] = useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_ADDRESS":
          return {
            ...state,
            address:
              typeof action.payload === "function"
                ? action.payload(state.address)
                : action.payload,
          };
        case "SET_PRESCRIPTIONURLS":
          return {
            ...state,
            prescriptionUrls:
              typeof action.payload === "function"
                ? action.payload(state.prescriptionUrls)
                : action.payload,
          };
        case "SET_UPLOADINGID":
          return {
            ...state,
            uploadingId:
              typeof action.payload === "function"
                ? action.payload(state.uploadingId)
                : action.payload,
          };
        case "SET_UPLOADERRORS":
          return {
            ...state,
            uploadErrors:
              typeof action.payload === "function"
                ? action.payload(state.uploadErrors)
                : action.payload,
          };
        case "SET_SHIPPINGMETHOD":
          return {
            ...state,
            shippingMethod:
              typeof action.payload === "function"
                ? action.payload(state.shippingMethod)
                : action.payload,
          };
        case "SET_PICKUPDATE":
          return {
            ...state,
            pickupDate:
              typeof action.payload === "function"
                ? action.payload(state.pickupDate)
                : action.payload,
          };
        case "SET_PICKUPTIMESTR":
          return {
            ...state,
            pickupTimeStr:
              typeof action.payload === "function"
                ? action.payload(state.pickupTimeStr)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      address: EMPTY_ADDRESS,
      prescriptionUrls: {},
      uploadingId: null,
      uploadErrors: {},
      shippingMethod: "DELIVERY",
      pickupDate: undefined,
      pickupTimeStr: "",
    }
  );

  const setAddress = (val: any) =>
    dispatch({ type: "SET_ADDRESS", payload: val });
  const setPrescriptionUrls = (val: any) =>
    dispatch({ type: "SET_PRESCRIPTIONURLS", payload: val });
  const setUploadingId = (val: any) =>
    dispatch({ type: "SET_UPLOADINGID", payload: val });
  const setUploadErrors = (val: any) =>
    dispatch({ type: "SET_UPLOADERRORS", payload: val });
  const setShippingMethod = (val: any) =>
    dispatch({ type: "SET_SHIPPINGMETHOD", payload: val });
  const setPickupDate = (val: any) =>
    dispatch({ type: "SET_PICKUPDATE", payload: val });
  const setPickupTimeStr = (val: any) =>
    dispatch({ type: "SET_PICKUPTIMESTR", payload: val });

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const PICKUP_TIMES = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  const {
    setQuery,
    suggestions,
    setSuggestions,
    isLoading: isAutocompleteLoading,
  } = useGoogleAutocomplete();

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * (item.cartQuantity || 1),
    0
  );

  // Verificación de disponibilidad de envío / receta / fondos
  const addressOk =
    !hasPhysical ||
    (shippingMethod === "PICKUP" && pickupDate && pickupTimeStr) ||
    (shippingMethod === "DELIVERY" && isAddressComplete(address));

  const rxOk =
    !needsPrescription || itemsNeedingRx.every((i) => !!prescriptionUrls[i.id]);

  const paymentOk =
    paymentMethod === "CREDIT_CARD" ||
    (paymentMethod === "WALLET_BALANCE" && walletBalance >= totalAmount);

  const canSubmit = addressOk && rxOk && paymentOk && !isProcessing;

  // Manejadores
  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev: any) => ({ ...prev, [field]: value }));
    if (field === "street") {
      setQuery(value);
    }
  };

  const handleSelectSuggestion = async (
    placeId: string,
    description: string
  ) => {
    setQuery("");
    setSuggestions([]);

    const parts = description.split(",").map((p) => p.trim());

    let street = "";
    let colony = "";
    let city = "";
    let state = "";
    let zip = "";

    if (parts.length > 0) street = parts[0];
    if (parts.length >= 5) {
      colony = parts[1];
      city = parts[parts.length - 3];
      state = parts[parts.length - 2];
    } else if (parts.length === 4) {
      city = parts[1];
      state = parts[2];
    } else if (parts.length === 3) {
      city = parts[0];
      state = parts[1];
    }

    setAddress({ street, colony, city, state, zip });
  };

  const handleFileChange = async (itemId: number, file: File | null) => {
    if (!file) return;
    setUploadingId(itemId);
    setUploadErrors((prev: any) => ({ ...prev, [itemId]: "" }));

    try {
      const { signedUrl, fileKey } =
        await storageService.getPrescriptionUploadUrl(file.type);
      await storageService.uploadDirectToCloud(file, signedUrl);
      setPrescriptionUrls((prev: any) => ({ ...prev, [itemId]: fileKey }));
    } catch (error) {
      console.error(error);
      setUploadErrors((prev: any) => ({
        ...prev,
        [itemId]: t("toast_rx_error"),
      }));
    } finally {
      setUploadingId(null);
    }
  };

  const handleConfirm = () => {
    const finalShippingAddress = hasPhysical
      ? shippingMethod === "PICKUP"
        ? "PICKUP"
        : buildAddressString(address)
      : undefined;

    const finalPrescriptionUrls =
      Object.keys(prescriptionUrls).length > 0
        ? JSON.stringify(prescriptionUrls)
        : undefined;

    const finalPickupTime =
      shippingMethod === "PICKUP" && pickupDate && pickupTimeStr
        ? `${format(pickupDate, "yyyy-MM-dd")}T${pickupTimeStr}:00`
        : undefined;

    const finalDestinationState =
      hasPhysical && shippingMethod === "DELIVERY" ? address.state : undefined;

    onConfirm(
      finalShippingAddress,
      finalPrescriptionUrls,
      finalPickupTime,
      finalDestinationState,
      paymentMethod
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 sm:p-6 font-sans select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Fondo Translúcido */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel Modal Flotante */}
        <motion.div
          className="relative z-10 w-full sm:max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col shadow-2xl max-h-[90vh] overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {hasPhysical
                  ? t("title_order_finalization")
                  : isBooking
                  ? t("title_booking_confirmation")
                  : t("title_contract_finalization")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {[
                  hasPhysical && t("subtitle_logistics"),
                  needsPrescription && t("subtitle_clinical"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Contenido Desplazable */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8 space-y-8">
            {/* ── SECCIÓN 0: RESUMEN DE ÍTEMS ──────────────────────────── */}
            <section className="space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{
                    backgroundColor:
                      themeColor !== "#ffffff" ? themeColor : "#059669",
                  }}
                >
                  <Package className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("section_items_summary")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("section_items_desc")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 flex items-center justify-center overflow-hidden relative shadow-2xs">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0";
                            }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center z-0 text-gray-400">
                          {item.type === "PACKAGE" ? (
                            <Package className="w-5 h-5" strokeWidth={1.5} />
                          ) : item.type === "SERVICE" ? (
                            <CalendarIcon className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <MonitorPlay className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {item.name}
                        </span>
                        <span
                          className="text-[11px] font-bold"
                          style={{
                            color:
                              themeColor !== "#ffffff" ? themeColor : "#059669",
                          }}
                        >
                          {item.type === "PACKAGE"
                            ? t("type_package")
                            : item.type === "SERVICE"
                            ? t("type_service")
                            : item.isDigital
                            ? t("type_digital")
                            : t("type_physical")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {item.type === "PRODUCT" ? (
                        <div className="flex items-center h-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.cartQuantity && item.cartQuantity > 1) {
                                updateQuantity(item.id, item.cartQuantity - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-bold font-mono text-gray-900 dark:text-white">
                            {item.cartQuantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                (item.cartQuantity || 1) + 1
                              )
                            }
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                          1x
                        </span>
                      )}

                      <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white min-w-[70px] text-right">
                        ${(item.price * (item.cartQuantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECCIÓN 1: DIRECCIÓN O RECOLECCIÓN ───────────────────── */}
            {hasPhysical && (
              <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{
                      backgroundColor:
                        themeColor !== "#ffffff" ? themeColor : "#059669",
                    }}
                  >
                    <Truck className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                      {t("section_shipping_title")}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("section_shipping_desc")}
                    </p>
                  </div>
                </div>

                {/* Métodos de Entrega */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={cn(
                      "p-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all border font-bold text-xs shadow-2xs cursor-pointer",
                      shippingMethod === "DELIVERY"
                        ? "text-white border-transparent shadow-xs"
                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
                    )}
                    style={
                      shippingMethod === "DELIVERY"
                        ? {
                            backgroundColor:
                              themeColor !== "#ffffff" ? themeColor : "#059669",
                          }
                        : {}
                    }
                    onClick={() => setShippingMethod("DELIVERY")}
                  >
                    <Truck className="w-4 h-4" strokeWidth={2} />
                    <span>{t("method_delivery")}</span>
                  </button>

                  <button
                    type="button"
                    className={cn(
                      "p-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all border font-bold text-xs shadow-2xs cursor-pointer",
                      shippingMethod === "PICKUP"
                        ? "text-white border-transparent shadow-xs"
                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
                    )}
                    style={
                      shippingMethod === "PICKUP"
                        ? {
                            backgroundColor:
                              themeColor !== "#ffffff" ? themeColor : "#059669",
                          }
                        : {}
                    }
                    onClick={() => setShippingMethod("PICKUP")}
                  >
                    <Store className="w-4 h-4" strokeWidth={2} />
                    <span>{t("method_pickup")}</span>
                  </button>
                </div>

                {/* Formulario Domicilio */}
                <AnimatePresence mode="wait">
                  {shippingMethod === "DELIVERY" && (
                    <motion.div
                      key="delivery"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden pt-2"
                    >
                      <div className="relative">
                        <InputField
                          label={t("label_street")}
                          placeholder={t("placeholder_street")}
                          value={address.street}
                          onChange={(v) => handleAddressChange("street", v)}
                          icon={
                            isAutocompleteLoading ? (
                              <QhSpinner size="sm" className="text-gray-400" />
                            ) : (
                              <MapPin className="w-4 h-4 text-gray-400" />
                            )
                          }
                        />

                        {/* Autocompletado de Google */}
                        <AnimatePresence>
                          {suggestions.length > 0 && address.street.length > 2 && (
                            <motion.ul
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-56 overflow-y-auto rounded-2xl custom-scrollbar"
                            >
                              {suggestions.map((sug) => (
                                <li
                                  key={sug.place_id}
                                  onClick={() =>
                                    handleSelectSuggestion(
                                      sug.place_id,
                                      sug.description
                                    )
                                  }
                                  className="px-4 py-3 text-xs font-semibold text-gray-900 dark:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-start gap-2.5 transition-colors"
                                >
                                  <MapPin
                                    className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                    strokeWidth={2}
                                  />
                                  <span className="leading-relaxed">
                                    {sug.description}
                                  </span>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label={t("label_colony")}
                          placeholder={t("placeholder_colony")}
                          value={address.colony}
                          onChange={(v) => handleAddressChange("colony", v)}
                        />
                        <InputField
                          label={t("label_zip")}
                          placeholder={t("placeholder_zip")}
                          value={address.zip}
                          onChange={(v) => handleAddressChange("zip", v)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label={t("label_city")}
                          placeholder={t("placeholder_city")}
                          value={address.city}
                          onChange={(v) => handleAddressChange("city", v)}
                        />
                        <InputField
                          label={t("label_state")}
                          placeholder={t("placeholder_state")}
                          value={address.state}
                          onChange={(v) => handleAddressChange("state", v)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Formulario PICKUP */}
                  {shippingMethod === "PICKUP" && (
                    <motion.div
                      key="pickup"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden pt-2"
                    >
                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        {t("pickup_notice")}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {t("label_pickup_date")}
                          </label>
                          <DatePicker
                            value={pickupDate}
                            onChange={setPickupDate}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date.getDay() === 0 ||
                              date.getDay() === 6
                            }
                            placeholder={t("placeholder_pickup_date")}
                            className="rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] h-11 text-xs font-semibold"
                            popoverClassName="z-[100] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {t("label_pickup_time")}
                          </label>
                          <Select
                            value={pickupTimeStr}
                            onValueChange={setPickupTimeStr}
                          >
                            <SelectTrigger className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] h-11 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 shadow-2xs">
                              <SelectValue placeholder={t("placeholder_pickup_time")} />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 z-[100] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] custom-scrollbar font-sans text-xs">
                              {PICKUP_TIMES.map((time) => (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  className="text-xs font-semibold cursor-pointer rounded-xl"
                                >
                                  {time} HRS
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Confirmación Dirección */}
                {shippingMethod === "DELIVERY" && isAddressComplete(address) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-center gap-3 shadow-2xs"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                      strokeWidth={2}
                    />
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
                      {buildAddressString(address)}
                    </p>
                  </motion.div>
                )}
              </section>
            )}

            {/* ── SECCIÓN 2: RECETAS MÉDICAS ───────────────────────────── */}
            {needsPrescription && (
              <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{
                      backgroundColor:
                        themeColor !== "#ffffff" ? themeColor : "#059669",
                    }}
                  >
                    <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                      {t("section_rx_title")}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("section_rx_desc")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {itemsNeedingRx.map((item) => {
                    const uploaded = !!prescriptionUrls[item.id];
                    const isUploading = uploadingId === item.id;
                    const error = uploadErrors[item.id];

                    return (
                      <div
                        key={item.id}
                        className="border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl shadow-2xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                          <div className="space-y-0.5">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            {item.activeIngredient && (
                              <p className="text-[11px] font-medium text-gray-500">
                                {t("rx_active_ingredient", {
                                  ingredient: item.activeIngredient,
                                })}
                              </p>
                            )}
                          </div>

                          {uploaded && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                              <CheckCircle2
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                              <span>{t("rx_verified_badge")}</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current[item.id]?.click()
                          }
                          disabled={isUploading}
                          className={cn(
                            "w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs",
                            uploaded
                              ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/50"
                          )}
                        >
                          {isUploading ? (
                            <QhSpinner
                              size="md"
                              className="text-emerald-600 dark:text-emerald-400"
                            />
                          ) : uploaded ? (
                            <CheckCircle2
                              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                              strokeWidth={2}
                            />
                          ) : (
                            <Upload
                              className="w-6 h-6 text-gray-400"
                              strokeWidth={1.5}
                            />
                          )}

                          <span className="text-xs font-bold text-gray-900 dark:text-white text-center">
                            {isUploading
                              ? t("rx_upload_btn_processing")
                              : uploaded
                              ? t("rx_upload_btn_replace")
                              : t("rx_upload_btn_attach")}
                          </span>

                          <span className="text-[10px] font-medium text-gray-400">
                            {t("rx_upload_file_types")}
                          </span>
                        </button>

                        <input
                          ref={(el) => {
                            fileInputRefs.current[item.id] = el;
                          }}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(
                              item.id,
                              e.target.files?.[0] ?? null
                            )
                          }
                        />

                        {error && (
                          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <AlertCircle
                              className="w-4 h-4 shrink-0"
                              strokeWidth={2}
                            />
                            <span>{error}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start gap-3">
                  <FileText
                    className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5"
                    strokeWidth={2}
                  />
                  <p className="text-xs font-medium text-emerald-900 dark:text-emerald-300 leading-relaxed">
                    {t("rx_privacy_note")}
                  </p>
                </div>
              </section>
            )}

            {/* ── SECCIÓN 3: MÉTODO DE PAGO ────────────────────────────── */}
            <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{
                    backgroundColor:
                      themeColor !== "#ffffff" ? themeColor : "#059669",
                  }}
                >
                  <CreditCard className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("section_payment_title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t("section_payment_desc")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tarjeta / Pasarela */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT_CARD")}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all text-left shadow-2xs cursor-pointer",
                    paymentMethod === "CREDIT_CARD"
                      ? "border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30"
                  )}
                >
                  <CreditCard
                    className={cn(
                      "w-5 h-5",
                      paymentMethod === "CREDIT_CARD"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400"
                    )}
                    strokeWidth={2}
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {t("payment_stripe")}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400 block">
                      {t("payment_stripe_desc")}
                    </span>
                  </div>
                </button>

                {/* QuWallet */}
                <button
                  type="button"
                  onClick={() => {
                    if (walletBalance >= totalAmount)
                      setPaymentMethod("WALLET_BALANCE");
                  }}
                  disabled={walletBalance < totalAmount}
                  className={cn(
                    "p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all text-left shadow-2xs cursor-pointer",
                    paymentMethod === "WALLET_BALANCE"
                      ? "border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Wallet
                    className={cn(
                      "w-5 h-5",
                      paymentMethod === "WALLET_BALANCE"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400"
                    )}
                    strokeWidth={2}
                  />

                  <div className="space-y-0.5 w-full">
                    <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
                      <span>{t("payment_wallet")}</span>
                      {isLoadingWallet && (
                        <QhSpinner
                          size="sm"
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      )}
                    </span>

                    <span className="text-[11px] font-mono font-medium text-gray-400 block">
                      {t("payment_wallet_balance", {
                        balance: walletBalance.toLocaleString(),
                      })}
                    </span>

                    {walletBalance < totalAmount && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block pt-0.5">
                        {t("payment_wallet_insufficient")}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Pie del Modal / CTA de Pago */}
          <div className="shrink-0 p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xl relative z-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {t("total_label")}
              </span>
              <span className="text-2xl font-mono font-black text-gray-900 dark:text-white tracking-tight">
                ${totalAmount.toLocaleString()}{" "}
                <span className="text-xs font-bold text-gray-400 font-sans">
                  MXN
                </span>
              </span>
            </div>

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!canSubmit}
              className="w-full rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 h-11 border-0 cursor-pointer flex items-center justify-center gap-2"
              style={
                !canSubmit
                  ? {}
                  : {
                      backgroundColor:
                        themeColor !== "#ffffff" ? themeColor : "#059669",
                      color: "#ffffff",
                    }
              }
            >
              {isProcessing ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_processing")}</span>
                </>
              ) : (
                <span>{t("btn_pay")}</span>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Subcomponente: Campo de Entrada Reutilizable ──────────────────────────────
function InputField({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] h-11 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs",
            icon ? "pl-10 pr-4" : "px-4"
          )}
        />
      </div>
    </div>
  );
}