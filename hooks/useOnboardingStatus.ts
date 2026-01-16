/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- DEFINICIÓN DE TIPOS ---
// Estos tipos reflejan lo que tu Backend debería devolver.

export interface ProviderDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  parentCategoryId?: number; // 1 = Salud, 2 = Belleza (usado en ProfilePage)
}

export interface MarketplaceSettings {
  storeName?: string;
  storeSlug?: string;
  storeLogo?: string;
  storeBanner?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDescription?: string;
  welcomeVideo?: string;
}

export interface PlanDetails {
  planStatus: 'free' | 'premium' | 'business'; // Usado en Marketplace para feature gating
  renewalDate?: string;
}

export interface OnboardingStatus {
  profileCompleted: boolean;
  kycVerified: boolean;
  licenseVerified: boolean;
  marketplaceConfigured: boolean;
  marketplace?: MarketplaceSettings; // Configuración guardada
}

export interface OnboardingStatusResponse {
  isComplete: boolean; // Si todo el onboarding terminó
  currentStep: string; // 'profile', 'kyc', 'license', 'marketplace', 'dashboard'
  providerDetails: ProviderDetails;
  onboardingStatus: OnboardingStatus;
  planDetails?: PlanDetails;
}

// --- MOCK DATA (Para desarrollo inicial si no hay backend) ---
const mockData: OnboardingStatusResponse = {
  isComplete: false,
  currentStep: 'profile',
  providerDetails: {
    id: "123",
    name: "Dr. Marcos Sandoval",
    email: "marcos@example.com",
    parentCategoryId: 1
  },
  onboardingStatus: {
    profileCompleted: false,
    kycVerified: false,
    licenseVerified: false,
    marketplaceConfigured: false,
    marketplace: {
      primaryColor: '#8B5CF6'
    }
  },
  planDetails: {
    planStatus: 'premium'
  }
};

// --- EL HOOK ---
export const useOnboardingStatus = () => {
  const [data, setData] = useState<OnboardingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Intentamos llamar a la API real
      const response = await axios.get<OnboardingStatusResponse>('/api/auth/provider/status', {
        withCredentials: true,
      });
      setData(response.data);
    } catch (err: any) {
      console.warn("API de estado no disponible, usando Mock Data para desarrollo.");
      
      // FALLBACK: Si falla la API (404/500), usamos el mock para que puedas trabajar en el frontend
      // Simular un pequeño delay de red
      setTimeout(() => {
        setData(mockData); 
      }, 500);

      // Si quieres mostrar el error real, descomenta esto:
      // const errorMessage = err.response?.data?.message || "No se pudieron cargar los datos.";
      // setError(errorMessage);
    } finally {
      // Aseguramos que el loading termine incluso si usamos el mock
      setTimeout(() => setIsLoading(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};