import React, { useState } from "react";
import { NutritionProfileRequest } from "@/types/nutrition";
import { Button } from "@/components/ui/button";

interface Props {
  initialData?: Partial<NutritionProfileRequest>;
  onSubmit: (data: NutritionProfileRequest) => void;
  isLoading: boolean;
}

export default function NutritionOnboarding({
  initialData,
  onSubmit,
  isLoading,
}: Props) {
  const [formData, setFormData] = useState<NutritionProfileRequest>({
    primaryGoal: "MAINTAIN_WEIGHT",
    weightKg: initialData?.weightKg || 70,
    heightCm: initialData?.heightCm || 170,
    age: initialData?.age || 30,
    gender: initialData?.gender || "MALE",
    activityLevel: initialData?.activityLevel || "MODERATE",
  });

  const handleChange = (
    field: keyof NutritionProfileRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-[#050505] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
          QuHealthy Food Vision
        </h2>
        <p className="text-gray-500 text-sm">
          Completa tu perfil para que nuestra IA calcule tus requerimientos
          calóricos exactos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
            ¿Cuál es tu objetivo?
          </label>
          <select
            value={formData.primaryGoal}
            onChange={(e) => handleChange("primaryGoal", e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all"
          >
            <option value="LOSE_WEIGHT">Perder Peso</option>
            <option value="MAINTAIN_WEIGHT">Mantener Peso</option>
            <option value="GAIN_MUSCLE">Ganar Masa Muscular</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
              Peso (kg)
            </label>
            <input
              type="number"
              value={formData.weightKg}
              onChange={(e) =>
                handleChange("weightKg", parseFloat(e.target.value))
              }
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              value={formData.heightCm}
              onChange={(e) =>
                handleChange("heightCm", parseFloat(e.target.value))
              }
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
              Edad
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange("age", parseInt(e.target.value))}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
              Sexo
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all"
            >
              <option value="MALE">Hombre</option>
              <option value="FEMALE">Mujer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
            Nivel de Actividad
          </label>
          <select
            value={formData.activityLevel}
            onChange={(e) => handleChange("activityLevel", e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all"
          >
            <option value="SEDENTARY">
              Sedentario (Poco o ningún ejercicio)
            </option>
            <option value="LIGHT">Ligero (Ejercicio 1-3 días/semana)</option>
            <option value="MODERATE">
              Moderado (Ejercicio 3-5 días/semana)
            </option>
            <option value="ACTIVE">Activo (Ejercicio 6-7 días/semana)</option>
            <option value="VERY_ACTIVE">
              Muy Activo (Ejercicio intenso todos los días)
            </option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-quhealthy-green hover:bg-emerald-700 text-white font-bold rounded-xl h-14 mt-4 transition-all shadow-sm hover:shadow"
        >
          {isLoading ? "Calculando..." : "Calcular Plan Inteligente"}
        </Button>
      </form>
    </div>
  );
}
