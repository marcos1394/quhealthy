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
      toast.error(t('toast_name_required'));
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
        // En caso de fallos parciales, recargamos de la BD para sincronizar
        fetchStaff();
      }
    } catch (error) {
      toast.error(t('toast_error'));
    } finally {
      setIsSavingAll(false);
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-medical-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  const hasUnsavedChanges = staff.some(m => m.hasUnsavedChanges || m.isNew);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-4xl mx-auto space-y-8 pb-16">

        {/* 🚀 Top Bar Navigation */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 z-40 backdrop-blur-xl">
          <Button
            variant="ghost"
            onClick={() => router.push('/provider/store')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('back')}
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isSavingAll || !hasUnsavedChanges}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/20"
          >
            {isSavingAll ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('btn_saving')}</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> {t('btn_save')}</>
            )}
          </Button>
        </div>

        {/* Header Contextual */}
        <div className="px-2">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20 shadow-sm">
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-base md:text-lg">
                {t('subtitle')}
              </p>
            </div>
          </div>
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
          onUpgrade={() => toast.info(t('toast_upgrade'))}
        />

      </div>
    </div>
  );
}