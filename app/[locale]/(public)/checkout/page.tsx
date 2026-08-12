"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, ArrowLeft, Loader2, ShieldCheck, CreditCard, Truck, MapPin, Store, Package } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { AnimatePresence, motion } from "framer-motion";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function GlobalCheckoutPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const { cart, getTotalPrice, removeFromCart, updateQuantity } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const themeColor = cart[0]?.providerThemeColor || "#059669";
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

  const hasPhysical = useMemo(() => cart.some((i) => i.type === "PRODUCT" && i.isDigital !== true), [cart]);

  const PICKUP_TIMES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ];

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    
    // Validación básica de logística
    if (hasPhysical) {
      if (shippingMethod === "DELIVERY") {
        if (!address.street || !address.city || !address.state || !address.zip) {
          alert("Por favor completa los datos obligatorios de la dirección de envío.");
          setIsProcessing(false);
          return;
        }
      } else {
        if (!pickupDate || !pickupTimeStr) {
          alert("Por favor selecciona fecha y hora de recolección.");
          setIsProcessing(false);
          return;
        }
      }
    }

    try {
      // AQUÍ IRÍA LA LLAMADA A TU BACKEND MULTI-PROVEEDOR
      // const response = await axios.post("/api/payments/checkout/cart", { cart, shippingMethod, address, ... });
      // const stripe = await stripePromise;
      // await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      
      setTimeout(() => {
        setIsProcessing(false);
        alert("Pago simulado con éxito. (Falta integrar endpoint de backend que devuelva Session ID de Stripe).");
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-24 pb-12 font-sans">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Finalizar Compra
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">No has agregado ningún servicio o producto.</p>
            <Link href="/discover">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6 font-bold">
                Explorar Servicios
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Resumen de Artículos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Resumen de tu pedido</h2>
                
                <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.type}`} className="pt-4 first:pt-0 flex flex-col sm:flex-row gap-4">
                      {/* Imagen */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin imagen</div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                            Proveedor: {item.providerName || "QuHealthy"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <p className="font-bold text-gray-900 dark:text-white">${item.price.toLocaleString()} MXN</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección de Logística (Opcional, solo si hay físicos) */}
              {hasPhysical && (
                <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Información de Entrega</h2>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setShippingMethod("DELIVERY")}
                      style={shippingMethod === "DELIVERY" ? { borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}10` } : {}}
                      className={`h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 transition-all ${
                        shippingMethod === "DELIVERY"
                          ? ""
                          : "border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                      <span className="text-xs font-bold">Envío a Domicilio</span>
                    </button>

                    <button
                      onClick={() => setShippingMethod("PICKUP")}
                      style={shippingMethod === "PICKUP" ? { borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}10` } : {}}
                      className={`h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 transition-all ${
                        shippingMethod === "PICKUP"
                          ? ""
                          : "border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      <Store className="w-5 h-5" />
                      <span className="text-xs font-bold">Recoger (Pickup)</span>
                    </button>
                  </div>

                  {shippingMethod === "DELIVERY" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2 relative">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Calle y Número *</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                              value={address.street}
                              onChange={(e) => {
                                setAddress({ ...address, street: e.target.value });
                                setQuery(e.target.value);
                              }}
                              placeholder="Ej. Av. Insurgentes Sur 123"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isAutocompleteLoading ? (
                                <QhSpinner size="sm" className="text-gray-400" />
                              ) : (
                                <MapPin className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Autocompletado de Google */}
                          <AnimatePresence>
                            {suggestions.length > 0 && address.street.length > 2 && (
                              <motion.ul
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden max-h-56 overflow-y-auto rounded-2xl custom-scrollbar"
                              >
                                {suggestions.map((sug) => {
                                  const placeId = sug.placeId || sug.place_id;
                                  if (!placeId) return null;
                                  return (
                                    <li
                                      key={placeId}
                                      onClick={() => handleSelectSuggestion(placeId, sug.description)}
                                      className="px-4 py-3 text-xs font-semibold text-gray-900 dark:text-white hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-start gap-2.5 transition-colors"
                                    >
                                      <MapPin
                                        className="w-4 h-4 mt-0.5 shrink-0"
                                        style={{ color: themeColor }}
                                      />
                                      <span>{sug.description}</span>
                                    </li>
                                  );
                                })}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Colonia</label>
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                            value={address.colony}
                            onChange={(e) => setAddress({ ...address, colony: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Código Postal *</label>
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                            value={address.zip}
                            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Ciudad *</label>
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Estado *</label>
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50 space-y-4">
                      <div className="flex gap-3">
                        <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Recolección en sucursal del proveedor</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-1">El proveedor te confirmará la dirección exacta al finalizar tu compra.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Fecha de Recolección</label>
                          <DatePicker
                            value={pickupDate}
                            onChange={setPickupDate}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date.getDay() === 0 ||
                              date.getDay() === 6
                            }
                            placeholder="Elige un día"
                            className="rounded-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-10 text-sm font-semibold"
                            popoverClassName="z-[100] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Hora Aproximada</label>
                          <Select value={pickupTimeStr} onValueChange={setPickupTimeStr}>
                            <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a]">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              {PICKUP_TIMES.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
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

            {/* Total y Pago */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-28">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Resumen del Pago</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">${getTotalPrice().toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Impuestos (Calculados)</span>
                    <span className="font-medium text-gray-900 dark:text-white">$0.00 MXN</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                      ${getTotalPrice().toLocaleString()} <span className="text-sm font-medium">MXN</span>
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full h-14 bg-black hover:bg-gray-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl font-bold text-base shadow-xl shadow-black/10 dark:shadow-emerald-900/20 mb-4"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pagar Ahora
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Pago seguro procesado por Stripe</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
