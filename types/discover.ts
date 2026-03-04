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
  distanceKm?: number; // Lo calcularemos dinámicamente más adelante
  city?: string;
}