"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, CheckCircle2, Crown, Store, Smartphone } from "lucide-react";
import { toast } from "react-toastify";

// --- SHADCN UI ---
import { Button } from "@/components/ui/button";

// --- IMPORTACIÓN DE COMPONENTES DEL MARKETPLACE ---
// Asegúrate de que las rutas coincidan con donde guardaste los archivos anteriores
import { VisualIdentitySection } from "@/components/marketplace/VisualIdentitySection";
import { PublicInfoSection } from "@/components/marketplace/PublicInfoSection";
import { ServicesManager, Service } from "@/components/marketplace/ServicesManager";
import { PackagesManager, ServicePackage } from "@/components/marketplace/PackagesManager";
import { StaffManager, StaffMember } from "@/components/marketplace/StaffManager";

// --- ESTADO INICIAL (MOCKS) ---
// Esto simula datos que podrían venir del backend si el usuario ya hubiera guardado algo
const initialSettings = {
  storeName: "",
  storeSlug: "",
  primaryColor: "#8B5CF6", // Púrpura por defecto
  storeLogoUrl: "",
  bannerImageUrl: "",
  description: "",
  videoUrl: "",
};

export default function MarketplaceSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(true); // Toggle para simular Plan Premium (Demo)

  // --- ESTADOS GLOBALES ---
  const [settings, setSettings] = useState(initialSettings);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // --- HANDLERS CENTRALIZADOS ---

  // 1. Configuración General
  const handleSettingsChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // 2. Servicios
  const handleServiceAdd = () => {
    const newService: Service = {
      id: -Date.now(),
      name: "",
      description: "",
      duration: 30,
      price: 0,
      serviceDeliveryType: "in_person",
      cancellationPolicy: "moderate",
      isNew: true,
    };
    setServices([...services, newService]);
  };

  const handleServiceUpdate = (id: number, updates: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleServiceDelete = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleServiceSave = (service: Service) => {
    // Aquí iría la llamada API individual si se desea
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, isNew: false } : s)));
    toast.success("Servicio guardado localmente");
  };

  // 3. Paquetes
  const handlePackageSave = (pkg: ServicePackage) => {
    if (pkg.id < 0) {
      // Es nuevo, asignamos ID simulado y guardamos
      setPackages([...packages, { ...pkg, id: Date.now(), isNew: false }]);
    } else {
      // Actualizar existente
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
    }
    toast.success("Paquete guardado");
  };

  const handlePackageDelete = (id: number) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // 4. Staff
  const handleStaffAdd = () => {
    const newMember: StaffMember = {
      id: -Date.now(),
      name: "",
      specialty: "",
      bio: "",
      isNew: true,
    };
    setStaff([...staff, newMember]);
  };

  const handleStaffUpdate = (id: number, field: keyof StaffMember, value: string) => {
    setStaff((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleStaffDelete = (id: number) => {
    setStaff((prev) => prev.filter((m) => m.id !== id));
  };

  // --- SUBMIT FINAL ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulamos latencia de red
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Aquí harías el POST final con todo el objeto
      /* await axios.post('/api/marketplace/full-setup', {
        settings,
        services,
        packages,
        staff
      });
      */

      setSaveSuccess(true);
      toast.success("¡Tu consultorio está listo!");

      // Redirigir al dashboard o checklist
      setTimeout(() => router.push("/onboarding"), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500/30">
      
      {/* --- HEADER STICKY --- */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="default" onClick={() => router.back()} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-500" />
                Configurar Consultorio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div 
                className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20 transition-colors"
                onClick={() => setIsPremium(!isPremium)} // Toggle Demo
            >
              <Crown className="w-3 h-3" /> {isPremium ? "Plan Premium Activo" : "Modo Gratuito (Click para cambiar)"}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={`min-w-[140px] transition-all duration-300 ${
                saveSuccess ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> ¡Listo!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Guardar Todo
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL (GRID) --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: EDITORES (8 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          <VisualIdentitySection 
            settings={settings} 
            onChange={handleSettingsChange} 
          />

          <PublicInfoSection 
            settings={settings} 
            onChange={handleSettingsChange} 
            isPremium={isPremium}
          />

          <ServicesManager 
            services={services}
            onAdd={handleServiceAdd}
            onUpdate={handleServiceUpdate}
            onDelete={handleServiceDelete}
            onSave={handleServiceSave}
          />

          <PackagesManager 
            packages={packages}
            availableServices={services}
            onSave={handlePackageSave}
            onDelete={handlePackageDelete}
          />

          <StaffManager 
            staff={staff}
            onAdd={handleStaffAdd}
            onUpdate={handleStaffUpdate}
            onDelete={handleStaffDelete}
            isBusinessPlan={isPremium}
          />

        </div>

        {/* COLUMNA DERECHA: PREVIEW (4 cols) */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="sticky top-24 space-y-4">
            
            <div className="flex items-center justify-between text-sm text-gray-400 px-1">
                <span className="font-medium flex items-center gap-2"><Smartphone className="w-4 h-4" /> Vista Previa Móvil</span>
                <span className="text-xs">Actualización en tiempo real</span>
            </div>

            {/* MOCKUP DEL CELULAR */}
            <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[700px] w-[350px] shadow-2xl overflow-hidden ring-1 ring-gray-700">
                
                {/* Pantalla del Celular */}
                <div className="h-full w-full bg-black overflow-y-auto custom-scrollbar">
                    
                    {/* Header App (Color dinámico) */}
                    <div 
                        className="h-32 w-full relative transition-colors duration-500"
                        style={{ backgroundColor: settings.primaryColor }}
                    >
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                    </div>

                    {/* Perfil Info */}
                    <div className="px-5 -mt-10 relative z-10">
                        <div className="flex justify-between items-end">
                            <div className="w-20 h-20 rounded-full border-4 border-black bg-gray-800 overflow-hidden">
                                {/* Placeholder Logo */}
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                                    {settings.storeName ? settings.storeName.charAt(0).toUpperCase() : "Q"}
                                </div>
                            </div>
                            {isPremium && (
                                <div className="mb-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">VERIFICADO</div>
                            )}
                        </div>
                        
                        <div className="mt-3">
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {settings.storeName || "Nombre del Consultorio"}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">@{settings.storeSlug || "usuario"}</p>
                            
                            {settings.description && (
                                <p className="text-gray-400 text-xs mt-3 line-clamp-3 leading-relaxed">
                                    {settings.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tabs App */}
                    <div className="flex border-b border-gray-800 mt-6 px-5">
                        <div className="pb-2 border-b-2 border-white text-white text-sm font-medium mr-4">Servicios</div>
                        <div className="pb-2 text-gray-500 text-sm font-medium mr-4">Equipo</div>
                        <div className="pb-2 text-gray-500 text-sm font-medium">Info</div>
                    </div>

                    {/* Lista Servicios Preview */}
                    <div className="p-5 space-y-3">
                        {services.length === 0 ? (
                            <div className="text-center py-8 text-gray-600 text-xs border border-dashed border-gray-800 rounded-lg">
                                Agrega servicios para verlos aquí.
                            </div>
                        ) : (
                            services.map((s, i) => (
                                <div key={i} className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-white">{s.name || "Nuevo Servicio"}</p>
                                        <p className="text-xs text-gray-500">{s.duration} min • {s.serviceDeliveryType === 'in_person' ? 'Presencial' : 'Online'}</p>
                                    </div>
                                    <div className="bg-gray-800 px-2 py-1 rounded text-xs text-white font-bold">
                                        ${s.price}
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* Paquetes Preview */}
                        {packages.length > 0 && (
                            <>
                                <h3 className="text-xs font-bold text-gray-500 mt-6 mb-2 uppercase tracking-wider">Paquetes</h3>
                                {packages.map((p, i) => (
                                    <div key={i} className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-3 rounded-xl">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-bold text-white">{p.name}</p>
                                            <span className="text-xs font-bold text-purple-400">${p.price}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 line-clamp-2">{p.description}</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}