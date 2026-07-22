import React from "react";
import { NutritionProfile, NutritionAnalysis } from "@/types/nutrition";

interface Props {
  profile: NutritionProfile;
  history: NutritionAnalysis[];
}

export default function NutritionProgress({ profile, history }: Props) {
  // Helper para manejar fechas sin timezone explícito desde el backend
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const str = String(dateStr);
    const hasTimezone = /(Z|[+-]\d{2}(:\d{2})?)$/.test(str);
    return new Date(hasTimezone ? str : `${str}Z`);
  };

  // Calculate today's totals
  const today = new Date().toDateString();
  const todaysHistory = history.filter(
    (item) => parseDate(item.createdAt).toDateString() === today,
  );

  const consumed = todaysHistory.reduce(
    (acc, curr) => ({
      calories: acc.calories + (curr.totals.calories || 0),
      protein: acc.protein + (curr.totals.protein || 0),
      carbs: acc.carbs + (curr.totals.carbs || 0),
      fats: acc.fats + (curr.totals.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  const target = {
    calories: profile.targetCalories || 2000,
    protein: profile.targetProtein || 120,
    carbs: profile.targetCarbs || 250,
    fats: profile.targetFats || 70,
  };

  const remaining = {
    calories: Math.max(0, target.calories - consumed.calories),
    protein: Math.max(0, target.protein - consumed.protein),
    carbs: Math.max(0, target.carbs - consumed.carbs),
    fats: Math.max(0, target.fats - consumed.fats),
  };

  const getPercentage = (c: number, t: number) =>
    Math.min(100, Math.round((c / t) * 100)) || 0;

  const ProgressBar = ({
    label,
    icon,
    consumed,
    target,
    unit,
    colorClass,
  }: any) => {
    const pct = getPercentage(consumed, target);
    return (
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {label}
            </span>
          </div>
          <div className="text-right">
            <span className="font-black text-black dark:text-white text-lg">
              {consumed}
            </span>
            <span className="text-gray-500 text-sm">
              {" "}
              / {target} {unit}
            </span>
          </div>
        </div>
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-xs font-bold text-gray-400">{pct}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Magic Text Summary */}
      <div className="bg-quhealthy-green/10 dark:bg-quhealthy-green/20 rounded-2xl p-6 border border-quhealthy-green/20">
        <h3 className="font-bold text-quhealthy-green mb-2 text-lg">
          Resumen del Día
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {remaining.calories > 0
            ? `Vas muy bien. Te quedan ${remaining.calories} kcal, ${remaining.protein}g de proteína, ${remaining.carbs}g de carbohidratos y ${remaining.fats}g de grasa.`
            : `Has alcanzado o superado tu límite de calorías diarias. ¡Ten cuidado con las porciones extra!`}
        </p>
      </div>

      <div className="bg-white dark:bg-[#050505] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-xl mb-8 text-black dark:text-white">
          Progreso de Hoy
        </h3>

        <ProgressBar
          label="Calorías"
          icon="🔥"
          consumed={consumed.calories}
          target={target.calories}
          unit="kcal"
          colorClass="bg-orange-500"
        />
        <ProgressBar
          label="Proteína"
          icon="🥩"
          consumed={consumed.protein}
          target={target.protein}
          unit="g"
          colorClass="bg-red-500"
        />
        <ProgressBar
          label="Carbohidratos"
          icon="🥖"
          consumed={consumed.carbs}
          target={target.carbs}
          unit="g"
          colorClass="bg-yellow-500"
        />
        <ProgressBar
          label="Grasas"
          icon="🥑"
          consumed={consumed.fats}
          target={target.fats}
          unit="g"
          colorClass="bg-green-500"
        />
      </div>
    </div>
  );
}
