"use client"

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ehrService } from '@/services/ehr.service';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { PatientBackgroundRequest } from '@/types/ehr';

interface Props {
  patientDirectoryId?: number | null;
  consumerId?: number | null;
  healthProfileId?: number | null;
}

export function PatientBackgroundPanel({ patientDirectoryId, consumerId, healthProfileId }: Props) {
  const t = useTranslations('EHR');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [internalProfileId, setInternalProfileId] = useState<number | null>(healthProfileId || null);
  
  // States for dynamic backgrounds
  const [familyBackground, setFamilyBackground] = useState<Record<string, string>>({});
  const [personalBackground, setPersonalBackground] = useState<Record<string, string>>({});
  const [socialBackground, setSocialBackground] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (patientDirectoryId) {
          const profile = await ehrService.getDirectoryPatientHealthProfile(patientDirectoryId);
          if (profile) {
            if (profile.id) setInternalProfileId(profile.id);
            setFamilyBackground(profile.familyBackground || {});
            setPersonalBackground(profile.personalBackground || {});
            setSocialBackground(profile.socialBackground || {});
          }
        } else if (consumerId) {
          // Si tuviéramos un endpoint para consumer profile lo llamaríamos aquí
        }
      } catch (error) {
        console.error("Error fetching health profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (patientDirectoryId || consumerId) {
       fetchProfile();
    } else {
       setLoading(false);
    }
  }, [patientDirectoryId, consumerId]);

  const handleSave = async () => {
    const activeId = internalProfileId || healthProfileId;
    if (!activeId && !consumerId) {
      toast.error(t('health_profile_missing') || "Error: Perfil de salud no encontrado.");
      return;
    }

    setSaving(true);
    try {
      const payload: PatientBackgroundRequest = {
        healthProfileId: activeId || 0, // Fallback, the backend will ignore if not found and use consumerId
        familyBackground,
        personalBackground,
        socialBackground
      };

      if (patientDirectoryId) {
        await ehrService.updateProviderPatientBackground(payload);
      } else if (consumerId) {
        // Backend ignores healthProfileId if null for updatePatientBackground, but TS might complain if we don't pass anything. We can pass it without healthProfileId.
        const consumerPayload = { ...payload, healthProfileId: activeId || undefined } as unknown as PatientBackgroundRequest;
        await ehrService.updatePatientBackground(consumerPayload);
      }

      toast.success(t('background_updated_success') || "Antecedentes actualizados correctamente.");
    } catch (error) {
      console.error("Error saving backgrounds:", error);
      toast.error(t('background_update_failed') || "Error al actualizar antecedentes.");
    } finally {
      setSaving(false);
    }
  };

  const renderMapEditor = (
    title: string,
    data: Record<string, string>,
    setData: React.Dispatch<React.SetStateAction<Record<string, string>>>
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

    return (
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h4>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> {t('add')}
          </Button>
        </div>
        
        {Object.keys(data).length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-2">{t('no_data_added') || "Sin registros"}</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(data).map(([key, value], index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="w-1/3">
                  <input
                    type="text"
                    value={key}
                    placeholder={t('condition_or_relation') || "Condición / Familiar"}
                    onChange={(e) => handleKeyChange(key, e.target.value)}
                    className="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={value}
                    placeholder={t('description_or_details') || "Detalles"}
                    onChange={(e) => handleValChange(key, e.target.value)}
                    className="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button 
                  onClick={() => handleRemove(key)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                >
                  <X className="w-4 h-4" />
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
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white">
          {t('medical_history_base') || "Expediente Base (NOM-004)"}
        </h3>
        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {t('save_background') || "Guardar"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          {t('nom004_background_notice') || "Estos datos pertenecen al expediente único e interoperable del paciente y deben completarse para poder firmar una consulta de Primera Vez."}
        </div>
        {renderMapEditor(t('family_background') || "Heredo-familiares", familyBackground, setFamilyBackground)}
        {renderMapEditor(t('personal_background') || "Personales Patológicos", personalBackground, setPersonalBackground)}
        {renderMapEditor(t('social_background') || "No Patológicos", socialBackground, setSocialBackground)}
      </div>
    </div>
  );
}
