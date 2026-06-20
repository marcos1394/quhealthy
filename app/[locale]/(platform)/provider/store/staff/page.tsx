"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Save, Users } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { StaffManager } from "@/components/marketplace/StaffManager";
import { useStaff } from "@/hooks/useStaff";
import { UI_StaffMember } from "@/types/staff";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';
import { cn } from "@/lib/utils";

export default function StaffSetupPage() {
  const router = useRouter();
  const t = useTranslations('StoreStaff');

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
      toast.warning(t('toast_invalid_name'));
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
        toast.success(t('toast_success'));
        router.push("/provider/store");
      } else {
        toast.warning(t('toast_partial_success'));
        // En caso de fallos parciales, recargamos de la BD para sincronizar
        fetchStaff();
      }
    } catch (error) {
      handleApiError(error);
      toast.error(t('toast_error'));
    } finally {
      setIsSavingAll(false);
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white animate-pulse">
          {t('loading')}
        </p>
      </div>
    );
  }

  const hasUnsavedChanges = staff.some(m => m.hasUnsavedChanges || m.isNew);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] p-6 md:p-12 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12 pb-24">

        {/* 🚀 Top Bar Navigation (Blueprint) */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 sticky top-0 bg-white dark:bg-[#0a0a0a] z-40 pt-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/provider/store')}
            className="rounded-none text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-3" strokeWidth={2} />
            {t('back')}
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isSavingAll || !hasUnsavedChanges}
            className={cn(
              "rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
              isSavingAll || !hasUnsavedChanges 
                ? "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed" 
                : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            )}
          >
            {isSavingAll ? (
              <><Loader2 className="w-4 h-4 mr-3 animate-spin" /> {t('btn_saving')}</>
            ) : (
              <><Save className="w-4 h-4 mr-3" strokeWidth={2} /> {t('btn_save')}</>
            )}
          </Button>
        </div>

        {/* Header Contextual */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] shrink-0">
            <Users className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-2">
              {t('title')}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Integración del Componente Visual */}
        {/* Nota: Es probable que <StaffManager /> también necesite una pasada de refactorización visual si tiene sombras o curvas */}
        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <StaffManager
            staff={staff}
            onAdd={handleAddMember}
            onUpdate={handleUpdateMember}
            onDelete={handleDeleteMember}
            onImageUpload={handleImageUpload}
            isBusinessPlan={isBusinessPlan}
            onUpgrade={() => toast.info(t('toast_upgrade'))}
          />
        </div>

      </div>
    </div>
  );
}