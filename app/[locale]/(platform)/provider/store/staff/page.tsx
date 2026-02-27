"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Users } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { StaffManager } from "@/components/marketplace/StaffManager";
import { useStaff } from "@/hooks/useStaff";
import { UI_StaffMember } from "@/types/staff";

export default function StaffSetupPage() {
  const router = useRouter();
  
  // Extraemos las funciones del nuevo Hook
  const { 
    staff, setStaff, 
    isLoading, fetchStaff, 
    saveMember, deleteMember, uploadAvatar 
  } = useStaff();

  const [isSavingAll, setIsSavingAll] = useState(false);

  // 🚧 TODO: Validar con tu sistema de Auth si el usuario es Plan Business
  const isBusinessPlan = true; 

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // --- HANDLERS DEL COMPONENTE ---

  const handleAddMember = () => {
    const newMember: UI_StaffMember = {
      id: Date.now(),
      name: "",
      specialty: "",
      bio: "",
      role: "specialist",
      isNew: true,
      hasUnsavedChanges: true
    };
    setStaff([newMember, ...staff]); // Lo ponemos al principio
  };

  const handleUpdateMember = (id: number, field: keyof UI_StaffMember, value: string) => {
    setStaff(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value, hasUnsavedChanges: true } : member
    ));
  };

  const handleDeleteMember = async (id: number) => {
    const member = staff.find(m => m.id === id);
    if (!member) return;

    if (member.isNew) {
      setStaff(prev => prev.filter(m => m.id !== id));
      return;
    }

    const success = await deleteMember(id);
    if (success) {
      setStaff(prev => prev.filter(m => m.id !== id));
    }
  };

  // ☁️ Subida a GCP
  const handleImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadAvatar(file);
    if (newUrl) {
      // Actualizamos la URL de la imagen en el estado local (esto activa el hasUnsavedChanges)
      handleUpdateMember(id, 'imageUrl', newUrl);
    }
  };

  // 💾 Guardado Masivo
  const handleSaveAll = async () => {
    // Validar que todos los que tengan cambios tengan al menos un nombre
    const invalidMembers = staff.filter(m => (m.isNew || m.hasUnsavedChanges) && !m.name);
    if (invalidMembers.length > 0) {
      toast.error("Todos los colaboradores deben tener un nombre.");
      return;
    }

    setIsSavingAll(true);
    try {
      // Filtramos solo los que necesitan ser guardados
      const membersToSave = staff.filter(m => m.isNew || m.hasUnsavedChanges);
      
      // Guardamos en paralelo
      const savePromises = membersToSave.map(m => saveMember(m));
      const results = await Promise.all(savePromises);

      // Si todo sale bien
      const allSuccessful = results.every(res => res !== null);
      if (allSuccessful) {
        toast.success("Equipo actualizado correctamente");
        router.push("/provider/store");
      } else {
        // En caso de fallos parciales, recargamos de la BD para sincronizar
        fetchStaff(); 
      }
    } catch (error) {
      toast.error("Error general al guardar el equipo");
    } finally {
      setIsSavingAll(false);
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Sincronizando equipo...</p>
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
          disabled={isSavingAll || !hasUnsavedChanges}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/20"
        >
          {isSavingAll ? (
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
          Agrega a los profesionales que atienden en tu consultorio. Sube sus fotos para aumentar la confianza.
        </p>
      </div>

      {/* Integración del Componente Visual */}
      <StaffManager 
        // @ts-ignore
        staff={staff}
        onAdd={handleAddMember}
        onUpdate={handleUpdateMember}
        onDelete={handleDeleteMember}
        onImageUpload={handleImageUpload} // Aquí le pasamos la magia de GCP
        isBusinessPlan={isBusinessPlan}
        onUpgrade={() => toast.info("Redirigiendo a planes...")}
      />
      
    </div>
  );
}