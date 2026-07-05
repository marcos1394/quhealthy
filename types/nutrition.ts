export interface NutritionAnalysisTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugars: number;
  sodium: number;
}

export interface DetectedFood {
  name: string;
  estimated_portion: string;
  preparation_method: string | null;
  is_confident: boolean;
  confidence_level: number;
}

export interface NutritionAnalysis {
  id: number;
  patientId: number;
  imageUrl: string;
  healthScore: number;
  totals: NutritionAnalysisTotals;
  detectedFoods: DetectedFood[];
  recommendations: string[];
  createdAt: string;
}
