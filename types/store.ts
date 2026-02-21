
// types/store.ts

// Tipos de multimedia permitidos por tu backend
// Agregamos STAFF_AVATAR y ITEM_IMAGE a los tipos permitidos
export type StoreMediaType = 'LOGO' | 'BANNER' | 'PREVIEW_VIDEO' | 'GALLERY' | 'STAFF_AVATAR' | 'ITEM_IMAGE';

export interface StoreProfile {
  providerId?: number;
  slug: string;
  displayName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  previewVideoUrl: string | null;
  promotionalImages: string[];
  category?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  
  primaryColor: string;
  secondaryColor: string | null;
  bio: string | null;
  
  // Preferencias
  whatsappEnabled: boolean;
  showLocation: boolean;
  marketplaceVisible: boolean;

  // Redes y Contacto (Los nuevos campos)
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  
  // Idiomas y Políticas
  languages: string[];
  cancellationPolicy: string | null;
}

export interface UploadMediaResponse {
  message: string;
  url: string;
}