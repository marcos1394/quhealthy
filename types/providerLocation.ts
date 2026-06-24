// Ubicación recomendada: src/types/providerLocation.ts (o donde manejes tus types)

export interface ProviderLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  isMain: boolean;
  isActive: boolean;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  isMain?: boolean;
}

export interface ToggleLocationResponse {
  success: boolean;
  isActiveNow: boolean;
  futureAppointmentsCount: number;
  message: string;
}