// types/discover.ts

export interface DiscoverProvider {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  slug: string;
  imageUrl: string; // El banner (Fallback si no hay video)
  logoUrl: string;
  previewVideoUrl: string | null; // 🚀 El video para el Hover
  color: string;
  isPremium: boolean;
  isPromoted?: boolean;
  distanceKm?: number; // Lo calcularemos dinámicamente más adelante
  city?: string;
  basePrice?: number; // CAT-P05
  compareAtPrice?: number; // CAT-P05
  discountPercentage?: number; // CAT-P05
}

export interface DiscoverProviderWrapperResponse {
  sponsored: DiscoverProvider[];
  organic: DiscoverProvider[];
}

export interface CatalogSearchRequestParams {
  category: string;
  lat: number;
  lng: number;
  date?: string; // Formato ISO yyyy-MM-dd
  radiusKm?: number;
  minScore?: number;
  maxPrice?: number;
  hasDiscount?: boolean; // CAT-P05
  page?: number;
  size?: number;
}

export interface ProviderSearchResponseDto {
  providerId: number;
  name: string;
  category: string;
  quScore: number;
  distanceKm: number;
  basePrice: number;
  compareAtPrice?: number; // CAT-P05
  discountPercentage?: number; // CAT-P05
  slotsToday: number;
  slotsTomorrow: number;
  nextAvailableSlot: string;
  isPromoted?: boolean;
}

export interface ProviderSearchWrapperResponse {
  sponsored: ProviderSearchResponseDto[];
  organic: ProviderSearchResponseDto[];
}