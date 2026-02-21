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
  // Agrega otros campos si los necesitas (ej: originalPrice para paquetes)
}

export interface StorefrontData {
  providerId: number;
  displayName: string;
  slug: string;
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  whatsappEnabled: boolean;
  instagramUrl: string;
  rating: number;
  reviewsCount: number;
  services: StorefrontItem[];
  packages: StorefrontItem[];
}