"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, BriefcaseMedical } from "lucide-react";
import { toast } from "react-toastify";

// Componentes UI genéricos
import { Button } from "@/components/ui/button";

// Importamos los dos Managers (Asegúrate de que las rutas sean correctas)
import { ServicesManager } from "@/components/marketplace/ServicesManager"; 
import { PackagesManager } from "@/components/marketplace/PackagesManager";

// Importamos el Hook y los Tipos que acabamos de crear
import { useCatalog } from "@/hooks/useCatalog";
import { UI_Service, UI_Package } from "@/types/catalog";

export default function ServicesSetupPage() {
  const router = useRouter();
  
  // ==========================================
  // HOOK CENTRAL (Estado y Backend)
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
    deletePackage 
  } = useCatalog();

  // Cargar inventario al montar la página
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // ==========================================
  // HANDLERS: SERVICIOS
  // ==========================================
  const handleAddService = () => {
    const newService: UI_Service = {
      id: Date.now(), // ID temporal para React Key
      name: "",
      description: "",
      duration: 30,
      price: 0,
      serviceDeliveryType: "in_person",
      cancellationPolicy: "flexible",
      isNew: true,
      hasUnsavedChanges: true,
    };
    // Lo agregamos al inicio de la lista local
    setServices([newService, ...services]);
  };

  const handleUpdateService = (id: number, updates: Partial<UI_Service>) => {
    // Actualizamos el estado local mientras el usuario escribe
    setServices(prev => 
      prev.map(s => s.id === id ? { ...s, ...updates, hasUnsavedChanges: true } : s)
    );
  };

  const handleSaveService = async (service: UI_Service) => {
    // Validaciones básicas de front
    if (!service.name || service.price <= 0) {
      toast.error("El nombre y precio son obligatorios");
      return;
    }

    // Llamamos al Hook que se comunica con Java
    const saved = await saveService(service);
    
    // Si la BD responde bien, actualizamos la UI con los datos reales
    if (saved) {
      setServices(prev => prev.map(s => s.id === service.id ? saved : s));
      toast.success(`Servicio "${saved.name}" guardado exitosamente`);
    }
  };

  const handleDeleteService = async (id: number) => {
    // 1. Validar si el servicio está agrupado en algún paquete
    const isInPackage = packages.some(pkg => pkg.serviceIds.includes(id));
    if (isInPackage) {
      toast.error("No puedes borrar este servicio porque está incluido en un Paquete.");
      return;
    }

    // 2. Encontrar el servicio
    const serviceToDelete = services.find(s => s.id === id);
    if (!serviceToDelete) return;

    // 3. Si era un borrador (isNew), solo lo borramos de React
    if (serviceToDelete.isNew) {
      setServices(prev => prev.filter(s => s.id !== id));
      return;
    }

    // 4. Si es real, lo borramos en Java
    const success = await deleteService(id);
    if (success) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Servicio eliminado del catálogo");
    }
  };

  const handleDuplicateService = (service: UI_Service) => {
    const duplicatedService: UI_Service = {
      ...service,
      id: Date.now(), // Nuevo ID temporal
      name: `${service.name} (Copia)`,
      isNew: true,
      hasUnsavedChanges: true,
    };
    
    // Lo insertamos justo debajo del original
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicatedService);
    setServices(newServices);
  };

  // ==========================================
  // HANDLERS: PAQUETES
  // ==========================================
  const handleSavePackage = async (pkg: UI_Package) => {
    const saved = await savePackage(pkg);
    
    if (saved) {
      if (pkg.isNew) {
        // Si era nuevo, lo reemplazamos en la lista (para que tenga su ID real de BD)
        setPackages(prev => [saved, ...prev.filter(p => p.id !== pkg.id)]);
      } else {
        // Si ya existía, actualizamos sus datos
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

  // Verifica si hay servicios sin guardar para mostrar la advertencia arriba
  const hasUnsavedServices = services.some(s => s.hasUnsavedChanges || s.isNew);
  // Filtramos los servicios que ya están guardados en BD para que los paquetes solo usen servicios reales
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
        // @ts-ignore - Ignoramos tipado estricto si tus interfaces del componente difieren ligeramente
        services={services}
        onAdd={handleAddService}
        onUpdate={handleUpdateService}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
        onDuplicate={handleDuplicateService}
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
      />
      
    </div>
  );
}