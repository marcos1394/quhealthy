"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Stethoscope,
  Package,
  BookOpen,
  Sparkles,
  Calendar,
  ShieldCheck,
  Building2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useBookingStore, CartItem } from "@/hooks/useBookingStore";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export function GlobalCartDrawer() {
  const t = useTranslations("Cart");
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItemCount,
    hasServices,
    hasProducts,
  } = useBookingStore();

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar confirmación al cerrar drawer
  useEffect(() => {
    if (!isCartOpen) {
      setIsConfirmingClear(false);
    }
  }, [isCartOpen]);

  // Soporte de tecla Escape para cerrar el drawer inmediatamente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  const totalItems = getTotalItemCount();
  const totalPrice = getTotalPrice();
  const containsServices = hasServices();
  const containsProducts = hasProducts();

  // Encontrar el primer servicio con slug para agendar
  const firstService = useMemo(
    () => cart.find((item) => item.type === "SERVICE" || item.type === "PACKAGE"),
    [cart]
  );

  if (!mounted) return null;

  const handleCheckout = () => {
    closeCart();
    if (containsServices && firstService?.providerSlug) {
      router.push(`/patient/booking/${firstService.providerSlug}`);
    } else {
      router.push("/checkout");
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    removeFromCart(item.id);
    if (cart.length <= 1) {
      closeCart();
    }
    toast.info(
      <div className="flex items-center justify-between gap-2 text-xs font-medium">
        <span>{item.name} {t("item_removed")}</span>
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
          {t("undo")}
        </button>
      </div>,
      { autoClose: 3000 }
    );
  };

  const handleClearAll = () => {
    const previousCart = [...cart];
    clearCart();
    closeCart();
    setIsConfirmingClear(false);
    toast.info(
      <div className="flex items-center justify-between gap-2 text-xs font-medium">
        <span>{t("cart_cleared")}</span>
        <button
          type="button"
          onClick={() => {
            for (const item of previousCart) {
              useBookingStore.getState().addToCart(
                item,
                item.providerSlug || "",
                item.providerName,
                item.providerColor
              );
            }
          }}
          className="font-bold underline text-white hover:text-emerald-200 cursor-pointer"
        >
          {t("undo")}
        </button>
      </div>,
      { autoClose: 3500 }
    );
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
          icon: Sparkles,
          className: "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border-gray-200",
        };
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex justify-end font-sans select-none"
        >
          {/* ── BACKDROP CON BLUR SUAVE ──────────────────────────────── */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={closeCart}
          />

          {/* ── DRAWER PRINCIPAL CON FÍSICAS FLUIDAS ─────────────────── */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col h-full z-10 overflow-hidden"
          >
            {/* ── HEADER INTELIGENTE ──────────────────────────────────── */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                  <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{t("drawer_title")}</span>
                    {totalItems > 0 && (
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                        {totalItems}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">
                    {t("items_count", { count: totalItems })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {cart.length > 0 && (
                  <>
                    {isConfirmingClear ? (
                      <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 p-1 rounded-xl border border-red-200 dark:border-red-900/40 animate-in fade-in">
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          {t("clear_cart_btn")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsConfirmingClear(false)}
                          className="px-2 py-1 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white text-[11px] font-medium cursor-pointer"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClear(true)}
                        title={t("clear_cart")}
                        className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* ── AVISO HÍBRIDO (SERVICIOS + PRODUCTOS) ───────────────── */}
            {containsServices && containsProducts && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[11px]">{t("hybrid_notice_title")}</p>
                  <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-snug">
                    {t("hybrid_notice_desc")}
                  </p>
                </div>
              </div>
            )}

            {/* ── CONTENIDO DEL CARRITO ───────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3.5">
              {cart.length === 0 ? (
                /* ESTADO VACÍO INTERACTIVO */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-700 shadow-inner">
                    <ShoppingBag className="w-10 h-10 stroke-1" />
                  </div>

                  <div className="space-y-1.5 max-w-xs">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {t("empty_title")}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      {t("empty_subtitle")}
                    </p>
                  </div>

                  {/* Accesos rápidos de Descubrimiento */}
                  <div className="w-full space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeCart();
                        router.push("/discover");
                      }}
                      className="w-full h-11 px-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        {t("explore_doctors")}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeCart();
                        router.push("/market");
                      }}
                      className="w-full h-11 px-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#111] hover:bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-500" />
                        {t("explore_pharmacy")}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* LISTA DE ARTÍCULOS EN EL CARRITO */
                cart.map((item) => {
                  const badge = getItemBadge(item.type);
                  const BadgeIcon = badge.icon;
                  const itemQuantity = item.cartQuantity || 1;
                  const itemTotal = item.price * itemQuantity;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`${item.id}-${item.type}`}
                      className="group relative p-3.5 rounded-3xl border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#111] hover:border-gray-200 dark:hover:border-gray-700/80 shadow-xs transition-all flex gap-3.5"
                    >
                      {/* Imagen o Thumbnail */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#151515] border border-gray-200/50 dark:border-gray-800 shrink-0 relative flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <BadgeIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>

                      {/* Información y Controles */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          {/* Badge de Categoría */}
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

                          {/* Nombre del Artículo */}
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                            {item.name}
                          </h4>

                          {/* Nombre del Proveedor */}
                          {item.providerName && (
                            <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1 truncate">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.providerColor || "#059669" }}
                              />
                              <span className="truncate">{item.providerName}</span>
                            </p>
                          )}
                        </div>

                        {/* Fila de Precios y Controles de Cantidad */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-50 dark:border-gray-800/50">
                          {/* Precio */}
                          <div className="space-y-0.5">
                            <span className="font-mono font-black text-sm text-gray-900 dark:text-white">
                              ${itemTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {itemQuantity > 1 && (
                              <span className="text-[9px] text-gray-400 block font-mono">
                                (${item.price.toLocaleString()} x {itemQuantity})
                              </span>
                            )}
                          </div>

                          {/* Controles de Cantidad (Solo para productos físicos) */}
                          <div className="flex items-center gap-2">
                            {item.type === "PRODUCT" ? (
                              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#181818] rounded-xl p-0.5 border border-gray-200/60 dark:border-gray-700/60">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                                  disabled={itemQuantity <= 1}
                                  className="w-6 h-6 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-mono font-bold text-gray-900 dark:text-white">
                                  {itemQuantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                                  className="w-6 h-6 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : null}

                            {/* Botón Eliminar Ítem */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              title={t("item_removed")}
                              className="w-7 h-7 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* ── FOOTER TRANSPARENTE CON ACCIÓN INTELIGENTE ──────────── */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#080808]/90 backdrop-blur-md space-y-3.5 shrink-0">
                {/* Desglose de Precios */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 font-medium">
                    <span>{t("subtotal")}</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                      ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                    </span>
                  </div>

                  {containsProducts && (
                    <div className="flex justify-between items-center text-gray-400 text-[11px]">
                      <span>{t("estimated_shipping")}</span>
                      <span>{t("shipping_calculated_at_checkout")}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t("total")}
                    </span>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 ml-1">MXN</span>
                    </div>
                  </div>
                </div>

                {/* Botón Principal Inteligente */}
                <Button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 border-0 cursor-pointer"
                >
                  {containsServices ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>{t("btn_book_appointment")}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t("btn_checkout_products")}</span>
                    </>
                  )}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                {/* Sellos de Seguridad y Confianza */}
                <div className="flex items-center justify-center gap-4 text-[10px] font-medium text-gray-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    SSL 256-bit Encrypted
                  </span>
                  <span>•</span>
                  <span>NOM-004 / NOM-024</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
