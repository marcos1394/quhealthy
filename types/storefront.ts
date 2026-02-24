// types/storefront.ts

export interface StorefrontItem {
  id: number;
  type: 'SERVICE' | 'PACKAGE';
  category: string;
  name: string;
  description: string;
  price: number;
  durationMinutes?: number;
  imageUrl?: string;
  
  // 🚀 NUEVOS CAMPOS AÑADIDOS DESDE EL BACKEND
  compareAtPrice?: number | null;
  modality?: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
  cancellationPolicy?: string;
  followUpPeriodDays?: number;
  searchTags?: string[];
}

export interface StorefrontData {
  providerId: number;
  displayName: string;
  slug: string;
  bio: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  previewVideoUrl?: string | null; // Agregado para el hover en la UI
  primaryColor: string;
  whatsappEnabled: boolean;
  instagramUrl: string | null;
  
  // 🚀 NUEVOS CAMPOS DE UBICACIÓN Y TIENDA
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  languages?: string[];
  cancellationPolicy?: string;
  tags?: string[]; // 🚀 AQUÍ ESTÁN NUESTROS TAGS DEL NEGOCIO

  rating: number;
  reviewsCount: number;
  services: StorefrontItem[];
  packages: StorefrontItem[];
}