"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, BriefcaseMedical, Sparkles, Info } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Importamos los dos Managers
import { ServicesManager } from "@/components/marketplace/ServicesManager"; 
import { PackagesManager } from "@/components/marketplace/PackagesManager";

// Importamos el Hook y los Tipos
import { useCatalog } from "@/hooks/useCatalog";
import { UI_Service, UI_Package } from "@/types/catalog";
import { cn } from "@/lib/utils";

export default function ServicesSetupPage() {
  const router = useRouter();
  
  // Hook central
  const { 
    services, 
    setServices, 
    packages, 
    setPackages, 
    isLoading, 
    fetchInventory, 
    saveService, 
    deleteService, 
    savePackage, 
    deletePackage,
    uploadItemImage
  } = useCatalog();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handlers: Servicios
  const handleAddService = () => {
    const newService: UI_Service = {
      id: Date.now(), 
      name: "",
      description: "",
      category: "",
      duration: 30,
      price: 0,
      serviceDeliveryType: "in_person",
      cancellationPolicy: "flexible",
      isNew: true,
      hasUnsavedChanges: true,
    };
    setServices([newService, ...services]);
  };

  const handleUpdateService = (id: number, updates: Partial<UI_Service>) => {
    setServices(prev => 
      prev.map(s => s.id === id ? { ...s, ...updates, hasUnsavedChanges: true } : s)
    );
  };

  const handleSaveService = async (service: UI_Service) => {
    if (!service.name || service.price <= 0) {
      toast.error("El nombre y precio son obligatorios");
      return;
    }
    const saved = await saveService(service);
    if (saved) {
      setServices(prev => prev.map(s => s.id === service.id ? saved : s));
      toast.success(`Servicio "${saved.name}" guardado exitosamente`);
    }
  };

  const handleDeleteService = async (id: number) => {
    const isInPackage = packages.some(pkg => pkg.serviceIds.includes(id));
    if (isInPackage) {
      toast.error("No puedes borrar este servicio porque está incluido en un Paquete.");
      return;
    }

    const serviceToDelete = services.find(s => s.id === id);
    if (!serviceToDelete) return;

    if (serviceToDelete.isNew) {
      setServices(prev => prev.filter(s => s.id !== id));
      return;
    }

    const success = await deleteService(id);
    if (success) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Servicio eliminado del catálogo");
    }
  };

  const handleDuplicateService = (service: UI_Service) => {
    const duplicatedService: UI_Service = {
      ...service,
      id: Date.now(),
      name: `${service.name} (Copia)`,
      imageUrl: undefined,
      isNew: true,
      hasUnsavedChanges: true,
    };
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicatedService);
    setServices(newServices);
  };

  const handleServiceImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadItemImage(file);
    if (newUrl) {
      handleUpdateService(id, { imageUrl: newUrl });
      toast.success("Imagen de servicio cargada");
    }
  };

  // Handlers: Paquetes
  const handleSavePackage = async (pkg: UI_Package) => {
    const saved = await savePackage(pkg);
    if (saved) {
      if (pkg.isNew) {
        setPackages(prev => [saved, ...prev.filter(p => p.id !== pkg.id)]);
      } else {
        setPackages(prev => prev.map(p => p.id === pkg.id ? saved : p));
      }
      toast.success("Paquete guardado exitosamente");
    }
  };

  const handleDeletePackage = async (id: number) => {
    const pkgToDelete = packages.find(p => p.id === id);
    if (!pkgToDelete) return;

    if (pkgToDelete.isNew) {
      setPackages(prev => prev.filter(p => p.id !== id));
      return;
    }

    const success = await deletePackage(id);
    if (success) {
      setPackages(prev => prev.filter(p => p.id !== id));
      toast.success("Paquete eliminado");
    }
  };

  const handlePackageImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadItemImage(file);
    if (newUrl) {
      setPackages(prev => prev.map(p => 
        p.id === id ? { ...p, imageUrl: newUrl, hasUnsavedChanges: true } : p
      ));
      toast.success("Imagen de paquete cargada");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-16 h-16 text-purple-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-gray-300 font-bold text-lg">Sincronizando inventario</p>
          <p className="text-gray-500 animate-pulse">Cargando servicios y paquetes...</p>
        </div>
      </div>
    );
  }

  const hasUnsavedServices = services.some(s => s.hasUnsavedChanges || s.isNew);
  const availableServicesForPackages = services.filter(s => !s.isNew && !s.hasUnsavedChanges);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* Sticky Top Bar Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-20 z-40 backdrop-blur-xl"
      >
        <Card className="bg-gradient-to-r from-gray-900/95 to-gray-900/90 border-gray-800 shadow-2xl overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/provider/store')}
                className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver a Mi Tienda
              </Button>

              {hasUnsavedServices && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse">
                    <Info className="w-3 h-3 mr-1" />
                    Cambios sin guardar
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Header Contextual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <BriefcaseMedical className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Servicios y Paquetes
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Catálogo
              </Badge>
              {services.length > 0 && (
                <span className="text-gray-400 text-sm">
                  {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
                </span>
              )}
              {packages.length > 0 && (
                <span className="text-gray-400 text-sm">
                  • {packages.length} {packages.length === 1 ? 'paquete' : 'paquetes'}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Agrega tus consultas individuales primero, y luego agrúpalas en paquetes promocionales para aumentar tus ventas
        </p>
      </motion.div>

      {/* Sección 1: Servicios Individuales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ServicesManager 
          // @ts-ignore
          services={services}
          onAdd={handleAddService}
          onUpdate={handleUpdateService}
          onSave={handleSaveService}
          onDelete={handleDeleteService}
          onDuplicate={handleDuplicateService}
          onImageUpload={handleServiceImageUpload}
        />
      </motion.div>

      {/* Separador Visual Elegante */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center py-8"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent w-full max-w-2xl" />
      </motion.div>

      {/* Sección 2: Paquetes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PackagesManager 
          // @ts-ignore
          packages={packages}
          // @ts-ignore
          availableServices={availableServicesForPackages}
          onSave={handleSavePackage}
          onDelete={handleDeletePackage}
          onImageUpload={handlePackageImageUpload}
        />
      </motion.div>
      
    </div>
  );
}