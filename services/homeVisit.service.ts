// src/services/homeVisit.service.ts
import axiosInstance from '@/lib/axios';

export interface HomeVisitSettings {
  providerId?: number;
  isEnabled: boolean;
  coverageRadiusKm: number;
  basePrice: number;
  pricePerKm: number;
  estimatedDispatchMinutes: number;
  autoAcceptOnDemand: boolean;
  onDemandStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentLatitude?: number;
  currentLongitude?: number;
  updatedAt?: string;
}

export interface NearbyHomeVisitProvider {
  providerId: number;
  displayName: string;
  category: string;
  logoUrl?: string;
  quScore: number;
  basePrice: number;
  pricePerKm: number;
  estimatedDispatchMinutes: number;
  distanceKm: number;
  totalEstimatedPrice: number;
  onDemandStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}

export interface HomeVisitRequestPayload {
  serviceId?: number;
  serviceName?: string;
  patientAddress: string;
  patientLatitude: number;
  patientLongitude: number;
  patientAddressReferences?: string;
  symptoms?: string;
  preferredProviderId?: number;
  maxBudget?: number;
  stripePaymentMethodId?: string;
}

export interface HomeVisitDispatchResponse {
  appointmentId: number;
  dispatchStatus: 'NONE' | 'SEARCHING_PROVIDER' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  appointmentStatus: string;
  securityPin: string;
  providerId: number;
  providerName: string;
  providerSpecialty?: string;
  providerPhone?: string;
  providerPhotoUrl?: string;
  patientAddress: string;
  patientLatitude: number;
  patientLongitude: number;
  patientAddressReferences?: string;
  distanceKm: number;
  totalPrice: number;
  travelFee: number;
  estimatedArrivalTime: string;
  createdAt: string;
}

export const homeVisitService = {
  /**
   * 🏠 Obtener configuración del médico actual
   */
  getMySettings: async (): Promise<HomeVisitSettings> => {
    const res = await axiosInstance.get<HomeVisitSettings>('/api/catalog/home-visit/settings');
    return res.data;
  },

  /**
   * 💾 Guardar configuración de tarifas y radio de cobertura
   */
  saveMySettings: async (settings: HomeVisitSettings): Promise<HomeVisitSettings> => {
    const res = await axiosInstance.put<HomeVisitSettings>('/api/catalog/home-visit/settings', settings);
    return res.data;
  },

  /**
   * ⚡ Toggle en vivo: "Disponible / Desconectado" (Modo DiDi/Uber)
   */
  updateLiveStatus: async (
    status: 'AVAILABLE' | 'BUSY' | 'OFFLINE',
    coords?: { lat: number; lng: number }
  ): Promise<HomeVisitSettings> => {
    const res = await axiosInstance.patch<HomeVisitSettings>('/api/catalog/home-visit/status', {
      status,
      latitude: coords?.lat,
      longitude: coords?.lng,
    });
    return res.data;
  },

  /**
   * 📍 Buscar médicos a domicilio disponibles cerca del paciente
   */
  getNearbyProviders: async (
    lat: number,
    lng: number,
    onlyAvailable = true,
    limit = 20
  ): Promise<NearbyHomeVisitProvider[]> => {
    const res = await axiosInstance.get<NearbyHomeVisitProvider[]>('/api/catalog/home-visit/nearby', {
      params: { lat, lng, onlyAvailable, limit },
    });
    return res.data;
  },

  /**
   * 🚗 Paciente solicita médico a domicilio (On-Demand o Directo)
   */
  requestHomeVisit: async (payload: HomeVisitRequestPayload): Promise<HomeVisitDispatchResponse> => {
    const res = await axiosInstance.post<HomeVisitDispatchResponse>('/api/appointments/home-visit/request', payload);
    return res.data;
  },

  /**
   * 🩺 Médico acepta la solicitud on-demand
   */
  acceptHomeVisit: async (appointmentId: number): Promise<HomeVisitDispatchResponse> => {
    const res = await axiosInstance.post<HomeVisitDispatchResponse>(`/api/appointments/home-visit/${appointmentId}/accept`);
    return res.data;
  },

  /**
   * 🏎️ Médico marca que va en camino (EN_ROUTE) con tiempo estimado
   */
  markEnRoute: async (appointmentId: number, etaMinutes = 20): Promise<HomeVisitDispatchResponse> => {
    const res = await axiosInstance.post<HomeVisitDispatchResponse>(
      `/api/appointments/home-visit/${appointmentId}/en-route`,
      null,
      { params: { etaMinutes } }
    );
    return res.data;
  },

  /**
   * 🔐 Validar PIN de 4 dígitos al llegar a la puerta del paciente
   */
  verifyArrival: async (appointmentId: number, securityPin: string): Promise<HomeVisitDispatchResponse> => {
    const res = await axiosInstance.post<HomeVisitDispatchResponse>(
      `/api/appointments/home-visit/${appointmentId}/verify-arrival`,
      { securityPin }
    );
    return res.data;
  },

  /**
   * 📊 Consultar estado en tiempo real del despacho
   */
  getDispatchStatus: async (appointmentId: number): Promise<HomeVisitDispatchResponse> => {
    const res = await axiosInstance.get<HomeVisitDispatchResponse>(`/api/appointments/home-visit/${appointmentId}/status`);
    return res.data;
  },
};
