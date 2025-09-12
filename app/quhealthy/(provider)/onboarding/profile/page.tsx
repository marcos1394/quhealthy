"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Phone, ArrowRight, Loader2, MapPin, Sparkles, AlertCircle, CheckCircle2, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-toastify';
import axios from 'axios';
import LocationPickerWrapper from '@/app/quhealthy/components/LocationPickerWrapper';
import EnhancedCategorySelection from '@/app/quhealthy/components/categoryselection';
import { LocationData } from '@/app/quhealthy/types/location';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs';

export default function OnboardingProfilePage() {
  const router = useRouter();
  
  // 1. Usamos nuestro hook centralizado para obtener los datos y estados de la página.
  //    Esto reemplaza la necesidad de un useState y useEffect locales para esta tarea.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: pageData, isLoading: pageLoading, error: pageError, refetch } = useOnboardingStatus();
  
  // El resto de los estados son para manejar el formulario en sí, lo cual es correcto.
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    lat: 0,
    lng: 0,
    categoryProviderId: 0,
    subCategoryId: 0,
    tagIds: [] as number[],
    accountType: 'individual', // <-- AÑADE ESTE CAMPO (valor por defecto)

  });

  const [loading, setLoading] = useState(false); // Para el botón de submit
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Tus funciones 'handle' están bien y se mantienen
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'businessName' || name === 'phone') {
      const updatedData = { ...formData, [name]: value };
      if (updatedData.businessName.trim().length >= 2 && updatedData.phone.trim().length >= 10) {
        setCompletedSteps(prev => new Set(prev).add(1));
      }
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    setFormData(prev => ({ ...prev, address: location.address, lat: location.lat, lng: location.lng }));
    setCompletedSteps(prev => new Set(prev).add(3));
  };

  const handleSelectionChange = useCallback((categoryId: number, subCategoryId: number, tagIds: number[]) => {
    setFormData(prev => ({ ...prev, categoryProviderId: categoryId, subCategoryId, tagIds }));
    if (categoryId > 0) {
      setCompletedSteps(prev => new Set(prev).add(2));
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Usamos axios normal, ya que la autenticación debe estar centralizada en tu apiClient
      // o configurada globalmente. La ruta es relativa para usar el proxy.
      await axios.put('/api/providers/onboarding/profile', formData, { withCredentials: true });

      toast.success("¡Perfil completado exitosamente!", { autoClose: 2000 });
      
      setTimeout(() => {
        router.push('/quhealthy/authentication/providers/onboarding/checklist');
      }, 1500);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al guardar el perfil.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Tus validaciones y la definición de 'steps' se mantienen igual
  const isStep1Valid = formData.businessName.trim().length >= 2 && formData.phone.trim().length >= 10;
  const isStep2Valid = formData.categoryProviderId > 0;
  const isStep3Valid = formData.address && formData.lat !== 0 && formData.lng !== 0;
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const steps = [
    { id: 1, title: "Información Básica", description: "Datos de tu negocio", icon: Building2, completed: completedSteps.has(1), valid: isStep1Valid },
    { id: 2, title: "Especialidad", description: "Define tus servicios", icon: Star, completed: completedSteps.has(2), valid: isStep2Valid },
    { id: 3, title: "Ubicación", description: "Donde brindas servicios", icon: MapPin, completed: completedSteps.has(3), valid: isStep3Valid }
  ];
  const completionPercentage = (completedSteps.size / 3) * 100;

  // Renderizado condicional usando los estados del hook
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (pageError) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{pageError}</AlertDescription>
            <Button onClick={() => refetch()} className="mt-4">Reintentar</Button>
          </Alert>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/6 rounded-full blur-2xl animate-pulse delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-2000" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl"
      >
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Configuración del Perfil</h2>
                <p className="text-gray-400 text-sm">Completa tu información profesional</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{Math.round(completionPercentage)}%</div>
                <div className="text-xs text-gray-400">Completado</div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4">
              <motion.div
                className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    step.completed 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                      : step.valid
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'
                        : 'bg-gray-700/50 border border-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${step.valid ? 'text-white' : 'text-gray-400'}`} />
                    )}
                    {step.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -inset-1 bg-green-500/20 rounded-xl animate-pulse"
                      />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-medium transition-colors ${
                      step.completed ? 'text-green-400' : step.valid ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex flex-1 mx-4">
                      <div className={`w-full h-0.5 rounded transition-all duration-300 ${
                        completedSteps.has(step.id) ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-700'
                      }`} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-6 text-center bg-gradient-to-br from-gray-800/80 to-gray-700/50 relative overflow-hidden">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="relative inline-flex items-center justify-center w-24 h-24 mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-xl animate-pulse" />
                <div className="relative flex items-center justify-center w-full h-full rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600">
                  <User className="w-12 h-12 text-white drop-shadow-lg" />
                  <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300 animate-bounce" />
                  <Zap className="absolute -bottom-1 -left-1 w-4 h-4 text-blue-300 animate-pulse" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              <h1 className="...">¡Bienvenido, {pageData?.providerDetails.name || 'Doctor'}!</h1>

                </h1>
                <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  Estás a solo unos pasos de hacer crecer tu práctica profesional. Configuremos tu perfil para que miles de pacientes puedan encontrarte.
                </p>
              </motion.div>

              {/* Floating icons */}
              <div className="absolute top-6 left-6">
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center"
                >
                  <Shield className="w-4 h-4 text-purple-300" />
                </motion.div>
              </div>
              <div className="absolute top-6 right-6">
                <motion.div
                  animate={{ rotate: -360, y: [0, -10, 0] }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center"
                >
                  <Star className="w-4 h-4 text-pink-300" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-10">
              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-500/50 bg-red-900/20 backdrop-blur-sm">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-red-400 font-medium">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: Basic Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isStep1Valid 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'
                    }`}
                  >
                    {isStep1Valid ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">1</span>
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Información Básica</h2>
                    <p className="text-gray-400">Los datos esenciales de tu práctica profesional</p>
                  </div>
                </div>
                <div>
    <label className="block text-sm font-semibold text-gray-300 tracking-wide mb-3">
      Tipo de Cuenta *
    </label>
    <Tabs
      value={formData.accountType}
      onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 p-1 rounded-xl">
        <TabsTrigger value="individual" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg">
          <User className="w-4 h-4 mr-2" />
          Profesional Independiente
        </TabsTrigger>
        <TabsTrigger value="business" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg">
          <Building2 className="w-4 h-4 mr-2" />
          Negocio / Clínica
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Business Name */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-semibold text-gray-300 tracking-wide">
                      Nombre de tu Negocio o Consultorio *
                    </label>
                    <div className="relative group">
                      <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                        focusedField === 'businessName' ? 'text-purple-400 scale-110' : 'text-gray-400 group-hover:text-gray-300'
                      }`} />
                      <input 
                        name="businessName" 
                        placeholder="Ej: Clínica Dental Sonrisas, Spa Bella Vista"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('businessName')}
                        onBlur={() => setFocusedField(null)}
                        required 
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400 ${
                          focusedField === 'businessName' 
                            ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-gray-700/70' 
                            : formData.businessName.trim()
                              ? 'border-green-400 bg-gray-700/60'
                              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/60'
                        }`}
                      />
                      {formData.businessName.trim() && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 ml-1">Este será el nombre visible para tus clientes</p>
                  </motion.div>

                  {/* Phone */}
                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="space-y-3"
                  >
                    <label className="block text-sm font-semibold text-gray-300 tracking-wide">
                      Teléfono de Contacto *
                    </label>
                    <div className="relative group">
                      <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 z-10 ${
                        focusedField === 'phone' ? 'text-purple-400 scale-110' : 'text-gray-400 group-hover:text-gray-300'
                      }`} />
                      <input 
                        name="phone" 
                        type="tel"
                        placeholder="+52 614 123 4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        required 
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-gray-700/50 backdrop-blur-sm text-white placeholder-gray-400 ${
                          focusedField === 'phone' 
                            ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-gray-700/70' 
                            : formData.phone.trim().length >= 10
                              ? 'border-green-400 bg-gray-700/60'
                              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/60'
                        }`}
                      />
                      {formData.phone.trim().length >= 10 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 ml-1">Número donde los clientes podrán contactarte</p>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Step 2: Specialty */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isStep2Valid 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'
                    }`}
                  >
                    {isStep2Valid ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">2</span>
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Tu Especialidad</h2>
                    <p className="text-gray-400">Define los servicios que ofreces a tus clientes</p>
                  </div>
                </div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/50 shadow-xl"
                >
                  <EnhancedCategorySelection 
                    serviceType={pageData?.providerDetails.parentCategoryId === 1 ? 'health' : 'beauty'} 
                    onSelectionChange={handleSelectionChange} 
                  />
                </motion.div>
              </motion.div>
              
              {/* Step 3: Location */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isStep3Valid 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'
                    }`}
                  >
                    {isStep3Valid ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold">3</span>
                    )}
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Ubicación de tu Servicio</h2>
                    <p className="text-gray-400">Ayuda a los clientes a encontrarte fácilmente</p>
                  </div>
                </div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/50 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity }}
                      className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center"
                    >
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    <div>
                      <p className="text-white font-medium">Selecciona tu ubicación</p>
                      <p className="text-gray-400 text-sm">Dirección donde brindas tus servicios profesionales</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <LocationPickerWrapper onLocationSelect={handleLocationSelect} />
                  </div>
                  
                  <AnimatePresence>
                    {formData.address && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="p-4 bg-green-900/20 backdrop-blur-sm border border-green-700/50 rounded-2xl"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mt-1">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-green-400 font-medium text-sm">Ubicación confirmada</p>
                            <p className="text-gray-300 text-sm mt-1">{formData.address}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-8"
              >
                <motion.div
                  whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                  whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                >
                  <Button 
                    type="submit" 
                    disabled={!isFormValid || loading}
                    className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Guardando tu perfil...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                        {isFormValid ? 'Finalizar Configuración' : 'Completa todos los campos'}
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </motion.div>
                
                {/* Completion status */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-gray-400">
                    {completedSteps.size === 3 
                      ? "🎉 ¡Todo listo! Haz clic para continuar" 
                      : `${3 - completedSteps.size} ${3 - completedSteps.size === 1 ? 'paso' : 'pasos'} restantes para completar tu perfil`
                    }
                  </p>
                </motion.div>
              </motion.div>

              {/* Trust indicators and next steps preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="pt-8 border-t border-gray-700/50"
              >
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Datos Seguros</h4>
                    <p className="text-xs text-gray-500">Tu información está protegida con encriptación de nivel bancario</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto">
                      <Zap className="w-5 h-5 text-pink-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Configuración Rápida</h4>
                    <p className="text-xs text-gray-500">Solo 2 minutos más y tendrás tu perfil completamente activo</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto">
                      <Star className="w-5 h-5 text-green-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Listo para Crecer</h4>
                    <p className="text-xs text-gray-500">Accede a miles de clientes potenciales en tu área</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}