"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Activity, HeartPulse, BrainCircuit, Apple, Target, UserPlus, ShieldAlert, Watch, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { useConsumerOnboarding } from "@/hooks/useConsumerOnboarding";

const STEPS = [
  { id: "consent", title: "Privacidad y Consentimiento", icon: ShieldAlert },
  { id: "identity", title: "Datos Demográficos", icon: UserPlus },
  { id: "vitals", title: "Antropometría y Vitales", icon: Activity },
  { id: "lifestyle", title: "Estilo de Vida", icon: Apple },
  { id: "clinical", title: "Historial Clínico", icon: HeartPulse },
  { id: "goals", title: "Tus Objetivos", icon: Target },
  { id: "wearables", title: "Dispositivos Médicos", icon: Watch },
  { id: "dependents", title: "Familia y Dependientes", icon: UserPlus },
];

export default function ConsumerOnboardingWizard() {
  const router = useRouter();
  const {
    currentStep,
    data,
    loading,
    updateData,
    handleNext,
    handleSkip
  } = useConsumerOnboarding(STEPS.length);

  // ---- Step Renders ----

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
              <BrainCircuit className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Motor de Recomendaciones con IA</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Para brindarte recomendaciones hiper-personalizadas (rutinas, prevención, dietas), QuHealthy utiliza inteligencia artificial. 
                Tus datos de salud serán analizados mediante algoritmos de forma segura y anonimizada bajo la normativa LFPDPPP.
              </p>
            </div>
            <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300"
                checked={data.algorithmicConsentAccepted}
                onChange={(e) => updateData({ algorithmicConsentAccepted: e.target.checked })}
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Acepto el uso de mis datos para análisis algorítmico</p>
                <p className="text-sm text-slate-500">He leído y acepto el Aviso de Privacidad y consiento explícitamente el tratamiento de mis datos de salud y biométricos.</p>
              </div>
            </label>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sexo Biológico (Relevante para análisis clínico)</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                value={data.biologicalSex}
                onChange={(e) => updateData({ biologicalSex: e.target.value })}
              >
                <option value="">Selecciona...</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Sangre</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                value={data.bloodType}
                onChange={(e) => updateData({ bloodType: e.target.value })}
              >
                <option value="">Desconozco</option>
                <option value="O+">O Positivo (O+)</option>
                <option value="O-">O Negativo (O-)</option>
                <option value="A+">A Positivo (A+)</option>
                <option value="A-">A Negativo (A-)</option>
                <option value="B+">B Positivo (B+)</option>
                <option value="B-">B Negativo (B-)</option>
                <option value="AB+">AB Positivo (AB+)</option>
                <option value="AB-">AB Negativo (AB-)</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">Medidas Corporales</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Peso Actual (kg)</label>
              <input 
                type="number" 
                placeholder="Ej. 75"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                value={data.weightKg}
                onChange={(e) => updateData({ weightKg: e.target.value ? Number(e.target.value) : "" })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estatura (cm)</label>
              <input 
                type="number" 
                placeholder="Ej. 175"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                value={data.heightCm}
                onChange={(e) => updateData({ heightCm: e.target.value ? Number(e.target.value) : "" })}
              />
            </div>
            {data.weightKg && data.heightCm && (
              <div className="col-span-1 md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl border border-blue-200 dark:border-blue-800 flex justify-between items-center">
                <span className="font-medium">Tu Índice de Masa Corporal (IMC):</span>
                <span className="text-xl font-bold">
                  {(Number(data.weightKg) / Math.pow(Number(data.heightCm) / 100, 2)).toFixed(1)}
                </span>
              </div>
            )}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Signos Vitales Históricos (Promedio)</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ritmo Cardíaco Reposo (bpm)</label>
              <input 
                type="number" 
                placeholder="Ej. 65"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                value={data.restingHeartRate}
                onChange={(e) => updateData({ restingHeartRate: e.target.value ? Number(e.target.value) : "" })}
              />
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Presión Sistólica (Alta)</label>
                <input 
                  type="number" 
                  placeholder="Ej. 120"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  value={data.averageBloodPressureSystolic}
                  onChange={(e) => updateData({ averageBloodPressureSystolic: e.target.value ? Number(e.target.value) : "" })}
                />
              </div>
              <span className="text-xl font-bold pb-2 text-slate-400">/</span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Presión Diastólica (Baja)</label>
                <input 
                  type="number" 
                  placeholder="Ej. 80"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  value={data.averageBloodPressureDiastolic}
                  onChange={(e) => updateData({ averageBloodPressureDiastolic: e.target.value ? Number(e.target.value) : "" })}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dieta Predominante</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                value={data.dietaryPreference}
                onChange={(e) => updateData({ dietaryPreference: e.target.value })}
              >
                <option value="">Sin dieta específica</option>
                <option value="MEDITERRANEAN">Mediterránea</option>
                <option value="VEGAN">Vegana</option>
                <option value="VEGETARIAN">Vegetariana</option>
                <option value="KETO">Keto / Cetogénica</option>
                <option value="PALEO">Paleo</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Días de ejercicio a la semana</label>
                <input 
                  type="number" 
                  placeholder="Ej. 3"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  value={data.exerciseDaysPerWeek}
                  onChange={(e) => updateData({ exerciseDaysPerWeek: e.target.value ? Number(e.target.value) : "" })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Minutos por día</label>
                <input 
                  type="number" 
                  placeholder="Ej. 45"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  value={data.exerciseMinutesPerDay}
                  onChange={(e) => updateData({ exerciseMinutesPerDay: e.target.value ? Number(e.target.value) : "" })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Horas promedio de sueño al día</label>
                <input 
                  type="number" 
                  placeholder="Ej. 7.5"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  value={data.sleepHoursAvg}
                  onChange={(e) => updateData({ sleepHoursAvg: e.target.value ? Number(e.target.value) : "" })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nivel de estrés general (1-10)</label>
                <input 
                  type="range" 
                  min="1" max="10"
                  className="w-full h-2 mt-4 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                  value={data.stressLevel}
                  onChange={(e) => updateData({ stressLevel: Number(e.target.value) })}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Muy Bajo (1)</span>
                  <span className="font-bold text-blue-600">{data.stressLevel}</span>
                  <span>Extremo (10)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <input 
                type="checkbox" 
                id="smoker"
                className="w-5 h-5 text-blue-600 rounded border-gray-300"
                checked={data.isSmoker}
                onChange={(e) => updateData({ isSmoker: e.target.checked })}
              />
              <label htmlFor="smoker" className="font-medium text-slate-700 dark:text-slate-300 w-full cursor-pointer">Soy fumador(a) regular</label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
             <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 rounded-xl border border-orange-200 dark:border-orange-800 text-sm">
                Esta sección utilizará próximamente el estándar CIE-10 para mayor precisión médica. Por ahora, puedes ingresar texto libre.
             </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enfermedades Crónicas / Diagnósticos</label>
              <textarea 
                placeholder="Ej. Diabetes Tipo 2, Hipertensión..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[100px]"
                onChange={(e) => updateData({ medicalConditions: [{ name: e.target.value }] })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alergias Conocidas</label>
              <textarea 
                placeholder="Ej. Penicilina, Nueces..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-h-[80px]"
                onChange={(e) => updateData({ allergies: [{ name: e.target.value }] })}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">¿Cuáles son tus objetivos principales?</h3>
            {['Bajar de Peso', 'Mejorar longevidad', 'Manejar estrés y ansiedad', 'Mejorar calidad de sueño', 'Ganar masa muscular'].map(goal => (
              <label key={goal} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-blue-600 rounded border-gray-300"
                  checked={data.healthGoals.includes(goal)}
                  onChange={(e) => {
                    const newGoals = e.target.checked 
                      ? [...data.healthGoals, goal]
                      : data.healthGoals.filter(g => g !== goal);
                    updateData({ healthGoals: newGoals });
                  }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">{goal}</span>
              </label>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-center py-8">
            <Watch className="w-20 h-20 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Conecta tus Dispositivos</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Sincroniza tu reloj inteligente o pulsera de actividad (Apple Health, Google Fit) para alimentar el motor de IA con datos en tiempo real.
            </p>
            <div className="flex flex-col gap-3 mt-8 max-w-xs mx-auto">
              <button className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition">
                Conectar Apple Health
              </button>
              <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Conectar Google Fit
              </button>
            </div>
          </div>
        );
      case 7:
        return (
           <div className="space-y-6 text-center py-8">
            <UserPlus className="w-20 h-20 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Familiares a cargo</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              ¿Gestionarás la salud de tus hijos o adultos mayores? Puedes agregar sus perfiles ahora o hacerlo después en tus ajustes.
            </p>
            <div className="mt-8">
              <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                Agregar Dependiente
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0 && !data.algorithmicConsentAccepted) return true;
    if (currentStep === 1 && !data.biologicalSex) return true;
    return false;
  };

  const showSkipButton = currentStep >= 6;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header / Progress */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">QuHealthy</h1>
          <div className="text-sm font-medium text-slate-500">
            Paso {currentStep + 1} de {STEPS.length}
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/20 dark:shadow-none border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                {React.createElement(STEPS[currentStep].icon, { className: "w-6 h-6" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {STEPS[currentStep].title}
                </h2>
              </div>
            </div>

            {renderStepContent()}

            <div className="mt-10 flex items-center gap-4">
              {showSkipButton && (
                <button 
                  onClick={handleSkip}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Saltar por ahora
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={isNextDisabled() || loading}
                className="flex-1 py-4 px-6 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? "Guardando..." : currentStep === STEPS.length - 1 ? "Ir al Dashboard" : "Continuar"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
