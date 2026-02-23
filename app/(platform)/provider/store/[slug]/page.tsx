"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  MessageCircle, 
  Instagram, 
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 🚀 IMPORTAMOS EL HOOK Y EL TIPO
import { useStorefront } from "@/hooks/useStorefront";
import { StorefrontItem } from "@/types/storefront";
import { useBookingStore } from "@/hooks/useBookingStore"; // 🚀 Importamos Zustand

export default function PublicStorePage() {
  const params = useParams(); // Hook nativo de Next.js
  const router = useRouter(); // 🚀 Inicializamos el router
  const slug = params?.slug as string; // Aseguramos que es un string
  
  const [activeTab, setActiveTab] = useState<'servicios' | 'paquetes'>('servicios');
  // 🚀 CONECTAMOS CON ZUSTAND (El estado ahora es global)
  const { cart, addToCart, setProvider, getTotalPrice } = useBookingStore();
  const totalCart = getTotalPrice();

  const { store, isLoading, isError } = useStorefront(slug);

  useEffect(() => {
    if (store && slug) {
      // 🚀 CORRECCIÓN: Usamos store.providerId tal cual lo define tu tipado
      setProvider(
        store.providerId, 
        slug, 
        store.displayName, 
        store.primaryColor || '#9333ea'
      );
    }
  }, [store, slug, setProvider]);

  const handleBook = (item: StorefrontItem) => {
    // 🚀 Pasamos el slug actual para que Zustand sepa de quién es la cita
    addToCart(item, slug);
  };
  // Helper para convertir el HEX del doctor a RGB (para los glows)
  const hexToRgb = (hex: string) => {
    if (!hex) return '147, 51, 234'; // Default purple
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.slice(0, 2), 16) || 147;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 51;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 234;
    return `${r}, ${g}, ${b}`;
  };

  // --- ESTADO 1: CARGANDO ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium animate-pulse">Preparando la tienda...</p>
      </div>
    );
  }

  // --- ESTADO 2: ERROR O NO ENCONTRADO (404 / marketplace_visible=false) ---
  if (isError || !store) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="p-4 bg-red-500/10 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-black mb-2">Tienda no disponible</h1>
        <p className="text-zinc-400 max-w-md">
          El proveedor que buscas no existe o su tienda se encuentra temporalmente inactiva.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="mt-8 border-white/10 text-zinc-300 hover:bg-white/5"
        >
          Regresar
        </Button>
      </div>
    );
  }

  // --- ESTADO 3: ÉXITO ---
  const safePrimaryColor = store.primaryColor || '#9333ea';
  const primaryRgb = hexToRgb(safePrimaryColor);

  return (
    <div className="min-h-screen bg-[#09090b] pb-32 font-sans selection:bg-purple-500/30 text-white">
      
      {/* --- HERO SECTION (Cinemático) --- */}
      <div className="relative pb-8">
        {/* Banner */}
        <div className="h-64 sm:h-80 w-full relative overflow-hidden">
          {store.bannerUrl ? (
            <img src={store.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative -mt-32 z-10">
          
          {/* Avatar Brillante */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse"
                style={{ backgroundColor: safePrimaryColor }}
              />
              <div className="relative w-36 h-36 rounded-full border-4 border-[#09090b] shadow-2xl overflow-hidden bg-zinc-900 flex-shrink-0">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/50">
                    {store.displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pb-2 space-y-3">
              <h1 className="text-4xl font-black text-white tracking-tight">
                {store.displayName}
              </h1>
              
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm font-medium">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md px-3 py-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1.5" />
                  {store.rating || '4.9'} ({store.reviewsCount || 'Nuevo'})
                </Badge>
                <Badge className="bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 backdrop-blur-md px-3 py-1.5">
                  <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                  Consultorio
                </Badge>
              </div>
            </div>
          </div>

          <p className="mt-8 text-zinc-400 leading-relaxed text-[15px] sm:text-base text-center sm:text-left max-w-2xl">
            {store.bio || "Bienvenido a nuestro consultorio digital. Estamos listos para atenderte."}
          </p>

          {/* Social Dock */}
          <div className="mt-8 flex justify-center sm:justify-start gap-3">
            {store.whatsappEnabled && (
              <Button className="rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            )}
            {store.instagramUrl && (
              <Button 
                onClick={() => window.open(store.instagramUrl, '_blank')}
                className="rounded-full bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-all"
              >
                <Instagram className="w-4 h-4 mr-2" /> Instagram
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- MENÚ TIPO PÍLDORA --- */}
      <div className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 pt-4 pb-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 w-fit mx-auto sm:mx-0">
            <button
              onClick={() => setActiveTab('servicios')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === 'servicios' ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
              style={activeTab === 'servicios' ? { backgroundColor: safePrimaryColor } : {}}
            >
              Servicios <Badge className="bg-black/20 text-white border-none px-1.5 py-0 min-w-0">{store.services?.length || 0}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('paquetes')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                activeTab === 'paquetes' ? "text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
              style={activeTab === 'paquetes' ? { backgroundColor: safePrimaryColor } : {}}
            >
              Paquetes <Sparkles className={cn("w-4 h-4", activeTab === 'paquetes' ? "text-yellow-300" : "text-zinc-600")} />
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          
          {/* VISTA: SERVICIOS */}
          {activeTab === 'servicios' && (
            <motion.div
              key="servicios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {store.services && store.services.length > 0 ? (
                store.services.map((service) => (
                  <div 
                    key={service.id} 
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-6 transition-all duration-300 overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at right top, ${safePrimaryColor}, transparent 50%)` }}
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                          {service.category && (
                            <Badge className="bg-white/10 text-zinc-300 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
                              {service.category}
                            </Badge>
                          )}
                          <span className="flex items-center text-xs font-semibold text-zinc-500">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {service.durationMinutes || 0} min
                          </span>
                        </div>
                        <h3 className="font-bold text-xl text-white group-hover:text-zinc-100 transition-colors">{service.name}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-md">{service.description}</p>
                      </div>
                      
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-4 sm:mt-0 gap-4 border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0">
                        <span className="text-2xl font-black text-white">${service.price}</span>
                        <Button 
                          onClick={() => handleBook(service)}
                          className="rounded-xl px-6 font-bold text-white transition-all transform hover:scale-105 shadow-xl hover:brightness-110"
                          style={{ 
                            backgroundColor: safePrimaryColor,
                            boxShadow: `0 8px 25px -5px rgba(${primaryRgb}, 0.5)`
                          }}
                        >
                          Agendar <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-white/5 rounded-3xl bg-white/5">
                  <p className="text-zinc-500 font-medium">No hay servicios disponibles por el momento.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA: PAQUETES */}
          {activeTab === 'paquetes' && (
            <motion.div
              key="paquetes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {store.packages && store.packages.length > 0 ? (
                store.packages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[2rem] p-1 transition-all shadow-2xl overflow-hidden group"
                  >
                    <div 
                      className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-xl"
                      style={{ backgroundColor: safePrimaryColor }}
                    />
                    
                    <div className="relative bg-[#09090b]/90 backdrop-blur-2xl rounded-[1.8rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-center z-10 border border-white/5">
                      <div className="space-y-3 w-full sm:w-auto flex-1">
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-bold uppercase tracking-widest text-[10px]">
                          Especial
                        </Badge>
                        <h3 className="font-black text-2xl text-white">{pkg.name}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-md">{pkg.description}</p>
                        
                        {/* Como en el DTO consolidado no tenemos el detalle individual, ponemos un genérico elegante */}
                        <ul className="space-y-2 mt-4">
                          <li className="flex items-center text-sm text-zinc-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-2" style={{ color: safePrimaryColor }} /> Incluye múltiples servicios
                          </li>
                          <li className="flex items-center text-sm text-zinc-300 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-2" style={{ color: safePrimaryColor }} /> Precio preferencial
                          </li>
                        </ul>
                      </div>

                      <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-white/5 sm:border-none">
                        <div className="text-left sm:text-right">
                          <span 
                            className="text-3xl font-black bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(to right, #fff, ${safePrimaryColor})` }}
                          >
                            ${pkg.price}
                          </span>
                        </div>
                        <Button 
                          onClick={() => handleBook(pkg)}
                          className="rounded-xl px-8 py-6 text-base font-black text-white shadow-2xl transition-transform hover:scale-105 hover:brightness-110"
                          style={{ 
                            backgroundColor: safePrimaryColor,
                            boxShadow: `0 0 30px -5px rgba(${primaryRgb}, 0.6)`
                          }}
                        >
                          Quiero esta promo
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-white/5 rounded-3xl bg-white/5">
                  <p className="text-zinc-500 font-medium">No hay paquetes o promociones activas.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- BOTTOM DOCK (Flotante Premium) --- */}
     <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 w-full z-50 px-4"
          >
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-[2rem] shadow-2xl p-3 flex items-center justify-between">
              <div className="flex flex-col pl-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Resumen de cita</span>
                <span className="font-black text-lg">
                  {cart.length} {cart.length === 1 ? 'ítem' : 'ítems'} • ${totalCart}
                </span>
              </div>
              <Button 
                onClick={() => router.push(`/patient/booking/${slug}`)} // 🚀 REDIRECCIÓN MÁGICA
                className="rounded-full px-8 py-6 font-black text-base shadow-xl transition-transform hover:scale-105 hover:brightness-110"
                style={{ backgroundColor: safePrimaryColor, color: '#fff' }}
              >
                Continuar al Pago <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}