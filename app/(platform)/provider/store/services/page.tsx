"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, BriefcaseMedical } from "lucide-react";
import { toast } from "react-toastify";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";

// Importamos los dos Managers
import { ServicesManager } from "@/components/marketplace/ServicesManager"; 
import { PackagesManager } from "@/components/marketplace/PackagesManager";

// Importamos el Hook y los Tipos
import { useCatalog } from "@/hooks/useCatalog";
import { UI_Service, UI_Package } from "@/types/catalog";

export default function ServicesSetupPage() {
  const router = useRouter();
  
  // ==========================================
  // HOOK CENTRAL
  // ==========================================
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
    uploadItemImage // 📸 Función extraída
  } = useCatalog();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ==========================================
  // HANDLERS: SERVICIOS
  // ==========================================
  const handleAddService = () => {
    const newService: UI_Service = {
      id: Date.now(), 
      name: "",
      description: "",
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
      imageUrl: undefined, // 📸 Evitamos copiar la imagen por default para que suban una nueva
      isNew: true,
      hasUnsavedChanges: true,
    };
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicatedService);
    setServices(newServices);
  };

  // 📸 Subir Imagen para Servicio
  const handleServiceImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadItemImage(file);
    if (newUrl) {
      handleUpdateService(id, { imageUrl: newUrl });
      toast.success("Imagen de servicio cargada");
    }
  };

  // ==========================================
  // HANDLERS: PAQUETES
  // ==========================================
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

  // 📸 Subir Imagen para Paquete
  const handlePackageImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadItemImage(file);
    if (newUrl) {
      setPackages(prev => prev.map(p => 
        p.id === id ? { ...p, imageUrl: newUrl, hasUnsavedChanges: true } : p
      ));
      toast.success("Imagen de paquete cargada");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Sincronizando inventario...</p>
      </div>
    );
  }

  const hasUnsavedServices = services.some(s => s.hasUnsavedChanges || s.isNew);
  const availableServicesForPackages = services.filter(s => !s.isNew && !s.hasUnsavedChanges);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* 🚀 Top Bar Navigation */}
      <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-xl sticky top-20 z-40 backdrop-blur-md">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/provider/store')}
          className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Mi Tienda
        </Button>

        {hasUnsavedServices && (
          <span className="text-sm font-semibold text-amber-400 animate-pulse hidden sm:block">
            Tienes servicios sin guardar
          </span>
        )}
      </div>

      {/* Header Contextual */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <BriefcaseMedical className="w-8 h-8 text-purple-400" />
          Tus Servicios y Paquetes
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Agrega tus consultas individuales primero, y luego agrúpalas en paquetes para aumentar tus ventas.
        </p>
      </div>

      {/* Sección 1: Servicios Individuales */}
      <ServicesManager 
        // @ts-ignore
        services={services}
        onAdd={handleAddService}
        onUpdate={handleUpdateService}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
        onDuplicate={handleDuplicateService}
        onImageUpload={handleServiceImageUpload} // 📸 Prop de imagen enviada
      />

      {/* Separador Visual Elegante */}
      <div className="flex items-center justify-center py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent w-full max-w-md" />
      </div>

      {/* Sección 2: Paquetes (Dependen de los servicios) */}
      <PackagesManager 
        // @ts-ignore
        packages={packages}
        // @ts-ignore
        availableServices={availableServicesForPackages}
        onSave={handleSavePackage}
        onDelete={handleDeletePackage}
        onImageUpload={handlePackageImageUpload} // 📸 Prop de imagen enviada
      />
      
    </div>
  );
}