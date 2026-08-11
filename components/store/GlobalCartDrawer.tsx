"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useBookingStore } from "@/hooks/useBookingStore";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlobalCartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, getTotalPrice } = useBookingStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#050505] shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-800 dark:text-white" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Tu Carrito ({cart.length})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Agrega servicios o productos para comenzar.
                </p>
              </div>
              <Button onClick={closeCart} variant="outline" className="mt-4">
                Seguir Explorando
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.type}`}
                className="flex gap-4 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20"
              >
                {/* Item Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      Sin Imagen
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.providerName}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${item.price.toLocaleString()} MXN
                    </p>
                    
                    {/* Controls */}
                    {item.type === "PRODUCT" ? (
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-1">
                        <button 
                          onClick={() => updateQuantity(item.id, (item.cartQuantity || 1) - 1)}
                          disabled={(item.cartQuantity || 1) <= 1}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">
                          {item.cartQuantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, (item.cartQuantity || 1) + 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                        Servicio
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="self-start p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#080808]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total Estimado</span>
              <span className="text-xl font-black text-gray-900 dark:text-white">
                ${getTotalPrice().toLocaleString()} <span className="text-sm font-normal text-gray-500">MXN</span>
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full h-12 text-base font-bold bg-black hover:bg-gray-900 text-white rounded-xl shadow-xl shadow-black/10 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:shadow-emerald-900/20"
            >
              Proceder al Pago
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
