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
  Sparkles,
  CheckCircle2,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

import { ehrService } from "@/services/ehr.service";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PatientBackgroundRequest } from "@/types/ehr";

interface Props {
  patientDirectoryId?: number | null;
  consumerId?: number | null;
  healthProfileId?: number | null;
  mode?: "PROVIDER" | "CONSUMER";
}

interface BackgroundEntry {
  id: string;
  key: string;
  value: string;
}

const SYSTEM_KEYS = new Set([
  "curp",
  "rfc",
  "ethnicGroup",
  "healthInsurance",
  "insuranceType",
  "insuranceProvider",
  "insurancePolicyNumber",
  "insurancePlanName",
  "maritalStatus",
  "occupation",
  "nationality",
  "organDonor",
  "addressStreet",
  "addressCity",
  "addressState",
  "addressPostalCode",
  "emergencyContactRelationship",
  "emergencyContactPhoneAlt",
  "emergencyContactName",
  "emergencyContactPhone",
  "chronicDiseases",
  "surgeries",
  "implantsDevices",
  "vaccinations",
  "primaryPhysician",
]);

let entryCounter = 0;
function createEntry(key = "", value = ""): BackgroundEntry {
  entryCounter++;
  return {
    id: `bg-entry-${Date.now()}-${entryCounter}-${Math.random().toString(36).substring(2, 7)}`,
    key,
    value,
  };
}

function recordToEntries(rec?: Record<string, any> | null): BackgroundEntry[] {
  if (!rec) return [];
  const entries: BackgroundEntry[] = [];
  for (const [k, v] of Object.entries(rec)) {
    if (!SYSTEM_KEYS.has(k) && v !== undefined && v !== null) {
      entries.push(
        createEntry(k, typeof v === "string" ? v : JSON.stringify(v))
      );
    }
  }
  return entries;
}

function entriesToRecord(entries: BackgroundEntry[]): Record<string, string> {
  const rec: Record<string, string> = {};
  for (const item of entries) {
    const k = item.key.trim();
    if (k || item.value.trim()) {
      rec[k || `Antecedente_${Math.random().toString(36).substring(2, 6)}`] =
        item.value;
    }
  }
  return rec;
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

  // Estados estructurados con IDs estables para evitar pérdida de cursor y bugs de edición
  const [familyEntries, setFamilyEntries] = useState<BackgroundEntry[]>([]);
  const [personalEntries, setPersonalEntries] = useState<BackgroundEntry[]>([]);
  const [socialEntries, setSocialEntries] = useState<BackgroundEntry[]>([]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "PROVIDER") {
        if (patientDirectoryId) {
          const profile =
            await ehrService.getDirectoryPatientHealthProfile(patientDirectoryId);
          if (profile) {
            if (profile.id) setInternalProfileId(profile.id);
            setFamilyEntries(recordToEntries(profile.familyBackground));
            setPersonalEntries(recordToEntries(profile.personalBackground));
            setSocialEntries(recordToEntries(profile.socialBackground));
          }
        }
      } else {
        if (patientDirectoryId) {
          const profile =
            await ehrService.getDirectoryPatientHealthProfile(patientDirectoryId);
          if (profile) {
            if (profile.id) setInternalProfileId(profile.id);
            setFamilyEntries(recordToEntries(profile.familyBackground));
            setPersonalEntries(recordToEntries(profile.personalBackground));
            setSocialEntries(recordToEntries(profile.socialBackground));
          }
        } else if (consumerId) {
          const profile = await consumerProfileService.getProfile();
          if (profile) {
            setFamilyEntries(recordToEntries(profile.familyBackground));
            setPersonalEntries(recordToEntries(profile.personalBackground));
            setSocialEntries(recordToEntries(profile.socialBackground));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching health profile backgrounds:", error);
    } finally {
      setLoading(false);
    }
  }, [patientDirectoryId, consumerId, mode]);

  useEffect(() => {
    if (patientDirectoryId || (consumerId && mode !== "PROVIDER")) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [patientDirectoryId, consumerId, fetchProfile, mode]);

  const handleSave = async () => {
    const activeId = internalProfileId || healthProfileId;

    if (!activeId && (!consumerId || mode === "PROVIDER")) {
      toast.error(t("health_profile_missing"));
      return;
    }

    setSaving(true);
    try {
      const familyBackground = entriesToRecord(familyEntries);
      const personalBackground = entriesToRecord(personalEntries);
      const socialBackground = entriesToRecord(socialEntries);

      const payload: PatientBackgroundRequest = {
        healthProfileId: activeId || 0,
        familyBackground,
        personalBackground,
        socialBackground,
      };

      if (mode === "PROVIDER") {
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

      toast.success(t("background_updated_success") || "Antecedentes guardados con éxito.");
      await fetchProfile();
    } catch (error) {
      console.error("Error saving backgrounds:", error);
      toast.error(t("background_update_failed") || "No se pudieron guardar los antecedentes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetAllNegative = () => {
    setFamilyEntries([
      createEntry(
        "Heredofamiliares Generales",
        "Sin antecedentes patológicos hereditarios relevantes referidos"
      ),
    ]);
    setPersonalEntries([
      createEntry(
        "Personales Patológicos",
        "Interrogados y negados al momento de la consulta"
      ),
    ]);
    setSocialEntries([
      createEntry(
        "Estilo de vida & Hábitos",
        "Hábitos higiénico-dietéticos adecuados referidos"
      ),
    ]);
    toast.info(
      "Antecedentes completados como 'Interrogados y Negados'. Recuerda guardar los cambios."
    );
  };

  const renderMapEditor = (
    title: string,
    icon: React.ReactNode,
    entries: BackgroundEntry[],
    setEntries: React.Dispatch<React.SetStateAction<BackgroundEntry[]>>,
    placeholderKey: string,
    placeholderVal: string,
    accordionValue: string
  ) => {
    const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEntries((prev) => [...prev, createEntry("", "")]);
    };

    const handleKeyChange = (id: string, newKey: string) => {
      setEntries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, key: newKey } : item))
      );
    };

    const handleValChange = (id: string, newVal: string) => {
      setEntries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, value: newVal } : item))
      );
    };

    const handleRemove = (id: string) => {
      setEntries((prev) => prev.filter((item) => item.id !== id));
    };

    return (
      <AccordionItem
        value={accordionValue}
        className="rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs px-4 sm:px-5 overflow-hidden transition-colors"
      >
        <div className="flex justify-between items-center border-b border-transparent data-[state=open]:border-gray-100 dark:data-[state=open]:border-gray-800 transition-colors">
          <AccordionTrigger className="hover:no-underline py-4 sm:py-5 flex-1 pr-3 sm:pr-4 cursor-pointer">
            <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                {icon}
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white tracking-tight truncate">
                {title}
              </h4>
            </div>
          </AccordionTrigger>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-8 sm:h-9 px-2.5 sm:px-3.5 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer z-10 shrink-0"
          >
            <Plus
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2.5}
            />
            <span>{t("btn_add_entry")}</span>
          </Button>
        </div>

        <AccordionContent className="pb-5 pt-3 sm:pt-4">
          {entries.length === 0 ? (
            <div className="py-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-4">
              <p className="text-xs font-medium text-gray-400">
                {t("no_data_added")}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-2.5">
              {entries.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-2.5 sm:gap-2.5 p-3 sm:p-0 rounded-2xl bg-gray-50/70 dark:bg-[#050505] sm:bg-transparent border sm:border-0 border-gray-100 dark:border-gray-800/80 items-stretch sm:items-center transition-colors"
                >
                  {/* Campo Clave / Nombre del Antecedente */}
                  <div className="w-full sm:w-1/3 sm:min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1 sm:hidden">
                      {placeholderKey || "Concepto / Padecimiento"}
                    </span>
                    <Input
                      type="text"
                      value={item.key}
                      placeholder={placeholderKey}
                      onChange={(e) => handleKeyChange(item.id, e.target.value)}
                      className="h-10 rounded-xl bg-white dark:bg-[#0a0a0a] sm:bg-gray-50/50 sm:dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-xs w-full"
                    />
                  </div>

                  {/* Campo Valor / Descripción */}
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1 sm:hidden">
                      {placeholderVal || "Detalles / Parentesco"}
                    </span>
                    <Input
                      type="text"
                      value={item.value}
                      placeholder={placeholderVal}
                      onChange={(e) => handleValChange(item.id, e.target.value)}
                      className="h-10 rounded-xl bg-white dark:bg-[#0a0a0a] sm:bg-gray-50/50 sm:dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-xs w-full"
                    />
                  </div>

                  {/* Botón Eliminar */}
                  <div className="flex justify-end sm:block pt-0.5 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      aria-label="Eliminar entrada"
                      className="w-full sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center gap-1.5 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100 text-red-600 dark:text-red-400 transition-colors shrink-0 cursor-pointer border border-red-100 dark:border-red-900/30 text-xs font-bold sm:font-normal"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
                      <span className="sm:hidden text-xs">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xs">
        <QhSpinner size="md" />
        <span className="text-xs font-semibold text-gray-400 mt-3 animate-pulse">
          {t("loading_backgrounds")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── HEADER DEL PANEL ────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
            <FileText className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("title_clinical_backgrounds")}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 shrink-0">
                NOM-004
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {t("subtitle_clinical_backgrounds")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch xl:self-auto justify-end shrink-0 flex-wrap sm:flex-nowrap pt-3 xl:pt-0 border-t xl:border-t-0 border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSetAllNegative}
            disabled={saving}
            className="flex-1 sm:flex-none rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-9 px-3.5 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Completa todos los antecedentes como interrogados y negados"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("btn_all_negative")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 px-4 shadow-xs transition-all flex items-center justify-center gap-1.5 border-0 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <QhSpinner size="sm" />
            ) : (
              <Save className="w-3.5 h-3.5" strokeWidth={2} />
            )}
            <span>{saving ? t("btn_saving") : t("btn_save_backgrounds")}</span>
          </Button>
        </div>
      </div>

      {/* ── ACORDEÓN DE ANTECEDENTES NOM-004 ───────────────────────────── */}
      <Accordion
        type="multiple"
        defaultValue={["family", "personal", "social"]}
        className="space-y-3"
      >
        {renderMapEditor(
          t("category_family_background"),
          <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />,
          familyEntries,
          setFamilyEntries,
          t("placeholder_family_key"),
          t("placeholder_family_val"),
          "family"
        )}

        {renderMapEditor(
          t("category_personal_pathological"),
          <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />,
          personalEntries,
          setPersonalEntries,
          t("placeholder_personal_key"),
          t("placeholder_personal_val"),
          "personal"
        )}

        {renderMapEditor(
          t("category_social_lifestyle"),
          <HeartHandshake className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2} />,
          socialEntries,
          setSocialEntries,
          t("placeholder_social_key"),
          t("placeholder_social_val"),
          "social"
        )}
      </Accordion>
    </div>
  );
}