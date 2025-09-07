"use client";

import React, { useState } from 'react';
import { User, Building2, Phone, MapPin, Briefcase, Shield, CheckCircle2,  Tag } from "lucide-react";
import { FormData, ServiceType } from '@/app/quhealthy/types/signup';
import { LocationData } from '@/app/quhealthy/types/location';
import LocationPickerWrapper from '@/app/quhealthy/components/LocationPickerWrapper';
import EnhancedCategorySelection from '@/app/quhealthy/components/categoryselection';
import { TermsModal } from './TermsModal';

interface SignupStep2Props {
  formData: FormData;
  serviceType: ServiceType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationSelect: (location: LocationData) => void; 
  onSelectionChange: (categoryId: number, subCategoryId: number, tagIds: number[]) => void;
}

export const SignupStep2: React.FC<SignupStep2Props> = ({ 
  formData, 
  serviceType, 
  handleInputChange, 
  onLocationSelect, 
  onSelectionChange 
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [categorySelected, setCategorySelected] = useState(false);

  const handleLocationSelect = (location: LocationData) => {
    setLocationSelected(true);
    onLocationSelect(location);
  };

  const handleCategoryChange = (categoryId: number, subCategoryId: number, tagIds: number[]) => {
    setCategorySelected(tagIds.length > 0);
    onSelectionChange(categoryId, subCategoryId, tagIds);
  };

  const handleAcceptTerms = () => {
    const event = {
      target: { name: 'acceptTerms', type: 'checkbox', checked: true }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  };

  const isNameValid = formData.name && formData.name.length >= 2;
  const isBusinessValid = formData.businessName && formData.businessName.length >= 2;
  const isPhoneValid = formData.phone && /^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Información Profesional</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Completa tu perfil profesional para que los clientes puedan encontrarte fácilmente
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Datos Personales</h3>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Nombre completo *
            </label>
            <div className="relative group">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                focusedField === 'name' ? 'text-teal-400' : 
                isNameValid ? 'text-green-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                name="name"
                placeholder="Dr. Juan Pérez González"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                  focusedField === 'name' ? 'border-teal-400 bg-gray-800/70 shadow-lg shadow-teal-400/20' :
                  isNameValid ? 'border-green-400 bg-green-900/10' :
                  'border-gray-600 hover:border-gray-500'
                }`}
                required
              />
              {isNameValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Nombre del consultorio o negocio *
            </label>
            <div className="relative group">
              <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                focusedField === 'businessName' ? 'text-teal-400' : 
                isBusinessValid ? 'text-green-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                name="businessName"
                placeholder="Clínica Salud y Bienestar"
                value={formData.businessName}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('businessName')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                  focusedField === 'businessName' ? 'border-teal-400 bg-gray-800/70 shadow-lg shadow-teal-400/20' :
                  isBusinessValid ? 'border-green-400 bg-green-900/10' :
                  'border-gray-600 hover:border-gray-500'
                }`}
                required
              />
              {isBusinessValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Teléfono de contacto *
            </label>
            <div className="relative group">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                focusedField === 'phone' ? 'text-teal-400' : 
                isPhoneValid ? 'text-green-400' : 'text-gray-500'
              }`} />
              <input
                type="tel"
                name="phone"
                placeholder="+52 614 123 4567"
                value={formData.phone}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-800/50 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                  focusedField === 'phone' ? 'border-teal-400 bg-gray-800/70 shadow-lg shadow-teal-400/20' :
                  isPhoneValid ? 'border-green-400 bg-green-900/10' :
                  'border-gray-600 hover:border-gray-500'
                }`}
                required
              />
              {isPhoneValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Incluye código de país. Este será tu teléfono principal de contacto.
            </p>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              locationSelected ? 'bg-green-500/20' : 'bg-teal-500/20'
            }`}>
              <MapPin className={`w-5 h-5 ${locationSelected ? 'text-green-400' : 'text-teal-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Ubicación del Negocio</h3>
              <p className="text-sm text-gray-400">Selecciona la ubicación donde prestas tus servicios</p>
            </div>
            {locationSelected && (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            )}
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
            {/* AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Usamos el wrapper en lugar del componente directo */}
            <LocationPickerWrapper onLocationSelect={handleLocationSelect} />
          </div>
        </div>

        {/* Category Selection Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              categorySelected ? 'bg-green-500/20' : 'bg-teal-500/20'
            }`}>
              <Tag className={`w-5 h-5 ${categorySelected ? 'text-green-400' : 'text-teal-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Especialidades y Servicios</h3>
              <p className="text-sm text-gray-400">Selecciona los servicios que ofreces para que los clientes te encuentren</p>
            </div>
            {categorySelected && (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            )}
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <EnhancedCategorySelection 
              serviceType={serviceType} 
              onSelectionChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Términos y Condiciones</h3>
          </div>
          
          <div className="flex items-start gap-4">
            <input 
              type="checkbox" 
              name="acceptTerms" 
              id="acceptTerms" 
              checked={formData.acceptTerms} 
              onChange={handleInputChange}
              className="w-5 h-5 mt-1 rounded border-gray-600 text-purple-500 focus:ring-purple-400 focus:ring-2" 
              required 
            />
            <div className="flex-1">
              <TermsModal onAccept={handleAcceptTerms}>
                <label htmlFor="acceptTerms" className="text-sm text-gray-300 cursor-pointer leading-relaxed">
                  He leído y acepto los{' '}
                  <span className="text-purple-400 hover:text-purple-300 underline decoration-purple-400/50 hover:decoration-purple-300 transition-colors">
                    términos y condiciones
                  </span>
                  {' '}y la{' '}
                  <span className="text-purple-400 hover:text-purple-300 underline decoration-purple-400/50 hover:decoration-purple-300 transition-colors">
                    política de privacidad
                  </span>
                  {' '}de QuHealthy
                </label>
              </TermsModal>
              <p className="text-xs text-gray-500 mt-2">
                Al aceptar, confirmas que eres un profesional autorizado para prestar servicios de salud y/o belleza
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isNameValid && isBusinessValid && isPhoneValid ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className={isNameValid && isBusinessValid && isPhoneValid ? 'text-green-400' : 'text-gray-500'}>
                Datos Personales
              </span>
            </div>
            <div className="w-8 h-px bg-gray-600" />
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${locationSelected ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className={locationSelected ? 'text-green-400' : 'text-gray-500'}>
                Ubicación
              </span>
            </div>
            <div className="w-8 h-px bg-gray-600" />
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${categorySelected ? 'bg-green-400' : 'bg-gray-600'}`} />
              <span className={categorySelected ? 'text-green-400' : 'text-gray-500'}>
                Servicios
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};