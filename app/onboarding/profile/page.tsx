/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Phone, 
  ArrowRight, 
  Loader2, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Star,
  User,
  Info,
  Lock,
  Zap,
  ChevronRight,
  Shield,
  Trophy,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// Components
import LocationPicker, { LocationData } from '@/components/shared/location/LocationPicker';
import CategorySelector from '@/components/shared/CategorySelector';

// Hooks
import { useProfileOnboarding } from '@/hooks/useProfileOnboarding';
import { UpdateProfileRequest } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { googleService } from '@/services/google.service';

export default function OnboardingProfilePage() {
  const router = useRouter();
  
  // Hook
const { 
    initialData, 
    isLoading: pageLoading, 
    isSaving, 
    saveProfile,
    error: pageError, // ✅ Renombramos 'error' a 'pageError' para coincidir con tu UI
    refetch,
    categories,
    tags,
    getSubCategories      
  } = useProfileOnboarding();

  // Form state
// ✅ 2. Estado alineado con UpdateProfileRequest
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    businessName: '',
    bio: '', // Faltaba
    profileImageUrl: '', // Faltaba (Deberás manejar subida de imagen o default)
    contactPhone: '', // Renombrado de 'phone'
    contactEmail: '', // Faltaba (Vital)
    websiteUrl: '',
    address: '',
    latitude: 0,
    longitude: 0,
    placeId: '',
    categoryId: 0,
    subCategoryId: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState(1);
  const [predictions, setPredictions] = useState<any[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<any>(null); // Para mostrar estrellas/fotos
const [debouncedSearch, setDebouncedSearch] = useState("");
const [isPlaceSelected, setIsPlaceSelected] = useState(false);  
// ✅ 3. Efecto para cargar datos si es modo edición
  useEffect(() => {
    if (initialData) {
      setFormData({
        businessName: initialData.businessName || '',
        bio: initialData.bio || '',
        profileImageUrl: initialData.profileImageUrl || '',
        contactPhone: initialData.contactPhone || '',
        contactEmail: initialData.contactEmail || '',
        websiteUrl: initialData.websiteUrl || '',
        address: initialData.address || '',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        placeId: initialData.googlePlaceId || '',
        categoryId: initialData.categoryId || 0,
        subCategoryId: initialData.subCategoryId || 0,
      });
      // Validar pasos completados visualmente...
    }
  }, [initialData]);

  // ✅ 4. Validaciones (Ajustadas a los nuevos campos)
  const isStep1Valid = formData.businessName.length >= 3 && 
                       formData.bio.length >= 20 &&
                       (formData.contactPhone ?? '').length >= 10;
                       
  const isStep2Valid = formData.categoryId > 0 && formData.subCategoryId > 0;
  
  const isStep3Valid = formData.address !== '' && 
                       formData.latitude !== 0 && 
                       formData.longitude !== 0;

  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  // 1. Efecto para detectar cambios y marcar pasos como completados
  useEffect(() => {
    const newCompleted = new Set<number>();
    
    // Si la validación pasa, lo agregamos al Set de completados
    if (isStep1Valid) newCompleted.add(1);
    if (isStep2Valid) newCompleted.add(2);
    if (isStep3Valid) newCompleted.add(3);
    
    setCompletedSteps(newCompleted);

    // Opcional: Auto-avance (Si termino el paso 1, muéveme al 2 automáticamente)
    if (isStep1Valid && activeStep === 1 && !isStep2Valid) {
      setActiveStep(2);
    } else if (isStep2Valid && activeStep === 2 && !isStep3Valid) {
      setActiveStep(3);
    }
  }, [isStep1Valid, isStep2Valid, isStep3Valid, activeStep]);

  // 2. Variable calculada para la barra de progreso
  const completionPercentage = (completedSteps.size / 3) * 100;

  const steps = [
    { 
      id: 1, 
      title: "Información Básica", 
      description: "Nombre y contacto", 
      icon: Building2, 
      completed: completedSteps.has(1), 
      valid: isStep1Valid,
      color: "purple"
    },
    { 
      id: 2, 
      title: "Especialidad", 
      description: "Tus servicios", 
      icon: Star, 
      completed: completedSteps.has(2), 
      valid: isStep2Valid,
      color: "yellow"
    },
    { 
      id: 3, 
      title: "Ubicación", 
      description: "Donde atiendes", 
      icon: MapPin, 
      completed: completedSteps.has(3), 
      valid: isStep3Valid,
      color: "blue"
    }
  ];

  // Handlers
// ✅ 5. Handlers de Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: any) => { // Ajustar tipo según tu componente
    setFormData(prev => ({ 
      ...prev, 
      address: location.address, 
      latitude: location.lat, 
      longitude: location.lng,
      placeId: location.placeId
    }));
  };

  useEffect(() => {
  // Si el usuario acaba de seleccionar un lugar, no buscamos
  if (isPlaceSelected) return;

  const searchTerm = formData.businessName;

  if (searchTerm.length >= 3) {
    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await googleService.autocomplete(searchTerm);
        // La librería devuelve un JSON string o objeto, asegúrate de parsear si es necesario
        setPredictions(typeof data === 'string' ? JSON.parse(data) : data);
      } catch (error) {
        console.error("Error en autocomplete:", error);
      } finally {
        setIsSearching(false);
      }
    }, 800); // ⏱️ 800ms: Equilibrio perfecto entre UX y ahorro de API

    return () => clearTimeout(handler);
  } else {
    setPredictions([]);
  }
}, [formData.businessName, isPlaceSelected]);

const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  
  // Si el usuario vuelve a escribir, reseteamos el estado de selección
  setIsPlaceSelected(false);
  if (selectedPlaceInfo) setSelectedPlaceInfo(null);
  
  setFormData(prev => ({ ...prev, businessName: value }));
};

const selectPlace = async (prediction: any) => {
  // 1. Bloqueamos búsquedas automáticas inmediatas
  setIsPlaceSelected(true);
  setPredictions([]);
  
  // Usamos el nombre principal de la predicción
  const displayName = prediction.structuredFormatting?.mainText || prediction.description;
  setFormData(prev => ({ ...prev, businessName: displayName }));

  try {
    const detailsRaw = await googleService.getDetails(prediction.placeId);
    const details = typeof detailsRaw === 'string' ? JSON.parse(detailsRaw) : detailsRaw;

    // 2. Mapeo inteligente de datos al DTO
    setFormData(prev => ({
      ...prev,
      businessName: details.name || displayName,
      contactPhone: (details.internationalPhoneNumber || details.formattedPhoneNumber || prev.contactPhone || '').replace(/\s+/g, ''),
      websiteUrl: details.website || prev.websiteUrl,
      address: details.formattedAddress || prev.address,
      latitude: details.geometry?.location?.lat || prev.latitude,
      longitude: details.geometry?.location?.lng || prev.longitude,
      placeId: details.placeId
    }));

    // 3. Info visual para la Card de reputación
    setSelectedPlaceInfo({
      rating: details.rating || 0,
      userRatingsTotal: details.userRatingsTotal || 0,
    });

    toast.success("🏪 Información importada de Google");
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    toast.error("No se pudo sincronizar la información detallada");
  }
};
  
  // ✅ 6. Submit Real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        toast.error("Por favor completa todos los pasos requeridos.");
        return;
    }

    // El hook se encarga del try/catch, loading y toast de éxito/error
    await saveProfile(formData); 
  };

  // Get next incomplete step
  const getNextIncompleteStep = () => {
    if (!isStep1Valid) return 1;
    if (!isStep2Valid) return 2;
    if (!isStep3Valid) return 3;
    return null;
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center flex-col gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-500" />
        </motion.div>
        <p className="text-gray-400 text-sm animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  // Error state
  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gray-900 border-gray-800 max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-red-400">Error de Carga</h3>
                  <p className="text-sm text-gray-400">{pageError}</p>
                </div>
              </div>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="w-full border-gray-700 text-white hover:bg-gray-800"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Paso 1 de 4
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Configura tu Perfil Profesional
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Completa estos 3 pasos para que los pacientes puedan encontrarte y agendar contigo
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Progreso General
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {completedSteps.size} de 3 secciones completadas
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {Math.round(completionPercentage)}%
                  </span>
                </div>
              </div>
              
              <Progress value={completionPercentage} className="h-3 mb-6" />

              {/* Step Indicators */}
              <div className="grid grid-cols-3 gap-4">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      activeStep === step.id ? "bg-purple-500/10 ring-2 ring-purple-500/30" : "",
                      step.completed ? "bg-emerald-500/5" : ""
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all",
                      step.completed ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "",
                      !step.completed && step.valid ? "bg-purple-500/10 border-purple-500 text-purple-400" : "",
                      !step.completed && !step.valid && activeStep === step.id ? "bg-purple-500/10 border-purple-500 text-purple-400" : "",
                      !step.completed && !step.valid && activeStep !== step.id ? "bg-gray-800 border-gray-700 text-gray-500" : ""
                    )}>
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-xs font-semibold",
                        step.completed ? "text-emerald-400" : "",
                        !step.completed && step.valid ? "text-purple-400" : "",
                        !step.completed && !step.valid ? "text-gray-500" : ""
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
              <CardContent className="p-8 space-y-8">
                
                <AnimatePresence mode="wait">
                  
                 {/* Step 1: Basic Info */}
{activeStep === 1 && (
  <motion.div
    key="step1"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    {/* Header del Paso */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Building2 className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">Información Básica</h3>
          <p className="text-sm text-gray-400">Configura tu identidad profesional</p>
        </div>
      </div>
      {/* El badge verde solo se muestra si el paso ya está en el set de completados */}
      {completedSteps.has(1) && (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-in fade-in zoom-in">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      )}
    </div>

    <Separator className="bg-gray-800" />

    {/* 1. Buscador de Negocio (Google Places) */}
    <div className="space-y-3 relative">
      <Label className="text-gray-300 font-semibold flex items-center gap-2">
        Nombre del Consultorio o Negocio *
        <span className="text-[10px] text-gray-500 font-normal">(Auto-completa con Google)</span>
      </Label>
      <div className="relative group">
        <Building2 className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
          focusedField === 'businessName' ? "text-purple-400" : "text-gray-500"
        )} />
        <Input 
          name="businessName"
          value={formData.businessName}
          onChange={handleBusinessNameChange} // Usar el handler de Google
          onFocus={() => setFocusedField('businessName')}
          onBlur={() => setFocusedField(null)}
          placeholder="Busca tu consultorio o escribe el nombre..."
          className="bg-gray-950 border-gray-700 h-12 pl-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-purple-500" />
        )}
      </div>

      {/* Lista de Predicciones de Google */}
      <AnimatePresence>
        {predictions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-xl mt-1 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
          >
            {predictions.map((p: any) => (
              <button 
                key={p.placeId} 
                onClick={() => selectPlace(p)}
                type="button"
                className="w-full p-3 text-left hover:bg-purple-500/10 border-b border-gray-800 last:border-0 flex items-start gap-3 transition-colors group"
              >
                <MapPin className="w-4 h-4 text-gray-500 group-hover:text-purple-400 mt-1" />
                <div>
                  <p className="text-sm font-bold text-white">{p.structuredFormatting.mainText}</p>
                  <p className="text-[10px] text-gray-500">{p.structuredFormatting.secondaryText}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Previsualización de la Información Importada */}
{selectedPlaceInfo && (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/80 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl"
  >
    <div className="p-6 space-y-4">
      {/* Badge de Fuente */}
      <div className="flex justify-between items-start">
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
          DATOS VINCULADOS DE GOOGLE BUSINESS
        </Badge>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="w-4 h-4 fill-yellow-500" />
          <span className="font-bold text-sm">{selectedPlaceInfo.rating}</span>
          <span className="text-gray-500 text-xs">({selectedPlaceInfo.userRatingsTotal} reseñas)</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Placeholder para Foto (Usando la primera de Google si decides implementarlo) */}
        <div className="w-20 h-20 rounded-2xl bg-gray-800 flex-shrink-0 flex items-center justify-center border border-gray-700">
          <Building2 className="w-8 h-8 text-gray-600" />
        </div>
        
        <div className="flex-1 space-y-1">
          <h4 className="text-white font-bold text-lg leading-tight">{formData.businessName}</h4>
          <p className="text-gray-400 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {formData.address}
          </p>
          
          {/* Mostrar Sitio Web si existe */}
          {formData.websiteUrl && (
            <a 
              href={formData.websiteUrl} 
              target="_blank" 
              className="text-purple-400 text-xs flex items-center gap-1 hover:underline pt-1"
            >
              <Zap className="w-3 h-3" /> Visitar sitio web oficial
            </a>
          )}
        </div>
      </div>

      {/* Horarios (Resumen) */}
      {selectedPlaceInfo.openingHours && (
        <div className="pt-2 border-t border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">
            Horarios detectados
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {selectedPlaceInfo.openingHours.weekdayText?.map((day: string, i: number) => (
              <Badge key={i} variant="outline" className="whitespace-nowrap bg-gray-950 border-gray-800 text-[9px] text-gray-400">
                {day.split(': ')[0]}: {day.split(': ')[1]}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Footer de la Card informativa */}
    <div className="bg-purple-500/10 p-3 px-6 flex justify-between items-center">
      <p className="text-[10px] text-purple-300">
        Esta información se usará para crear tu <strong>Tienda QuHealthy</strong>.
      </p>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 text-[10px] text-purple-400 hover:text-purple-300"
        onClick={() => setSelectedPlaceInfo(null)}
      >
        Cambiar negocio
      </Button>
    </div>
  </motion.div>
)}

    {/* 2. Contacto: Email y Teléfono */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label className="text-gray-300 font-semibold">Email de Contacto *</Label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</div>
          <Input 
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleInputChange}
            placeholder="negocio@ejemplo.com"
            className="bg-gray-950 border-gray-700 h-12 pl-12 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-gray-300 font-semibold">Teléfono de Contacto *</Label>
        <div className="relative group">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input 
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            placeholder="+52 555..."
            className="bg-gray-950 border-gray-700 h-12 pl-12 focus:border-purple-500"
          />
        </div>
      </div>
    </div>

    {/* 3. Biografía Profesional (Mínimo 20 caracteres) */}
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-gray-300 font-semibold">Biografía / Descripción *</Label>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full",
          formData.bio.length >= 20 ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-400"
        )}>
          {formData.bio.length} / 20 mín.
        </span>
      </div>
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleInputChange}
        onFocus={() => setFocusedField('bio')}
        onBlur={() => setFocusedField(null)}
        placeholder="Describe tu trayectoria, especialidad y enfoque de atención..."
        className="w-full min-h-[120px] bg-gray-950 border border-gray-700 rounded-xl p-4 text-white text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
      />
    </div>

    {/* Botón Siguiente (Valida y marca en verde) */}
    <div className="pt-4">
      <Button
        onClick={() => {
          if (isStep1Valid) {
            // ✅ Solo aquí marcamos como completado para que se ponga en verde
            setCompletedSteps(prev => new Set(prev).add(1));
            setActiveStep(2);
          } else {
            toast.warning("Por favor completa los campos: Nombre (3+), Bio (20+) y Teléfono (10+)");
          }
        }}
        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 group"
      >
        Continuar a Especialidad
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  </motion.div>
)}

                  {/* Step 2: Specialty */}
{activeStep === 2 && (
  <motion.div
    key="step2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-yellow-500/10 rounded-xl">
          <Star className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white">Tu Especialidad</h3>
          <p className="text-sm text-gray-400">Selecciona tu área de expertise</p>
        </div>
      </div>
      {isStep2Valid && (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completado
        </Badge>
      )}
    </div>

    <Separator className="bg-gray-800" />

    {/* ✅ Selector de Categorías Real */}
    <div className="bg-gray-900/50 p-1 rounded-2xl border border-gray-800">
      <CategorySelector
  // ✅ 1. Agregamos la propiedad tags (que viene de tu hook)
  tags={tags} 
  categories={categories}
  onGetSubCategories={getSubCategories}
  selectedCategoryId={formData.categoryId}
  selectedSubCategoryId={formData.subCategoryId}
  // ✅ 2. Agregamos el estado de los tags seleccionados
  selectedTagIds={formData.tagIds} 
  // ✅ 3. Ajustamos la función para recibir los 3 argumentos (cat, sub, tags)
  onSelectionChange={(catId, subId, tagIds) => {
    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      subCategoryId: subId,
      tagIds: tagIds // Ahora guardamos los tags en el form
    }));
  }}
  // ✅ 4. Pasamos el error si existe
/>
    </div>

    {/* Espacio para Tags (Opcional) */}
    {formData.subCategoryId > 0 && (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"
      >
        <p className="text-sm text-purple-300 flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4" />
          ¿Tienes alguna sub-especialidad o certificación extra?
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              onClick={() => {
                const currentTags = formData.tagIds || [];
                const newTags = currentTags.includes(tag.id)
                  ? currentTags.filter(id => id !== tag.id)
                  : [...currentTags, tag.id];
                setFormData(prev => ({ ...prev, tagIds: newTags }));
              }}
              className={cn(
                "cursor-pointer transition-all",
                formData.tagIds?.includes(tag.id)
                  ? "bg-purple-500 border-purple-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-purple-500/50"
              )}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </motion.div>
    )}
  </motion.div>
)}

                  {/* Step 3: Location */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-500/10 rounded-xl">
                            <MapPin className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white">Ubicación</h3>
                            <p className="text-sm text-gray-400">Donde brindas tus servicios</p>
                          </div>
                        </div>
                        {isStep3Valid && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                      </div>

                      <Separator className="bg-gray-800" />

                      <LocationPicker onLocationSelect={handleLocationSelect} />
                    </motion.div>
                  )}
                  
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                  <div>
                    {activeStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveStep(prev => prev - 1)}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        Anterior
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {activeStep < 3 ? (
                      <Button
                        type="button"
                        onClick={() => setActiveStep(prev => prev + 1)}
                        disabled={
                          (activeStep === 1 && !isStep1Valid) ||
                          (activeStep === 2 && !isStep2Valid)
                        }
                        className={cn(
                          "group",
                          (activeStep === 1 && isStep1Valid) || (activeStep === 2 && isStep2Valid)
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-gray-800 text-gray-500"
                        )}
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={cn(
                          "group",
                          isFormValid
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
                            : "bg-gray-800 text-gray-500"
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Finalizar Configuración
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </form>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-xs text-gray-500"
        >
          <Shield className="w-3 h-3" />
          <span>Tus datos están protegidos con cifrado SSL</span>
        </motion.div>
      </div>
    </div>
  );
}