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
    tagId: number;
  }
  
  export interface PasswordRule {
    regex: RegExp;
    message: string;
    valid: boolean;
  }
  
  export type ServiceType = "health" | "beauty";