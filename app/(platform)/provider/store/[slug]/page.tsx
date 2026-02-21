"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  MessageCircle, 
  Instagram, 
  Globe, 
  Star,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ==========================================
// 1. MOCK DATA (Basado en tu Base de Datos Real)
// ==========================================
const mockStore = {
  provider_id: 15,
  display_name: "Thaly Falomir Beauty Spa",
  slug: "thalyfalomirbeautyspa",
  bio: "Somos un spa con mas de 20 años de experiencia brindando servicios de belleza de calidad, buscamos mejorar la calidad de vida de nuestros clientes brindando servicios innovadores y seguros.",
  logo_url: "https://storage.googleapis.com/quhealthy-public-media-prod/store-media/15/LOGO-5d86c818-037e-445d-8edc-888258ce3796.png",
  banner_url: "https://storage.googleapis.com/quhealthy-public-media-prod/store-media/15/BANNER-4403fb52-07e9-4daf-9e18-025ae0697cbf.png",
  primary_color: "#9333ea", // El color dinámico
  whatsapp_enabled: true,
  instagram_url: "https://instagram.com/thalyfalomir",
  rating: 4.9,
  reviewsCount: 128,
};

const mockServices = [
  { id: 1, name: "Masaje Reductivo", category: "Masajes", price: 500, duration: 45, description: "Masaje reductivo tonificante con maderoterapia." },
  { id: 2, name: "Limpieza Facial Profunda", category: "Faciales", price: 650, duration: 60, description: "Incluye extracción, alta frecuencia y mascarilla hidroplástica." },
];

const mockPackages = [
  { id: 101, name: "Pack Novias Relax", price: 1200, originalPrice: 1500, description: "Masaje relajante + Limpieza facial iluminadora. Ideal antes del gran día." },
];

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================
export default function PublicStorePage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'servicios' | 'paquetes'>('servicios');
  const [cart, setCart] = useState<{id: number, name: string, price: number}[]>([]);

  // Función para simular agregar al carrito/agendar
  const handleBook = (item: {id: number, name: string, price: number}) => {
    setCart([...cart, item]);
  };

  const totalCart = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans selection:bg-purple-200">
      
      {/* --- HERO SECTION (Banner + Logo) --- */}
      <div className="relative bg-white pb-6 shadow-sm">
        {/* Banner */}
        <div className="h-48 sm:h-64 w-full bg-gray-200 relative overflow-hidden">
          {mockStore.banner_url ? (
            <img src={mockStore.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-200" />
          )}
          {/* Overlay oscuro sutil para que el botón de back resalte */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Info del Perfil */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20 relative z-10">
            {/* Logo */}
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0">
              {mockStore.logo_url ? (
                <img src={mockStore.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-2xl">
                  {mockStore.display_name.charAt(0)}
                </div>
              )}
            </div>

            {/* Título y Badges */}
            <div className="flex-1 pb-2 space-y-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {mockStore.display_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {mockStore.rating} ({mockStore.reviewsCount})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Los Mochis, Sin.
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-6 text-gray-600 leading-relaxed text-sm sm:text-base">
            {mockStore.bio}
          </p>

          {/* Botones Sociales (WhatsApp, IG) */}
          <div className="mt-6 flex gap-3">
            {mockStore.whatsapp_enabled && (
              <Button variant="outline" className="rounded-xl border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            )}
            {mockStore.instagram_url && (
              <Button variant="outline" className="rounded-xl text-gray-600">
                <Instagram className="w-4 h-4 mr-2 text-pink-600" /> Instagram
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- MENÚ DE PESTAÑAS STICKY --- */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 mt-2">
        <div className="max-w-3xl mx-auto px-4 flex gap-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('servicios')}
            className={cn(
              "py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'servicios' ? "text-gray-900 border-gray-900" : "text-gray-500 border-transparent hover:text-gray-700"
            )}
            style={activeTab === 'servicios' ? { borderColor: mockStore.primary_color, color: mockStore.primary_color } : {}}
          >
            Servicios ({mockServices.length})
          </button>
          <button
            onClick={() => setActiveTab('paquetes')}
            className={cn(
              "py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
              activeTab === 'paquetes' ? "text-gray-900 border-gray-900" : "text-gray-500 border-transparent hover:text-gray-700"
            )}
            style={activeTab === 'paquetes' ? { borderColor: mockStore.primary_color, color: mockStore.primary_color } : {}}
          >
            Paquetes y Promos <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-none px-1.5 py-0 text-[10px]">🔥</Badge>
          </button>
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
              <h2 className="text-xl font-black text-gray-900 mb-4">Catálogo de Servicios</h2>
              {mockServices.map((service) => (
                <Card key={service.id} className="overflow-hidden border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">{service.description}</p>
                        <div className="flex items-center gap-3 pt-2">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium">
                            {service.category}
                          </Badge>
                          <span className="flex items-center text-xs text-gray-500 font-medium">
                            <Clock className="w-3 h-3 mr-1" /> {service.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-4 sm:mt-0 gap-4">
                        <span className="text-xl font-black text-gray-900">${service.price}</span>
                        <Button 
                          onClick={() => handleBook(service)}
                          className="rounded-full px-6 font-bold shadow-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: mockStore.primary_color, color: '#fff' }}
                        >
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* VISTA: PAQUETES */}
          {activeTab === 'paquetes' && (
            <motion.div
              key="paquetes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-black text-gray-900 mb-4">Promociones Exclusivas</h2>
              {mockPackages.map((pkg) => (
                <Card key={pkg.id} className="overflow-hidden border-pink-100 bg-gradient-to-br from-white to-pink-50/30 transition-all shadow-sm hover:shadow-md relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/10 rounded-full blur-3xl" />
                  <CardContent className="p-0 relative z-10">
                    <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                      <div className="space-y-2">
                        <h3 className="font-black text-xl text-gray-900">{pkg.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-lg">{pkg.description}</p>
                        <ul className="space-y-1 mt-2">
                          <li className="flex items-center text-sm text-gray-600 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Masaje Relajante
                          </li>
                          <li className="flex items-center text-sm text-gray-600 font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Limpieza Facial
                          </li>
                        </ul>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-4 sm:mt-0 gap-4 bg-white/50 p-4 sm:p-0 rounded-xl sm:bg-transparent">
                        <div className="text-right">
                          <span className="text-sm text-gray-400 line-through block">${pkg.originalPrice}</span>
                          <span className="text-2xl font-black text-pink-600 block">${pkg.price}</span>
                        </div>
                        <Button 
                          onClick={() => handleBook(pkg)}
                          className="rounded-full px-6 font-bold shadow-md shadow-pink-500/20 bg-pink-600 hover:bg-pink-700 text-white transition-transform hover:scale-105"
                        >
                          Agendar Promo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- BOTTOM FLOATING BAR (Agendar / Checkout) --- */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-50 p-4 sm:p-6"
          >
            <div className="max-w-3xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-gray-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tu Cita</span>
                <span className="font-black text-lg">
                  {cart.length} {cart.length === 1 ? 'servicio' : 'servicios'} • ${totalCart}
                </span>
              </div>
              <Button 
                className="rounded-xl px-8 font-black text-base shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: mockStore.primary_color, color: '#fff' }}
              >
                Continuar <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}