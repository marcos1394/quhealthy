"use client";

import React from 'react';
import { User, Building2, Phone } from "lucide-react";
import { FormData, ServiceType } from '@/app/quhealthy/types/signup'; // Asegúrate que la ruta a tus tipos sea correcta
import LocationMapModal from "@/app/quhealthy/components/locationmapmodal"; // Asegúrate que la ruta sea correcta
import EnhancedCategorySelection from "@/app/quhealthy/components/categoryselection"; // Asegúrate que la ruta sea correcta
import { TermsModal } from './TermsModal'; // Importa el nuevo modal

interface SignupStep2Props {
  formData: FormData;
  serviceType: ServiceType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onCategorySelect: (categoryId: number, tagId: number) => void;
}

export const SignupStep2: React.FC<SignupStep2Props> = ({ 
  formData, 
  serviceType, 
  handleInputChange, 
  onLocationSelect, 
  onCategorySelect 
}) => {
  
  // Esta función se pasará al modal. Cuando el usuario acepte los términos,
  // se llamará a esta función para marcar la casilla en el formulario.
  const handleAcceptTerms = () => {
    // Simulamos un evento de input para actualizar el estado del formulario en la página padre
    const event = {
      target: { 
        name: 'acceptTerms', 
        type: 'checkbox', 
        checked: true 
      }
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

      {/* --- Componentes de Mapa y Categoría (sin cambios) --- */}
      <LocationMapModal onLocationSelect={onLocationSelect} />
      <EnhancedCategorySelection serviceType={serviceType} onCategorySelect={onCategorySelect} />

      {/* --- INICIO DE LA INTEGRACIÓN DEL MODAL --- */}
      <div className="flex items-center gap-2 pt-2">
        <input 
          type="checkbox" 
          name="acceptTerms" 
          id="acceptTerms" 
          checked={formData.acceptTerms} 
          onChange={handleInputChange} // Permite al usuario desmarcar la casilla si lo desea
          className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400" 
          required 
        />
        {/* El componente Modal envuelve el texto clickeable */}
        <TermsModal onAccept={handleAcceptTerms}>
          <label htmlFor="acceptTerms-trigger" className="text-sm text-gray-300 cursor-pointer">
            Acepto los <span className="text-purple-400 hover:underline">términos, condiciones y la política de privacidad</span>
          </label>
        </TermsModal>
      </div>
      {/* --- FIN DE LA INTEGRACIÓN --- */}
    </div>
  );
};