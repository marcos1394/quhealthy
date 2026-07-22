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
 <div className="min-h-screen flex flex-col justify-center items-center gap-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
 <QhSpinner size="lg" />
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
 {t('loading')}
 </p>
 </div>
 );
 }

 const hasUnsavedChanges = staff.some(m => m.hasUnsavedChanges || m.isNew);

 return (
 <div className="min-h-screen bg-gray-50/30 dark:bg-[#050505]/30 p-6 md:p-12 font-sans transition-colors duration-300">
 <div className="max-w-4xl mx-auto space-y-8 pb-24">

 {/* 🚀 Top Bar Navigation */}
 <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 sticky top-0 bg-gray-50/30 dark:bg-[#050505]/30 backdrop-blur-md z-40 pt-4">
 <Button
 variant="ghost"
 onClick={() => router.push('/provider/store')}
 className="rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-900 shadow-sm transition-colors px-4 h-12"
 >
 <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
 {t('back')}
 </Button>

 <Button
 onClick={handleSaveAll}
 disabled={isSavingAll || !hasUnsavedChanges}
 className={cn(
 "rounded-xl h-12 px-8 text-sm font-bold transition-colors border-0 shadow-sm",
 isSavingAll || !hasUnsavedChanges 
 ? "bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed" 
 : "bg-emerald-600 text-white hover:bg-emerald-700"
 )}
 >
 {isSavingAll ? (
 <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('btn_saving')}</>
 ) : (
 <><Save className="w-4 h-4 mr-2" strokeWidth={2} /> {t('btn_save')}</>
 )}
 </Button>
 </div>

 {/* Header Contextual */}
 <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
 <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
 {t('title')}
 </h1>
 <p className="text-sm font-medium text-gray-500">
 {t('subtitle')}
 </p>
 </div>
 </div>

 {/* Integración del Componente Visual */}
 <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
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