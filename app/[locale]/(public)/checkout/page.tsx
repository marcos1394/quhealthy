"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  Store,
  Trash2,
  Plus,
  Minus,
  Stethoscope,
  BookOpen,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useBookingStore, CartItem } from "@/hooks/useBookingStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { AnimatePresence, motion } from "framer-motion";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { paymentService } from "@/services/payment.service";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function GlobalCheckoutPage() {
  const t = useTranslations("Checkout");
  const tCart = useTranslations("Cart");
  const router = useRouter();

  const {
    cart,
    getTotalPrice,
    getTotalItemCount,
    removeFromCart,
    updateQuantity,
    getProviderGroups,
    hasServices,
  } = useBookingStore();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const themeColor = cart[0]?.providerColor || "#059669";

  // Logística state
  const [shippingMethod, setShippingMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [address, setAddress] = useState({
    street: "",
    colony: "",
    city: "",
    state: "",
    zip: "",
  });
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTimeStr, setPickupTimeStr] = useState("");

  const {
    setQuery,
    suggestions,
    setSuggestions,
    isLoading: isAutocompleteLoading,
  } = useGoogleAutocomplete();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectSuggestion = (placeId: string, description: string) => {
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

  const hasPhysical = useMemo(
    () => cart.some((i) => i.type === "PRODUCT" && (i as any).isDigital !== true),
    [cart]
  );
  const containsServices = hasServices();
  const providerGroups = getProviderGroups();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItemCount();

  const PICKUP_TIMES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ];

  const handleRemoveItem = (item: CartItem) => {
    removeFromCart(item.id);
    toast.info(
      <div className="flex items-center justify-between gap-2 text-xs font-medium">
        <span>{item.name} {tCart("item_removed")}</span>
        <button
          type="button"
          onClick={() => {
            useBookingStore.getState().addToCart(
              item,
              item.providerSlug || "",
              item.providerName,
              item.providerColor
            );
          }}
          className="font-bold underline text-white hover:text-emerald-200 cursor-pointer"
        >
          {tCart("undo")}
        </button>
      </div>,
      { autoClose: 3000 }
    );
  };

  const handleProcessPayment = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);

    // Validación de logística para productos físicos
    if (hasPhysical) {
      if (shippingMethod === "DELIVERY") {
        if (!address.street || !address.city || !address.state || !address.zip) {
          toast.error(t("error_incomplete_address"));
          setIsProcessing(false);
          return;
        }
      } else {
        if (!pickupDate || !pickupTimeStr) {
          toast.error(t("error_incomplete_pickup"));
          setIsProcessing(false);
          return;
        }
      }
    }

    try {
      let combinedPickupTime: string | undefined = undefined;
      if (hasPhysical && shippingMethod === "PICKUP" && pickupDate && pickupTimeStr) {
        const [hours, minutes] = pickupTimeStr.split(":");
        const startDateTime = new Date(pickupDate);
        startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        combinedPickupTime = startDateTime.toISOString().replace("Z", "");
      }

      const mappedItems = cart.map((item) => ({
        providerId: item.providerId,
        productId: item.id.toString(),
        productName: item.name,
        quantity: item.cartQuantity || 1,
        price: item.price,
        type: item.type,
      }));

      const payload = {
        items: mappedItems,
        currency: "MXN",
        shippingAddress: hasPhysical && shippingMethod === "DELIVERY" ? JSON.stringify(address) : undefined,
        pickupTime: combinedPickupTime,
      };

      const { checkoutUrl } = await paymentService.createGlobalCartCheckout(payload);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No se pudo obtener la URL de Stripe.");
      }
    } catch (error) {
      console.error(error);
      toast.error(t("error_payment_processing"));
      setIsProcessing(false);
    }
  };

  const getItemBadge = (type: string) => {
    switch (type) {
      case "SERVICE":
        return {
          label: t("badge_service"),
          icon: Stethoscope,
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40",
        };
      case "PACKAGE":
        return {
          label: t("badge_package"),
          icon: Package,
          className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/40",
        };
      case "PRODUCT":
        return {
          label: t("badge_product"),
          icon: ShoppingBag,
          className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/40",
        };
      case "COURSE":
        return {
          label: t("badge_course"),
          icon: BookOpen,
          className: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/40",
        };
      default:
        return {
          label: type,
          icon: ShoppingBag,
          className: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border-gray-200",
        };
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-50/60 dark:bg-[#050505] pt-24 pb-16 font-sans">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── ENCABEZADO DE CHECKOUT ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 shrink-0"
              title={t("back_to_cart")}
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span>{t("title")}</span>
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {tCart("items_count", { count: totalItems })}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
            <Lock className="w-3.5 h-3.5" />
            <span>{t("trust_encrypted")}</span>
          </div>
        </div>

        {/* ── ESTADO VACÍO ────────────────────────────────────────────── */}
        {cart.length === 0 ? (
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-700">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("empty_title")}</h2>
              <p className="text-xs text-gray-400 font-medium">{t("empty_desc")}</p>
            </div>
            <Link href="/discover" className="w-full pt-2">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 font-bold text-xs">
                {t("explore_services")}
              </Button>
            </Link>
          </div>
        ) : (
          /* ── GRID PRINCIPAL DE CHECKOUT ────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── COLUMNA IZQUIERDA: RESUMEN MULTIPROVEEDOR + LOGÍSTICA ─ */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* AVISO DE CITAS MÉDICAS SI HAY SERVICIOS */}
              {containsServices && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl p-4.5 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200 shadow-xs">
                  <Calendar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Tu orden incluye consultas o servicios médicos</p>
                    <p className="text-emerald-800/80 dark:text-emerald-300/80 text-[11px] leading-relaxed">
                      Al completar el pago, tu cita quedará reservada y podrás sincronizarla inmediatamente con tu calendario o gestionar tu consulta en línea.
                    </p>
                  </div>
                </div>
              )}

              {/* GRUPOS POR PROVEEDOR */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {t("order_summary_title")}
                  </h2>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {providerGroups.length} {providerGroups.length === 1 ? "proveedor" : "proveedores"}
                  </span>
                </div>

                {providerGroups.map((group, groupIdx) => (
                  <motion.div
                    layout
                    key={group.providerSlug || group.providerId || groupIdx}
                    className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4"
                  >
                    {/* Header del Proveedor */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/80">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: group.providerColor || "#059669" }}
                        />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {t("provider_section_title")}
                          </p>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {group.providerName}
                          </h3>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        Subtotal: ${group.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Artículos de este Proveedor */}
                    <div className="space-y-3 divide-y divide-gray-50 dark:divide-gray-800/50">
                      {group.items.map((item) => {
                        const badge = getItemBadge(item.type);
                        const BadgeIcon = badge.icon;
                        const qty = item.cartQuantity || 1;
                        const totalItemPrice = item.price * qty;

                        return (
                          <div
                            key={`${item.id}-${item.type}`}
                            className="pt-3 first:pt-0 flex gap-3.5 items-center"
                          >
                            {/* Imagen */}
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#151515] border border-gray-200/50 dark:border-gray-800 shrink-0 relative flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BadgeIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                              )}
                            </div>

                            {/* Detalle */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
                                    badge.className
                                  )}
                                >
                                  <BadgeIcon className="w-2.5 h-2.5" />
                                  {badge.label}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                                {item.name}
                              </h4>
                              <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                                ${totalItemPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                                <span className="text-[10px] text-gray-400 font-normal">
                                  (${item.price.toLocaleString()} x {qty})
                                </span>
                              </p>
                            </div>

                            {/* Controles de Cantidad & Eliminar */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {item.type === "PRODUCT" ? (
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#181818] rounded-xl p-0.5 border border-gray-200/60 dark:border-gray-700/60">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, qty - 1)}
                                    disabled={qty <= 1}
                                    className="w-6 h-6 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-mono font-bold text-gray-900 dark:text-white">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, qty + 1)}
                                    className="w-6 h-6 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item)}
                                className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{t("remove_item")}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── SECCIÓN DE LOGÍSTICA DE ENTREGA (SOLO SI HAY FÍSICOS) ─ */}
              {hasPhysical && (
                <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-600" />
                      <span>{t("delivery_section_title")}</span>
                    </h2>
                  </div>

                  {/* Toggle Delivery vs Pickup */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShippingMethod("DELIVERY")}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all cursor-pointer",
                        shippingMethod === "DELIVERY"
                          ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold"
                          : "border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 font-medium"
                      )}
                    >
                      <Truck className="w-5 h-5" />
                      <span className="text-xs">{t("tab_delivery")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod("PICKUP")}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all cursor-pointer",
                        shippingMethod === "PICKUP"
                          ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold"
                          : "border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 font-medium"
                      )}
                    >
                      <Store className="w-5 h-5" />
                      <span className="text-xs">{t("tab_pickup")}</span>
                    </button>
                  </div>

                  {/* Formulario de Envío a Domicilio */}
                  {shippingMethod === "DELIVERY" ? (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("address_street_label")}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 pr-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-emerald-600"
                            value={address.street}
                            onChange={(e) => {
                              setAddress({ ...address, street: e.target.value });
                              setQuery(e.target.value);
                            }}
                            placeholder={t("address_street_placeholder")}
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {isAutocompleteLoading ? (
                              <QhSpinner size="sm" className="text-gray-400" />
                            ) : (
                              <MapPin className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Sugerencias de Google Autocomplete */}
                        <AnimatePresence>
                          {suggestions.length > 0 && address.street.length > 2 && (
                            <motion.ul
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-56 overflow-y-auto rounded-2xl custom-scrollbar"
                            >
                              {suggestions.map((sug) => {
                                const placeId = sug.placeId || (sug as any).place_id;
                                if (!placeId) return null;
                                return (
                                  <li
                                    key={placeId}
                                    onClick={() => handleSelectSuggestion(placeId, sug.description)}
                                    className="px-4 py-3 text-xs font-semibold text-gray-900 dark:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-start gap-2.5 transition-colors"
                                  >
                                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                    <span>{sug.description}</span>
                                  </li>
                                );
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("address_colony_label")}
                          </label>
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-emerald-600"
                            value={address.colony}
                            onChange={(e) => setAddress({ ...address, colony: e.target.value })}
                            placeholder={t("address_colony_placeholder")}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("address_postal_code_label")}
                          </label>
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-emerald-600 font-mono"
                            value={address.zip}
                            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                            placeholder={t("address_postal_code_placeholder")}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("address_city_label")}
                          </label>
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-emerald-600"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder={t("address_city_placeholder")}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("address_state_label")}
                          </label>
                          <input
                            type="text"
                            className="w-full h-11 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-emerald-600"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            placeholder={t("address_state_placeholder")}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Ficha de Recolección en Sucursal (Pickup) */
                    <div className="p-4.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
                      <div className="flex items-start gap-3">
                        <Store className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                            {t("pickup_info_title")}
                          </p>
                          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                            {t("pickup_info_desc")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("pickup_date_label")}
                          </label>
                          <DatePicker
                            value={pickupDate}
                            onChange={setPickupDate}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date.getDay() === 0 ||
                              date.getDay() === 6
                            }
                            placeholder={t("pickup_date_placeholder")}
                            className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 text-xs font-semibold w-full"
                            popoverClassName="z-[100] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("pickup_time_label")}
                          </label>
                          <Select value={pickupTimeStr} onValueChange={setPickupTimeStr}>
                            <SelectTrigger className="w-full h-11 bg-white dark:bg-[#0a0a0a] rounded-2xl border-gray-200 dark:border-gray-800 text-xs">
                              <SelectValue placeholder={t("pickup_time_placeholder")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {PICKUP_TIMES.map((time) => (
                                <SelectItem key={time} value={time} className="rounded-xl text-xs font-mono">
                                  {time} hrs
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── COLUMNA DERECHA: RESUMEN DE PAGO & STRIPE ──────────── */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5 sticky top-28">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {t("payment_summary_title")}
                </h2>

                {/* Desglose Financiero */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <span>{t("subtotal")}</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <span>{t("taxes_note")}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {t("taxes_included")}
                    </span>
                  </div>

                  {hasPhysical && (
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                      <span>{tCart("estimated_shipping")}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {shippingMethod === "PICKUP" ? "Gratis (Recolección)" : "A coordinar con proveedor"}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-baseline">
                    <span className="font-extrabold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                      {t("total")}
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-bold text-gray-400 ml-1">MXN</span>
                    </div>
                  </div>
                </div>

                {/* Botón de Pago con Stripe */}
                <Button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <QhSpinner size="sm" className="text-white mr-1" />
                      <span>{t("btn_processing")}</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>{t("btn_pay_now")}</span>
                    </>
                  )}
                </Button>

                {/* Sellos de Confianza y Cumplimiento Médico */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t("trust_encrypted")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t("trust_compliance")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t("trust_guarantee")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
