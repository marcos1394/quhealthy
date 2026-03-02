"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthProfilePayload, ActivityLevel } from '@/types/healthscore';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {t('subtitle', { current: step, total: totalSteps })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div 
            className="bg-medical-500 h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Contenido Dinámico con Framer Motion */}
        <div className="p-6 flex-1 min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 space-y-6"
            >
              
              {/* PASO 1: Biometría */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('step1_title')}</h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('weight_label')}</label>
                    <input 
                      type="number" 
                      value={formData.weightKg} 
                      onChange={(e) => updateForm('weightKg', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-medical-500 focus:outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('height_label')}</label>
                    <input 
                      type="number" 
                      value={formData.heightCm} 
                      onChange={(e) => updateForm('heightCm', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-medical-500 focus:outline-none transition-shadow"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: Actividad */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('step2_title')}</h3>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('activity_label')}</label>
                  <select 
                    value={formData.activityLevel} 
                    onChange={(e) => updateForm('activityLevel', e.target.value as ActivityLevel)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-medical-500 focus:outline-none appearance-none"
                  >
                    <option value="SEDENTARY">{t('act_sedentary')}</option>
                    <option value="LIGHT">{t('act_light')}</option>
                    <option value="MODERATE">{t('act_moderate')}</option>
                    <option value="HIGH">{t('act_high')}</option>
                    <option value="ATHLETE">{t('act_athlete')}</option>
                  </select>
                </div>
              )}

              {/* PASO 3: Hábitos */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('step3_title')}</h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('smoker_label')}</label>
                    <div className="flex gap-4">
                      <Button type="button" variant={formData.isSmoker ? 'default' : 'outline'} className={formData.isSmoker ? 'bg-medical-500' : ''} onClick={() => updateForm('isSmoker', true)}>{t('yes')}</Button>
                      <Button type="button" variant={!formData.isSmoker ? 'default' : 'outline'} className={!formData.isSmoker ? 'bg-medical-500' : ''} onClick={() => updateForm('isSmoker', false)}>{t('no')}</Button>
                    </div>
                  </div>
                  <div className="pt-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('water_label')} ({formData.waterIntakeLiters}L)</label>
                    <input 
                      type="range" min="0" max="5" step="0.5" 
                      value={formData.waterIntakeLiters} 
                      onChange={(e) => updateForm('waterIntakeLiters', parseFloat(e.target.value))}
                      className="w-full accent-medical-500"
                    />
                  </div>
                </div>
              )}

              {/* PASO 4: Mental */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('step4_title')}</h3>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('stress_label')}: {formData.stressLevel}</label>
                    <input 
                      type="range" min="1" max="10" step="1" 
                      value={formData.stressLevel} 
                      onChange={(e) => updateForm('stressLevel', parseInt(e.target.value))}
                      className="w-full accent-medical-500"
                    />
                  </div>
                  <div className="pt-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('sleep_label')} ({formData.sleepHoursAvg}h)</label>
                    <input 
                      type="range" min="3" max="12" step="0.5" 
                      value={formData.sleepHoursAvg} 
                      onChange={(e) => updateForm('sleepHoursAvg', parseFloat(e.target.value))}
                      className="w-full accent-medical-500"
                    />
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1 || isSubmitting}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('btn_back')}
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 font-bold rounded-xl px-6">
              {t('btn_next')} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-medical-500 hover:bg-medical-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-medical-500/30"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('btn_submit')}
            </Button>
          )}
        </div>

      </motion.div>
    </div>
  );
}