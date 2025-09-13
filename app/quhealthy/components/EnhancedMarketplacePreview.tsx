"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, Smartphone, Tablet, Camera, Store, 
  Crown, Sparkles, Zap, Heart, Users 
} from 'lucide-react';

// --- Tipos para las Props del Componente ---
// (Puedes mover estos a un archivo de tipos compartido, ej. types/marketplace.ts)
interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  image?: string;
}

interface StaffMember {
  id: number;
  name: string;
  specialty: string;
  image?: string;
}

interface MarketplacePreviewProps {
  settings: {
    primaryColor?: string;
    secondaryColor?: string;
    bannerImageUrl?: string;
    storeLogoUrl?: string;
    storeName?: string;
    storeSlug?: string;
    customDescription?: string;
  };
  services: Service[];
  staff: StaffMember[];
  viewMode: 'mobile' | 'tablet' | 'desktop';
  setViewMode: (mode: 'mobile' | 'tablet' | 'desktop') => void;
}

// --- Componente de Vista Previa Mejorada (Completo y Corregido) ---
export const EnhancedMarketplacePreview: React.FC<MarketplacePreviewProps> = ({ 
  settings, 
  services, 
  staff, 
  viewMode = 'mobile', 
  setViewMode 
}) => {
  
  const getDeviceClasses = () => {
    switch(viewMode) {
      case 'desktop':
        return 'w-full aspect-[16/10] rounded-xl';
      case 'tablet':
        return 'w-full aspect-[4/3] rounded-xl';
      default:
        return 'w-full aspect-[9/19] rounded-3xl border-4 border-gray-700';
    }
  };

  return (
    <div className="sticky top-6">
      {/* Controles de Vista */}
      <div className="flex justify-center gap-2 mb-4">
        {[
          { key: 'mobile', icon: Smartphone, label: 'Móvil' },
          { key: 'tablet', icon: Tablet, label: 'Tablet' },
          { key: 'desktop', icon: Monitor, label: 'Desktop' }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key as 'mobile' | 'tablet' | 'desktop')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === key 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      
      {/* Contenedor del Dispositivo de Vista Previa */}
      <div className={`bg-gray-900 shadow-2xl p-2 ${getDeviceClasses()}`}>
        <div className="h-full w-full bg-white rounded-lg overflow-y-auto scrollbar-hide">
          {/* Hero Section */}
          <motion.div 
            className="relative h-40 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center bg-cover bg-center"
            style={{ 
              backgroundColor: settings.primaryColor,
              backgroundImage: settings.bannerImageUrl ? `url(${settings.bannerImageUrl})` : undefined
            }}
            animate={{ backgroundColor: settings.primaryColor }}
            transition={{ duration: 0.3 }}
          >
            {!settings.bannerImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-white"
              >
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Agrega tu banner</p>
              </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>

          {/* Profile Section */}
          <div className="p-4 -mt-12">
            <div className="flex items-end gap-4">
              <motion.div 
                className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-xl flex-shrink-0 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {settings.storeLogoUrl ? (
                  <img src={settings.storeLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Store className="w-10 h-10 text-white" />
                  </div>
                )}
              </motion.div>
              
              <div className="flex-1 pb-3 min-w-0">
                <motion.h2 
                  className="text-xl font-bold text-gray-800 truncate"
                  animate={{ color: settings.primaryColor }}
                >
                  {settings.storeName || 'Nombre de tu Tienda'}
                </motion.h2>
                <p className="text-sm text-gray-600 truncate">{settings.storeSlug ? `quhealthy.com/${settings.storeSlug}` : ''}</p>
              </div>
              
              <div className="pb-3 flex-shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              </div>
            </div>

            {/* About Section */}
            <motion.div 
              className="mt-6 p-4 rounded-xl border-2 border-dashed"
              style={{ 
                backgroundColor: `${settings.secondaryColor}1A`, // Opacidad al 10%
                borderColor: `${settings.secondaryColor}33`     // Opacidad al 20%
              }}
              animate={{ 
                backgroundColor: `${settings.secondaryColor}1A`,
                borderColor: `${settings.secondaryColor}33`
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: settings.secondaryColor }} />
                <h3 className="font-bold text-sm" style={{ color: settings.secondaryColor }}>
                  Sobre Nosotros
                </h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {settings.customDescription || 'Describe tu negocio aquí...'}
              </p>
            </motion.div>

            {/* Services Section */}
            <div className="mt-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Nuestros Servicios
              </h3>
              <div className="space-y-3">
                {services.slice(0, 2).map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                        {service.image ? (
                           <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                             <Heart className="w-6 h-6 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{service.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{service.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Staff Section */}
            {staff.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Nuestro Equipo
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {staff.slice(0, 2).map((member) => (
                    <motion.div key={member.id} className="text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-gray-200">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-medium text-xs text-gray-800">{member.name}</h4>
                      <p className="text-xs text-gray-600">{member.specialty}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 8 8"><circle cx={4} cy={4} r={3} /></svg>
          Vista previa en tiempo real
        </div>
      </div>
    </div>
  );
};