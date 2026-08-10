"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  X,
  Save,
  ShieldCheck,
  Users,
  Activity,
  HeartHandshake,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";

import { ehrService } from "@/services/ehr.service";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { PatientBackgroundRequest } from "@/types/ehr";

interface Props {
  patientDirectoryId?: number | null;
  consumerId?: number | null;
  healthProfileId?: number | null;
  mode?: "PROVIDER" | "CONSUMER";
}

export function PatientBackgroundPanel({
  patientDirectoryId,
  consumerId,
  healthProfileId,
  mode = "CONSUMER",
}: Props) {
  const t = useTranslations("EHR");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internalProfileId, setInternalProfileId] = useState<number | null>(
    healthProfileId || null
  );

  // Estados para antecedentes dinámicos
  const [familyBackground, setFamilyBackground] = useState<
    Record<string, string>
  >({});
  const [personalBackground, setPersonalBackground] = useState<
    Record<string, string>
  >({});
  const [socialBackground, setSocialBackground] = useState<
    Record<string, string>
  >({});

  const fetchProfile = useCallback(async () => {
    console.log("🏥 [PatientBackgroundPanel] fetchProfile iniciado", { mode, patientDirectoryId, consumerId });
    setLoading(true);
    try {
      if (mode === "PROVIDER") {
        if (patientDirectoryId) {
          console.log("🏥 [PatientBackgroundPanel] Llamando a getDirectoryPatientHealthProfile con ID:", patientDirectoryId);
          const profile = await ehrService.getDirectoryPatientHealthProfile(patientDirectoryId);
          console.log("🏥 [PatientBackgroundPanel] Respuesta de getDirectoryPatientHealthProfile:", profile);
          if (profile) {
            if (profile.id) {
              console.log("🏥 [PatientBackgroundPanel] ID de perfil interno establecido:", profile.id);
              setInternalProfileId(profile.id);
            } else {
               console.warn("⚠️ [PatientBackgroundPanel] El perfil regresó pero sin ID");
            }
            setFamilyBackground(profile.familyBackground || {});
            setPersonalBackground(profile.personalBackground || {});
            setSocialBackground(profile.socialBackground || {});
          }
        } else {
          console.error("🚨 [PatientBackgroundPanel] PatientDirectoryId es nulo o indefinido en modo PROVIDER. No se hará la llamada al backend.");
        }
      } else {
        // Modo CONSUMER original (o fallback)
        if (patientDirectoryId) {
          console.log("🏥 [PatientBackgroundPanel] CONSUMER mode - Llamando getDirectoryPatientHealthProfile", patientDirectoryId);
          const profile = await ehrService.getDirectoryPatientHealthProfile(
            patientDirectoryId
          );
          if (profile) {
            if (profile.id) setInternalProfileId(profile.id);
            setFamilyBackground(profile.familyBackground || {});
            setPersonalBackground(profile.personalBackground || {});
            setSocialBackground(profile.socialBackground || {});
          }
        } else if (consumerId) {
          console.log("🏥 [PatientBackgroundPanel] CONSUMER mode - Llamando consumerProfileService.getProfile", consumerId);
          const profile = await consumerProfileService.getProfile();
          if (profile) {
            setFamilyBackground(profile.familyBackground || {});
            setPersonalBackground(profile.personalBackground || {});
            setSocialBackground(profile.socialBackground || {});
          }
        }
      }
    } catch (error) {
      console.error("❌ [PatientBackgroundPanel] Error fetching health profile:", error);
    } finally {
      setLoading(false);
    }
  }, [patientDirectoryId, consumerId, mode]);

  useEffect(() => {
    console.log("🔄 [PatientBackgroundPanel] useEffect evaluando dependencias:", { patientDirectoryId, consumerId, mode });
    if (patientDirectoryId || (consumerId && mode !== "PROVIDER")) {
      console.log("🔄 [PatientBackgroundPanel] Condición cumplida. Llamando fetchProfile()");
      fetchProfile();
    } else {
      console.warn("⚠️ [PatientBackgroundPanel] Condición NO cumplida. Cancelando llamada al backend. patientDirectoryId está vacío en modo PROVIDER.");
      setLoading(false);
    }
  }, [patientDirectoryId, consumerId, fetchProfile, mode]);

  const handleSave = async () => {
    console.log("💾 [PatientBackgroundPanel] Intentando guardar...", { internalProfileId, healthProfileId, consumerId, mode });
    const activeId = internalProfileId || healthProfileId;
    
    if (!activeId && (!consumerId || mode === "PROVIDER")) {
      console.error("🚫 [PatientBackgroundPanel] Bloqueado al guardar. No hay activeId y estamos en modo PROVIDER.");
      toast.error(t("health_profile_missing"));
      return;
    }

    setSaving(true);
    try {
      const payload: PatientBackgroundRequest = {
        healthProfileId: activeId || 0,
        familyBackground,
        personalBackground,
        socialBackground,
      };

      console.log("💾 [PatientBackgroundPanel] Payload a enviar:", payload);

      if (mode === "PROVIDER") {
        console.log("💾 [PatientBackgroundPanel] Ejecutando updateProviderPatientBackground");
        await ehrService.updateProviderPatientBackground(payload);
      } else {
        if (patientDirectoryId) {
          await ehrService.updateProviderPatientBackground(payload);
        } else if (consumerId) {
          const currentProfile = await consumerProfileService.getProfile();
          await consumerProfileService.updateProfile({
            ...currentProfile,
            familyBackground,
            personalBackground,
            socialBackground,
          });
        }
      }

      toast.success(t("background_updated_success"));
      await fetchProfile();
    } catch (error) {
      console.error("❌ [PatientBackgroundPanel] Error saving backgrounds:", error);
      toast.error(t("background_update_failed"));
    } finally {
      setSaving(false);
    }
  };

  const renderMapEditor = (
    title: string,
    icon: React.ReactNode,
    data: Record<string, string>,
    setData: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    placeholderKey: string,
    placeholderVal: string
  ) => {
    const handleAdd = () => {
      setData({ ...data, "": "" });
    };

    const handleKeyChange = (oldKey: string, newKey: string) => {
      const newData = { ...data };
      const val = newData[oldKey];
      delete newData[oldKey];
      newData[newKey] = val;
      setData(newData);
    };

    const handleValChange = (key: string, val: string) => {
      setData({ ...data, [key]: val });
    };

    const handleRemove = (key: string) => {
      const newData = { ...data };
      delete newData[key];
      setData(newData);
    };

    const entries = Object.entries(data);

    return (
      <div className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs space-y-4 transition-colors">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              {icon}
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">
              {title}
            </h4>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-9 px-3.5 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            <span>{t("btn_add_entry")}</span>
          </Button>
        </div>

        {entries.length === 0 ? (
          <div className="py-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
            <p className="text-xs font-medium text-gray-400">
              {t("no_data_added")}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map(([key, value], index) => (
              <div key={index} className="flex gap-2.5 items-center">
                <div className="w-1/3 min-w-[120px]">
                  <Input
                    type="text"
                    value={key}
                    placeholder={placeholderKey}
                    onChange={(e) => handleKeyChange(key, e.target.value)}
                    className="h-10 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-xs"
                  />
                </div>

                <div className="flex-1">
                  <Input
                    type="text"
                    value={value}
                    placeholder={placeholderVal}
                    onChange={(e) => handleValChange(key, e.target.value)}
                    className="h-10 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(key)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer border border-gray-100 dark:border-gray-800"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3 font-sans shadow-xs">
        <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400">{t("nom004_title")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm font-sans transition-colors">
      {/* ── CABECERA ─────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("nom004_title")}
          </h3>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <QhSpinner size="sm" className="text-white" />
              <span>{t("btn_saving_changes")}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_save_changes")}</span>
            </>
          )}
        </Button>
      </div>

      {/* ── NOTICIA DE NORMATIVA ──────────────────────────────────────── */}
      <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium leading-relaxed">
          <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
          <span>{t("nom004_notice")}</span>
        </div>

        {/* ── SECCIONES DE ANTECEDENTES ───────────────────────────────── */}
        {renderMapEditor(
          t("family_background"),
          <Users className="w-4 h-4" strokeWidth={2} />,
          familyBackground,
          setFamilyBackground,
          t("family_bg_key_placeholder"),
          t("family_bg_val_placeholder")
        )}

        {renderMapEditor(
          t("personal_background"),
          <Activity className="w-4 h-4" strokeWidth={2} />,
          personalBackground,
          setPersonalBackground,
          t("personal_bg_key_placeholder"),
          t("personal_bg_val_placeholder")
        )}

        {renderMapEditor(
          t("social_background"),
          <HeartHandshake className="w-4 h-4" strokeWidth={2} />,
          socialBackground,
          setSocialBackground,
          t("social_bg_key_placeholder"),
          t("social_bg_val_placeholder")
        )}
      </div>
    </div>
  );
}