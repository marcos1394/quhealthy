"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, BriefcaseMedical } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";

// Importamos los dos Managers y sus tipos
import { ServicesManager, Service } from "@/components/marketplace/ServicesManager"; 
import { PackagesManager, ServicePackage } from "@/components/marketplace/PackagesManager";

// (Opcional) Importar tu catalogService real cuando esté listo
// import { catalogService } from "@/services/catalog.service";

export default function ServicesSetupPage() {
  const router = useRouter();
  
  // ==========================================
  // ESTADOS
  // ==========================================
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // CARGA INICIAL (Mockup de Backend)
  // ==========================================
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // 🚧 TODO: Reemplazar con llamadas reales al backend
        // const [fetchedServices, fetchedPackages] = await Promise.all([
        //   catalogService.getServices(),
        //   catalogService.getPackages()
        // ]);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulando red
        
        // Datos mock para probar la UI
        const mockServices: Service[] = [
          {
            id: 1,
            name: "Consulta General",
            description: "Evaluación médica completa y diagnóstico.",
            duration: 30,
            price: 600,
            serviceDeliveryType: "in_person",
            cancellationPolicy: "moderate",
            isNew: false,
            hasUnsavedChanges: false,
          },
          {
            id: 2,
            name: "Limpieza Facial Profunda",
            description: "Extracción, exfoliación y mascarilla hidratante.",
            duration: 60,
            price: 800,
            serviceDeliveryType: "in_person",
            cancellationPolicy: "strict",
            isNew: false,
            hasUnsavedChanges: false,
          }
        ];

        setServices(mockServices);
        setPackages([
          {
            id: 101,
            name: "Pack Renovación Total",
            description: "Consulta de valoración médica + Limpieza facial a un precio especial.",
            price: 1100, // Valor real 1400 (Ahorro de 300)
            serviceIds: [1, 2], 
            isNew: false
          }
        ]);

      } catch (error) {
        toast.error("Error al cargar tu inventario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // ==========================================
  // HANDLERS: SERVICIOS
  // ==========================================
  const handleAddService = () => {
    const newService: Service = {
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

  const handleUpdateService = (id: number, updates: Partial<Service>) => {
    setServices(prev => 
      prev.map(s => s.id === id ? { ...s, ...updates, hasUnsavedChanges: true } : s)
    );
  };

  const handleSaveService = async (service: Service) => {
    try {
      // 🚧 TODO: Conectar con backend real
      await new Promise(resolve => setTimeout(resolve, 500)); 
      setServices(prev => 
        prev.map(s => s.id === service.id ? { ...s, isNew: false, hasUnsavedChanges: false } : s)
      );
    } catch (error) {
      toast.error("Error al guardar el servicio");
    }
  };

  const handleDeleteService = async (id: number) => {
    // Validar si el servicio está en algún paquete antes de borrarlo
    const isInPackage = packages.some(pkg => pkg.serviceIds.includes(id));
    if (isInPackage) {
      toast.error("No puedes borrar este servicio porque está incluido en un Paquete.");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Servicio eliminado");
    } catch (error) {
      toast.error("Error al eliminar del servidor");
    }
  };

  const handleDuplicateService = (service: Service) => {
    const duplicatedService: Service = {
      ...service,
      id: Date.now(),
      name: `${service.name} (Copia)`,
      isNew: true,
      hasUnsavedChanges: true,
    };
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicatedService);
    setServices(newServices);
  };

  // ==========================================
  // HANDLERS: PAQUETES
  // ==========================================
  const handleSavePackage = async (pkg: ServicePackage) => {
    try {
      // 🚧 TODO: Conectar con el backend usando type: 'PACKAGE' y packageItemIds: pkg.serviceIds
      await new Promise(resolve => setTimeout(resolve, 600));

      if (pkg.isNew) {
        // Crear nuevo
        setPackages([{ ...pkg, id: Date.now(), isNew: false }, ...packages]);
      } else {
        // Actualizar existente
        setPackages(prev => prev.map(p => p.id === pkg.id ? { ...pkg, isNew: false } : p));
      }
    } catch (error) {
      toast.error("Error al guardar el paquete");
    }
  };

  const handleDeletePackage = async (id: number) => {
    try {
      // 🚧 TODO: await catalogService.deleteItem(id);
      await new Promise(resolve => setTimeout(resolve, 400));
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast.error("Error al eliminar el paquete");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando tu catálogo e inventario...</p>
      </div>
    );
  }

  // Verifica si hay servicios sin guardar
  const hasUnsavedServices = services.some(s => s.hasUnsavedChanges || s.isNew);

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
        packages={packages}
        availableServices={services.filter(s => !s.isNew && !s.hasUnsavedChanges)} // Solo pasamos servicios reales guardados
        onSave={handleSavePackage}
        onDelete={handleDeletePackage}
      />
      
    </div>
  );
}