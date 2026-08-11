"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, ArrowLeft, Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/hooks/useBookingStore";

export default function GlobalCheckoutPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const { cart, getTotalPrice, removeFromCart, updateQuantity } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Pago simulado con éxito (Multi-proveedor no implementado en backend aún).");
    }, 1500);
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
