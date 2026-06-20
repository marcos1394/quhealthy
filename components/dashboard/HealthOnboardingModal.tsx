"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthProfilePayload, ActivityLevel } from '@/types/healthscore';
import { cn } from '@/lib/utils';

interface HealthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: HealthProfilePayload) => Promise<boolean>;
  isSubmitting: boolean;
}

export function HealthOnboardingModal({ isOpen, onClose, onSubmit, isSubmitting }: HealthOnboardingModalProps) {
  const t = useTranslations('PatientDashboard.Modal');
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<HealthProfilePayload>({
    weightKg: 70,
    heightCm: 170,
    activityLevel: 'MODERATE',
    isSmoker: false,
    waterIntakeLiters: 2,
    stressLevel: 5,
    sleepHoursAvg: 7,
  });

  if (!isOpen) return null;

  const updateForm = (field: keyof HealthProfilePayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg border border-black dark:border-white shadow-2xl flex flex-col"
      >
        {/* Header del Modal */}
        <div className="flex items-start justify-between p-8 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white uppercase mb-1">
              {t('title')}
            </h2>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-300 dark:border-gray-700 px-2 py-0.5 inline-block">
              {t('subtitle', { current: step, total: totalSteps })}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-black hover:border-black dark:hover:text-white dark:hover:border-white transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Barra de Progreso Arquitectónica */}
        <div className="w-full bg-gray-100 dark:bg-gray-900 h-px relative">
          <div
            className="absolute top-0 left-0 h-full bg-black dark:bg-white transition-all duration-500 ease-[0.16,1,0.3,1]"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Contenido Dinámico */}
        <div className="p-8 min-h-[340px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full space-y-8"
            >

              {/* PASO 1: Biometría */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                    {t('step1_title')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                        {t('weight_label')}
                      </label>
                      <input
                        type="number"
                        value={formData.weightKg}
                        onChange={(e) => updateForm('weightKg', parseFloat(e.target.value))}
                        className="w-full h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-none px-4 text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                        {t('height_label')}
                      </label>
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) => updateForm('heightCm', parseFloat(e.target.value))}
                        className="w-full h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-none px-4 text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Actividad */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                    {t('step2_title')}
                  </h3>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                      {t('activity_label')}
                    </label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) => updateForm('activityLevel', e.target.value as ActivityLevel)}
                      className="w-full h-12 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-black dark:text-white rounded-none px-4 text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors appearance-none"
                    >
                      <option value="SEDENTARY">{t('act_sedentary')}</option>
                      <option value="LIGHT">{t('act_light')}</option>
                      <option value="MODERATE">{t('act_moderate')}</option>
                      <option value="HIGH">{t('act_high')}</option>
                      <option value="ATHLETE">{t('act_athlete')}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PASO 3: Hábitos */}
              {step === 3 && (
                <div className="space-y-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                    {t('step3_title')}
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                      {t('smoker_label')}
                    </label>
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        onClick={() => updateForm('isSmoker', true)}
                        className={cn(
                          "flex-1 rounded-none h-12 text-[10px] font-bold uppercase tracking-widest border transition-colors",
                          formData.isSmoker 
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" 
                            : "bg-white text-gray-500 border-gray-300 hover:border-black dark:bg-[#0a0a0a] dark:border-gray-700 dark:hover:border-white"
                        )}
                      >
                        {t('yes')}
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => updateForm('isSmoker', false)}
                        className={cn(
                          "flex-1 rounded-none h-12 text-[10px] font-bold uppercase tracking-widest border transition-colors",
                          !formData.isSmoker 
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" 
                            : "bg-white text-gray-500 border-gray-300 hover:border-black dark:bg-[#0a0a0a] dark:border-gray-700 dark:hover:border-white"
                        )}
                      >
                        {t('no')}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                        {t('water_label')}
                      </label>
                      <span className="text-[10px] font-bold text-black dark:text-white border border-gray-200 dark:border-gray-800 px-2 py-0.5">
                        {formData.waterIntakeLiters} Litros
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="5" step="0.5"
                      value={formData.waterIntakeLiters}
                      onChange={(e) => updateForm('waterIntakeLiters', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:dark:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full transition-all"
                    />
                  </div>
                </div>
              )}

              {/* PASO 4: Mental */}
              {step === 4 && (
                <div className="space-y-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                    {t('step4_title')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                        {t('stress_label')}
                      </label>
                      <span className="text-[10px] font-bold text-black dark:text-white border border-gray-200 dark:border-gray-800 px-2 py-0.5">
                        Nivel {formData.stressLevel}
                      </span>
                    </div>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={formData.stressLevel}
                      onChange={(e) => updateForm('stressLevel', parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:dark:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full transition-all"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                        {t('sleep_label')}
                      </label>
                      <span className="text-[10px] font-bold text-black dark:text-white border border-gray-200 dark:border-gray-800 px-2 py-0.5">
                        {formData.sleepHoursAvg} Horas
                      </span>
                    </div>
                    <input
                      type="range" min="3" max="12" step="0.5"
                      value={formData.sleepHoursAvg}
                      onChange={(e) => updateForm('sleepHoursAvg', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:dark:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full transition-all"
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="rounded-none text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors px-0 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> {t('btn_back')}
          </Button>

          {step < totalSteps ? (
            <Button 
              onClick={handleNext} 
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
            >
              {t('btn_next')} <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('btn_submit')}
            </Button>
          )}
        </div>

      </motion.div>
    </div>
  );
}