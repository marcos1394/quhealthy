"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Users } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { StaffManager } from "@/components/marketplace/StaffManager";
import { useStaff } from "@/hooks/useStaff";
import { UI_StaffMember } from "@/types/staff";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { handleApiError } from "@/lib/handleApiError";
import { cn } from "@/lib/utils";

export default function StaffSetupPage() {
  const router = useRouter();
  const t = useTranslations("StoreStaff");

  const {
    staff,
    setStaff,
    isLoading,
    fetchStaff,
    saveMember,
    deleteMember,
    uploadAvatar,
  } = useStaff();

  const [isSavingAll, setIsSavingAll] = useState(false);

  // Validar con sistema de Auth/Suscripción si aplica
  const isBusinessPlan = true;

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddMember = () => {
    const newMember: UI_StaffMember = {
      id: Date.now(),
      name: "",
      specialty: "",
      bio: "",
      role: "specialist",
      isNew: true,
      hasUnsavedChanges: true,
    };
    setStaff([newMember, ...staff]);
  };

  const handleUpdateMember = (
    id: number,
    field: keyof UI_StaffMember,
    value: string
  ) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, [field]: value, hasUnsavedChanges: true }
          : member
      )
    );
  };

  const handleDeleteMember = async (id: number) => {
    const member = staff.find((m) => m.id === id);
    if (!member) return;

    if (member.isNew) {
      setStaff((prev) => prev.filter((m) => m.id !== id));
      return;
    }

    const success = await deleteMember(id);
    if (success) {
      setStaff((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleImageUpload = async (id: number, file: File) => {
    const newUrl = await uploadAvatar(file);
    if (newUrl) {
      handleUpdateMember(id, "imageUrl", newUrl);
    }
  };

  const handleSaveAll = async () => {
    const invalidMembers = staff.filter(
      (m) => (m.isNew || m.hasUnsavedChanges) && !m.name.trim()
    );
    if (invalidMembers.length > 0) {
      toast.warning(t("toast_invalid_name"));
      return;
    }

    setIsSavingAll(true);
    try {
      const membersToSave = staff.filter((m) => m.isNew || m.hasUnsavedChanges);
      const savePromises = membersToSave.map((m) => saveMember(m));
      const results = await Promise.all(savePromises);

      const allSuccessful = results.every((res) => res !== null);
      if (allSuccessful) {
        toast.success(t("toast_success"));
        router.push("/provider/store");
      } else {
        toast.warning(t("toast_partial_success"));
        fetchStaff();
      }
    } catch (error) {
      handleApiError(error);
      toast.error(t("toast_error"));
    } finally {
      setIsSavingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  const hasUnsavedChanges = staff.some((m) => m.hasUnsavedChanges || m.isNew);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.push("/provider/store")}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
          >
            <ArrowLeft
              className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
            <span>{t("back")}</span>
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isSavingAll || !hasUnsavedChanges}
            className={cn(
              "h-11 px-6 rounded-xl text-xs font-bold transition-all border-0 shadow-sm flex items-center gap-2",
              isSavingAll || !hasUnsavedChanges
                ? "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
            )}
          >
            {isSavingAll ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save")}</span>
              </>
            )}
          </Button>
        </div>

        {/* Contextual Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-1">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
        </motion.div>

        {/* Staff Manager Visual Component */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden"
        >
          <StaffManager
            staff={staff}
            onAdd={handleAddMember}
            onUpdate={handleUpdateMember}
            onDelete={handleDeleteMember}
            onImageUpload={handleImageUpload}
            isBusinessPlan={isBusinessPlan}
            onUpgrade={() => toast.info(t("toast_upgrade"))}
          />
        </motion.div>
      </div>
    </div>
  );
}