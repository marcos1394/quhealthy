"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Users, Crown } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
// Asegúrate de importar tu componente correctamente
import { StaffManager, StaffMember } from "@/components/marketplace/StaffManager";

export default function StaffSetupPage() {
  const router = useRouter();
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🚧 TODO: Sacar esto de tu SessionStore real (Hook de Auth)
  const isBusinessPlan = true; // Cambia a false para ver tu hermoso mensaje de Upsell

  useEffect(() => {
    // 🚧 TODO: Llamada real: await catalogService.getStaff()
    const fetchStaff = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStaff([
          {
            id: 1,
            name: "Dr. Marcos Sandoval",
            specialty: "Médico Cirujano",
            bio: "Especialista con 10 años de experiencia...",
            role: "lead",
            isNew: false,
            hasUnsavedChanges: false
          }
        ]);
      } catch (error) {
        toast.error("Error al cargar tu equipo");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // --- HANDLERS ---
  const handleAddMember = () => {
    const newMember: StaffMember = {
      id: Date.now(),
      name: "",
      specialty: "",
      bio: "",
      role: "specialist",
      isNew: true,
      hasUnsavedChanges: true
    };
    setStaff([...staff, newMember]);
  };

  const handleUpdateMember = (id: number, field: keyof StaffMember, value: string) => {
    setStaff(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value, hasUnsavedChanges: true } : member
    ));
  };

  const handleDeleteMember = (id: number) => {
    // 🚧 TODO: Si no es isNew, llamar API delete
    setStaff(prev => prev.filter(member => member.id !== id));
  };

  const handleImageUpload = async (id: number, file: File) => {
    // 🚧 TODO: Llamar al servicio GCP que hicimos: await storeService.uploadMedia(file, 'STAFF_AVATAR')
    const tempUrl = URL.createObjectURL(file);
    handleUpdateMember(id, 'imageUrl', tempUrl);
  };

  // 💾 Guardar Todo
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 🚧 TODO: Enviar el array de staff al backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Equipo actualizado correctamente");
      // Limpiamos los flags de cambios sin guardar
      setStaff(prev => prev.map(m => ({ ...m, isNew: false, hasUnsavedChanges: false })));
      router.push("/provider/store");
    } catch (error) {
      toast.error("Error al guardar el equipo");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Cargando tu equipo...</p>
      </div>
    );
  }

  const hasUnsavedChanges = staff.some(m => m.hasUnsavedChanges || m.isNew);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
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

        <Button 
          onClick={handleSaveAll}
          disabled={isSaving || !hasUnsavedChanges}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/20"
        >
          {isSaving ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Guardar Equipo</>
          )}
        </Button>
      </div>

      {/* Header Contextual */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-400" />
          Tu Equipo de Trabajo
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Agrega a los profesionales que atienden en tu consultorio. Los pacientes podrán elegir con quién agendar.
        </p>
      </div>

      {/* Integración del Componente */}
      <StaffManager 
        staff={staff}
        onAdd={handleAddMember}
        onUpdate={handleUpdateMember}
        onDelete={handleDeleteMember}
        onImageUpload={handleImageUpload}
        isBusinessPlan={isBusinessPlan}
        onUpgrade={() => toast.info("Redirigiendo a planes...")}
      />
      
    </div>
  );
}