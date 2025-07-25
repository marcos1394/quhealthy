"use client";

import React from 'react';
import { User, Building2, Phone } from "lucide-react";
import { FormData, ServiceType } from '@/app/quhealthy/types/signup';
import EnhancedCategorySelection from "@/app/quhealthy/components/categoryselection";
import { TermsModal } from '@/app/quhealthy/components/signup/TermsModal';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { LocationData } from '@/app/quhealthy/types/location';

// --- SOLUCIÓN AL ERROR 'window is not defined' ---
// Importa el componente de mapa/ubicación de forma dinámica, desactivando el SSR.
const EnhancedLocationPickerWithNoSSR = dynamic(
  () => import('@/app/quhealthy/components/locationmapmodal').then(mod => mod.EnhancedLocationPicker),
  { 
    ssr: false,
    loading: () => <div className="h-48 flex justify-center items-center bg-gray-700/50 rounded-lg"><Loader2 className="w-8 h-8 animate-spin text-teal-400" /></div> 
  }
);
// ----------------------------------------------------

interface SignupStep2Props {
  formData: FormData;
  serviceType: ServiceType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // La prop ahora espera el objeto completo 'LocationData'
  onLocationSelect: (location: LocationData) => void; 
  onCategorySelect: (categoryId: number, tagId: number) => void;
}

export const SignupStep2: React.FC<SignupStep2Props> = ({ 
  formData, 
  serviceType, 
  handleInputChange, 
  onLocationSelect, 
  onCategorySelect 
}) => {
  
  const handleAcceptTerms = () => {
    const event = {
      target: { name: 'acceptTerms', type: 'checkbox', checked: true }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  };

  return (
    <div className="space-y-6">
      {/* --- Inputs de Nombre, Negocio y Teléfono (sin cambios) --- */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
        <input type="text" name="name" placeholder="Nombre completo" value={formData.name} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400" required />
      </div>
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
        <input type="text" name="businessName" placeholder="Nombre del consultorio o negocio" value={formData.businessName} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400" required />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
        <input type="tel" name="phone" placeholder="Teléfono de contacto" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400" required />
      </div>

      {/* --- Componentes de Mapa y Categoría (AHORA USANDO EL NUEVO) --- */}
      <EnhancedLocationPickerWithNoSSR onLocationSelect={onLocationSelect} />
      <EnhancedCategorySelection serviceType={serviceType} onCategorySelect={onCategorySelect} />

      {/* --- Términos y Condiciones (sin cambios) --- */}
      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          name="acceptTerms" 
          id="acceptTerms" 
          checked={formData.acceptTerms} 
          onChange={handleInputChange}
          className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400" 
          required 
        />
        <TermsModal onAccept={handleAcceptTerms}>
          <label className="text-sm text-gray-300 cursor-pointer">
            Acepto los <span className="text-purple-400 hover:underline">términos, condiciones y la política de privacidad</span>
          </label>
        </TermsModal>
      </div>
    </div>
  );
};