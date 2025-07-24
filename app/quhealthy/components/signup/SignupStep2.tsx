"use client";
import React from 'react';
import { User, Building2, Phone } from "lucide-react";
import { FormData, ServiceType } from '@/app/quhealthy/types/signup';
import LocationMapModal from "@/app/quhealthy/components/locationmapmodal"; // Asumiendo que moviste este componente
import EnhancedCategorySelection from "@/app/quhealthy/components/categoryselection"; // Asumiendo que moviste este componente

interface SignupStep2Props {
  formData: FormData;
  serviceType: ServiceType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onCategorySelect: (categoryId: number, tagId: number) => void;
}

export const SignupStep2: React.FC<SignupStep2Props> = ({ formData, serviceType, handleInputChange, onLocationSelect, onCategorySelect }) => (
  <div className="space-y-6">
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
    <LocationMapModal onLocationSelect={onLocationSelect} />
    <EnhancedCategorySelection serviceType={serviceType} onCategorySelect={onCategorySelect} />
    <div className="flex items-center gap-2">
      <input type="checkbox" name="acceptTerms" id="acceptTerms" checked={formData.acceptTerms} onChange={handleInputChange} className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400" required />
      <label htmlFor="acceptTerms" className="text-sm text-gray-300">Acepto los términos y la política de privacidad</label>
    </div>
  </div>
);