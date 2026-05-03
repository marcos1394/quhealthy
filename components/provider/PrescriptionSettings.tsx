'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { UpdatePrescriptionPreferencesRequest } from '@/types/onboarding';
import { onboardingService } from '@/services/onboarding.service';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Palette, Image as ImageIcon, PenTool, FileText, Loader2 } from 'lucide-react';

export const PrescriptionSettings = () => {
  const t = useTranslations('PrescriptionSettings');

  const [formData, setFormData] = useState<UpdatePrescriptionPreferencesRequest>({
    prescriptionColor: '#8B5CF6', // Default fallback color
    prescriptionLogoUrl: '',
    signatureUrl: '',
    prescriptionFooterNote: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await onboardingService.getOnboardingStatus();
        setFormData({
          prescriptionColor: data.prescriptionColor || '#8B5CF6',
          prescriptionLogoUrl: data.prescriptionLogoUrl || '',
          signatureUrl: data.signatureUrl || '',
          prescriptionFooterNote: data.prescriptionFooterNote || '',
        });
      } catch (error) {
        console.error('Error fetching preferences:', error);
        toast.error(t('error_loading', { fallback: 'No se pudieron cargar las preferencias.' }));
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [t]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, prescriptionColor: e.target.value }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const response = await onboardingService.uploadPrescriptionMedia(file, 'LOGO');
      const realUrl = response.url;
      setFormData((prev) => ({ ...prev, prescriptionLogoUrl: realUrl }));
      toast.success(t('success_logo_upload', { fallback: 'Logotipo subido exitosamente.' }));
    } catch (error) {
      console.error('Error subiendo logo:', error);
      toast.error(t('error_logo_upload', { fallback: 'Hubo un problema al subir el logotipo.' }));
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSignatureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSignature(true);
    try {
      const response = await onboardingService.uploadPrescriptionMedia(file, 'SIGNATURE');
      const realUrl = response.url;
      setFormData((prev) => ({ ...prev, signatureUrl: realUrl }));
      toast.success(t('success_signature_upload', { fallback: 'Firma digital subida y protegida exitosamente.' }));
    } catch (error) {
      console.error('Error subiendo firma:', error);
      toast.error(t('error_signature_upload', { fallback: 'Hubo un problema al subir la firma digital.' }));
    } finally {
      setIsUploadingSignature(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onboardingService.updatePrescriptionPreferences(formData);
      toast.success(t('success_save', { fallback: 'Preferencias de receta guardadas con éxito.' }));
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(t('error_save', { fallback: 'Hubo un problema al guardar las preferencias.' }));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>{t('loading_preferences', { fallback: 'Cargando preferencias...' })}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto">
      {/* CONTROLES (Izquierda) */}
      <div className="w-full lg:w-1/2 space-y-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
            {t('title', { fallback: 'Personaliza tu Receta' })}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
            {t('description', { fallback: 'Ajusta los colores y añade tu logotipo para dar una imagen más profesional a tus pacientes.' })}
          </p>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-medical-500" />
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              {t('primary_color', { fallback: 'Color Principal' })}
            </Label>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <input
              type="color"
              name="prescriptionColor"
              value={formData.prescriptionColor}
              onChange={handleColorChange}
              className="h-10 w-16 p-1 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent transition-colors"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono transition-colors">
              {formData.prescriptionColor}
            </span>
          </div>
        </div>

        {/* Upload Logo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              {t('logo_recommended', { fallback: 'Logotipo (Recomendado)' })}
            </Label>
          </div>
          <div className="ml-6">
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
              className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20 transition-all text-slate-500 dark:text-slate-400"
            />
            {isUploadingLogo && <p className="text-xs text-indigo-500 mt-2 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t('uploading_logo', { fallback: 'Subiendo logo...' })}</p>}
          </div>
        </div>

        {/* Upload Signature */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-500" />
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              {t('digital_signature_optional', { fallback: 'Firma Digital (Opcional)' })}
            </Label>
          </div>
          <div className="ml-6">
            <Input
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              disabled={isUploadingSignature}
              className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-500/10 dark:file:text-emerald-400 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-500/20 transition-all text-slate-500 dark:text-slate-400"
            />
            {isUploadingSignature && <p className="text-xs text-emerald-500 mt-2 flex items-center"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t('uploading_signature', { fallback: 'Subiendo firma...' })}</p>}
          </div>
        </div>

        {/* Footer Note */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <Label className="text-slate-700 dark:text-slate-300 font-medium">
              {t('footer_note', { fallback: 'Nota al pie de la receta' })}
            </Label>
          </div>
          <div className="ml-6">
            <Textarea
              name="prescriptionFooterNote"
              value={formData.prescriptionFooterNote}
              onChange={handleChange}
              placeholder={t('footer_note_placeholder', { fallback: 'Ej. Si presenta efectos adversos, suspenda el medicamento y comuníquese inmediatamente.' })}
              rows={3}
              className="resize-none dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: formData.prescriptionColor }}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? t('saving', { fallback: 'Guardando...' }) : t('save_preferences', { fallback: 'Guardar Preferencias' })}
          </Button>
        </div>
      </div>

      {/* LIVE PREVIEW (Derecha) */}
      <div className="w-full lg:w-1/2 flex justify-center items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Esqueleto A5 */}
        <div
          className="w-full max-w-[400px] aspect-[1/1.414] bg-white dark:bg-slate-900 shadow-xl rounded-sm p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
          style={{ borderTop: `8px solid ${formData.prescriptionColor}` }}
        >
          {/* Header de la Receta */}
          <div className="flex justify-between items-start border-b pb-4 border-slate-100 dark:border-slate-800 transition-colors">
            <div>
              <div
                className="w-24 h-6 rounded-sm mb-2 transition-colors duration-300"
                style={{ backgroundColor: formData.prescriptionColor, opacity: 0.2 }}
              ></div>
              <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm transition-colors"></div>
            </div>
            {/* Logo Preview */}
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-colors">
              {formData.prescriptionLogoUrl ? (
                <img src={formData.prescriptionLogoUrl} alt="Logo" className="w-full h-full object-contain bg-white" />
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 text-center px-2">Logo</span>
              )}
            </div>
          </div>

          {/* Body de la Receta (Simulación de texto) */}
          <div className="flex-1 py-6 space-y-4">
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-sm transition-colors"></div>
            <div className="w-11/12 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm transition-colors"></div>
            <div className="w-9/12 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm transition-colors"></div>
            <div className="mt-8 space-y-2">
              <div className="w-8/12 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm transition-colors"></div>
              <div className="w-10/12 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm transition-colors"></div>
            </div>
          </div>

          {/* Footer de la Receta */}
          <div className="pt-4 flex flex-col items-center">
            {/* Firma Preview */}
            <div className="w-32 h-16 mb-2 border-b border-slate-200 dark:border-slate-700 flex items-end justify-center overflow-hidden transition-colors">
              {formData.signatureUrl ? (
                <img src={formData.signatureUrl} alt="Firma" className="max-h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-300 dark:text-slate-600 pb-1 transition-colors">
                  {t('digital_signature_placeholder', { fallback: 'Firma digital' })}
                </span>
              )}
            </div>
            
            {/* Nota Preview */}
            {formData.prescriptionFooterNote ? (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center max-w-full truncate px-4 mt-2 transition-colors">
                {formData.prescriptionFooterNote}
              </p>
            ) : (
              <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-sm mt-2 transition-colors"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
