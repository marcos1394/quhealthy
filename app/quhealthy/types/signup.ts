// src/types/signup.ts
export interface FormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  lat: number;
  lng: number;
  acceptTerms: boolean;
  parentCategoryId: number;
  categoryProviderId: number;
  subCategoryId: number; // <-- Campo añadido
  tagIds: number[]; // <-- Campo añadido para guardar los tags
}

export interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

export type ServiceType = "health" | "beauty";