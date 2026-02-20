"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles, BriefcaseMedical } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
// Asegúrate de importar correctamente el componente y el tipo Service
import { ServicesManager, Service } from "@/components/marketplace/ServicesManager"; 

export default function ServicesSetupPage() {
  const router = useRouter();
  
  // Estado local para los servicios
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Cargar servicios desde el backend al entrar
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // 🚧 TODO: Reemplazar con llamada real: await catalogService.getServices()
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulando red
        
        // Datos mock para empezar
        setServices([
          {
            id: 1,
            name: "Consulta General",
            description: "Evaluación médica completa, diagnóstico y receta electrónica.",
            duration: 30,
            price: 600,
            serviceDeliveryType: "in_person",
            cancellationPolicy: "moderate",
            followUpPeriodDays: 7,
            isNew: false,
            hasUnsavedChanges: false,
          }
        ]);
      } catch (error) {
        toast.error("Error al cargar tus servicios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // ➕ Crear un nuevo servicio "en borrador"
  const handleAddService = () => {
    const newService: Service = {
      id: Date.now(), // ID temporal para React Key
      name: "",
      description: "",
      duration: 30,
      price: 0,
      serviceDeliveryType: "in_person",
      cancellationPolicy: "flexible",
      isNew: true, // Flag para saber que no existe en BD
      hasUnsavedChanges: true,
    };
    // Lo agregamos al inicio de la lista
    setServices([newService, ...services]);
  };

  // ✏️ Actualizar estado local mientras el usuario escribe
  const handleUpdateService = (id: number, updates: Partial<Service>) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, ...updates, hasUnsavedChanges: true } 
          : service
      )
    );
  };

  // 💾 Guardar un servicio específico en la Base de Datos
  const handleSaveService = async (service: Service) => {
    try {
      // 🚧 TODO: Conectar con backend real
      // const savedService = await catalogService.saveService(service);
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulando red
      
      // Actualizamos el estado para quitar las alertas de "Sin guardar"
      setServices(prev => 
        prev.map(s => 
          s.id === service.id 
            ? { ...s, isNew: false, hasUnsavedChanges: false } // Si el backend regresa un ID real, reemplazarlo aquí
            : s
        )
      );
    } catch (error) {
      toast.error("Error al guardar el servicio");
    }
  };

  // 🗑️ Eliminar un servicio
  const handleDeleteService = async (id: number) => {
    const serviceToDelete = services.find(s => s.id === id);
    
    // Si ya existía en la BD, lo borramos del backend primero
    if (serviceToDelete && !serviceToDelete.isNew) {
      try {
        // 🚧 TODO: await catalogService.deleteService(id);
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (error) {
        toast.error("Error al eliminar del servidor");
        return;
      }
    }

    // Lo quitamos de la UI
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // 📋 Duplicar un servicio
  const handleDuplicateService = (service: Service) => {
    const duplicatedService: Service = {
      ...service,
      id: Date.now(), // Nuevo ID temporal
      name: `${service.name} (Copia)`,
      isNew: true,
      hasUnsavedChanges: true,
    };
    
    // Lo insertamos justo después del original
    const index = services.findIndex(s => s.id === service.id);
    const newServices = [...services];
    newServices.splice(index + 1, 0, duplicatedService);
    
    setServices(newServices);
  };

  // ⏳ Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando tu catálogo de servicios...</p>
      </div>
    );
  }

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

        {/* Muestra un indicador si hay cosas sin guardar */}
        {services.some(s => s.hasUnsavedChanges || s.isNew) && (
          <span className="text-sm font-semibold text-amber-400 animate-pulse hidden sm:block">
            Tienes cambios sin guardar
          </span>
        )}
      </div>

      {/* Header Contextual */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <BriefcaseMedical className="w-8 h-8 text-purple-400" />
          Tus Servicios Médicos
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Agrega consultas, procedimientos y tratamientos. Tus pacientes verán esta lista al agendar.
        </p>
      </div>

      {/* 🚀 Componente Manager Integrado */}
      <ServicesManager 
        services={services}
        onAdd={handleAddService}
        onUpdate={handleUpdateService}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
        onDuplicate={handleDuplicateService}
      />
      
    </div>
  );
}