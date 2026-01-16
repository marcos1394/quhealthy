/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, Phone, ArrowRight, Loader2, MapPin, 
  Sparkles, AlertCircle, CheckCircle2, Star} from 'lucide-react';
import { toast } from 'react-toastify';

// --- SHADCN UI ---
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- COMPONENTES COMPARTIDOS (Refactorizados) ---
// Nota: Asegúrate de haber creado estos archivos en las rutas indicadas anteriormente
import LocationPicker, { LocationData } from '@/components/shared/location/LocationPicker';
import CategorySelector from '@/components/shared/CategorySelector';

// --- HOOKS ---
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

export default function OnboardingProfilePage() {
  const router = useRouter();
  
  // 1. Hook de Estado del Onboarding
  const { data: pageData, isLoading: pageLoading, error: pageError, refetch } = useOnboardingStatus();
  
  // 2. Estado del Formulario
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    lat: 0,
    lng: 0,
    categoryProviderId: 0,
    subCategoryId: 0,
    tagIds: [] as number[],
    accountType: 'individual',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // --- LÓGICA DE VALIDACIÓN ---
  const isStep1Valid = formData.businessName.trim().length >= 2 && formData.phone.trim().length >= 10;
  const isStep2Valid = formData.categoryProviderId > 0;
  const isStep3Valid = formData.address !== '' && formData.lat !== 0;
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  // Actualizar pasos completados visualmente
  useEffect(() => {
      const newSteps = new Set<number>();
      if (isStep1Valid) newSteps.add(1);
      if (isStep2Valid) newSteps.add(2);
      if (isStep3Valid) newSteps.add(3);
      setCompletedSteps(newSteps);
  }, [formData, isStep1Valid, isStep2Valid, isStep3Valid]);

  const completionPercentage = (completedSteps.size / 3) * 100;

  const steps = [
    { id: 1, title: "Información Básica", description: "Datos de tu negocio", icon: Building2, completed: completedSteps.has(1), valid: isStep1Valid },
    { id: 2, title: "Especialidad", description: "Define tus servicios", icon: Star, completed: completedSteps.has(2), valid: isStep2Valid },
    { id: 3, title: "Ubicación", description: "Donde brindas servicios", icon: MapPin, completed: completedSteps.has(3), valid: isStep3Valid }
  ];

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: LocationData) => {
    setFormData(prev => ({ 
        ...prev, 
        address: location.address, 
        lat: location.lat, 
        lng: location.lng 
    }));
    // Opcional: toast.success("Ubicación guardada");
  };

  const handleSelectionChange = useCallback((categoryId: number, subCategoryId: number, tagIds: number[]) => {
    setFormData(prev => ({ ...prev, categoryProviderId: categoryId, subCategoryId, tagIds }));
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setError(null);

    try {
      // Llamada real al backend
      // await axios.put('/api/auth/provider/onboarding/profile', formData, { withCredentials: true });
      
      // Simulación para Demo
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("¡Perfil completado exitosamente!", { autoClose: 2000 });
      
      // Redirección al checklist principal para continuar con los siguientes pasos (KYC, etc.)
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al guardar el perfil. Intenta de nuevo.";
      setError(errorMessage);
      toast.error("Error al guardar.");
      setLoading(false);
    }
  };

  // --- RENDERIZADO ---

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  if (pageError) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md bg-red-900/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{pageError}</AlertDescription>
            <Button onClick={() => refetch()} variant="outline" className="mt-4 border-red-500/50 text-red-200 hover:bg-red-900/40">
                Reintentar
            </Button>
          </Alert>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950" />
        {/* Partículas Flotantes (Opcional, tomadas de tu diseño original) */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              delay: i * 2,
            }}
            style={{
              left: `${20 + i * 30}%`,
              top: `${50 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl py-10"
      >
        
        {/* Header de Progreso */}
        <div className="mb-8">
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Configura tu Perfil</h2>
                        <p className="text-gray-400 text-sm">Completa estos 3 pasos para activar tu cuenta.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {Math.round(completionPercentage)}%
                        </span>
                    </div>
                </div>
                
                {/* Barra de Progreso */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-6 overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Pasos (Iconos) */}
                <div className="flex justify-between items-start px-2">
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 w-1/3">
                            <motion.div 
                                animate={{ 
                                    scale: step.completed ? 1.1 : 1,
                                    borderColor: step.completed ? '#10B981' : step.valid ? '#8B5CF6' : '#374151'
                                }}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                                    ${step.completed ? 'bg-green-500/10 border-green-500 text-green-500' : step.valid ? 'bg-purple-500/10 border-purple-500 text-purple-500' : 'bg-gray-800 border-gray-700 text-gray-500'}
                                `}
                            >
                                {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </motion.div>
                            <span className={`text-xs font-medium ${step.completed || step.valid ? 'text-white' : 'text-gray-500'}`}>{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl overflow-hidden p-8 space-y-12">
            
            {/* Paso 1: Info Básica */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg"><Building2 className="w-6 h-6 text-purple-400" /></div>
                    <h3 className="text-xl font-bold text-white">Información del Negocio</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-gray-300">Tipo de Cuenta</Label>
                        <Tabs value={formData.accountType} onValueChange={(val) => setFormData(prev => ({ ...prev, accountType: val }))}>
                            <TabsList className="grid w-full grid-cols-2 bg-gray-950 border border-gray-800 h-12 rounded-xl">
                                <TabsTrigger value="individual" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10 rounded-lg">Profesional Independiente</TabsTrigger>
                                <TabsTrigger value="business" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10 rounded-lg">Negocio / Clínica</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Nombre Público</Label>
                            <div className="relative group">
                                <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'businessName' ? 'text-purple-400' : 'text-gray-500'}`} />
                                <Input 
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('businessName')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder={formData.accountType === 'individual' ? "Ej: Dr. Juan Pérez" : "Ej: Clínica Salud Total"}
                                    className="bg-gray-950 border-gray-700 h-12 pl-12 focus:border-purple-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-300">Teléfono</Label>
                            <div className="relative group">
                                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-purple-400' : 'text-gray-500'}`} />
                                <Input 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="+52 555 123 4567"
                                    className="bg-gray-950 border-gray-700 h-12 pl-12 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paso 2: Especialidad */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg"><Star className="w-6 h-6 text-yellow-400" /></div>
                    <h3 className="text-xl font-bold text-white">Tu Especialidad</h3>
                </div>
                {/* Aquí usamos el componente real refactorizado */}
                <CategorySelector 
                    serviceType={pageData?.providerDetails.parentCategoryId === 1 ? 'health' : 'beauty'} 
                    onSelectionChange={handleSelectionChange} 
                />
            </div>

            {/* Paso 3: Ubicación */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg"><MapPin className="w-6 h-6 text-blue-400" /></div>
                    <h3 className="text-xl font-bold text-white">Ubicación</h3>
                </div>
                {/* Aquí usamos el componente real refactorizado */}
                <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {/* Botón Final */}
            <div className="pt-6">
                <Button 
                    type="submit" 
                    disabled={!isFormValid || loading}
                    className={`
                        w-full h-16 text-xl font-bold rounded-2xl shadow-xl transition-all duration-300
                        ${isFormValid 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-[1.01] hover:shadow-2xl' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                    `}
                >
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" /> Guardando tu perfil...
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                            Finalizar Configuración <ArrowRight className="w-6 h-6 ml-1" />
                        </div>
                    )}
                </Button>
            </div>

        </form>

      </motion.div>
    </div>
  );
}