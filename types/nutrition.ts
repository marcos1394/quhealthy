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
  presignedImageUrl?: string;
  healthScore: number;
  totals: NutritionAnalysisTotals;
  detectedFoods: DetectedFood[];
  recommendations: string[];
  createdAt: string;
}

export interface NutritionProfile {
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  primaryGoal?: string;
  bmr?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
}

export interface NutritionProfileRequest {
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  primaryGoal?: string;
}
