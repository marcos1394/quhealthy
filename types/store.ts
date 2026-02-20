
// types/store.ts

// Tipos de multimedia permitidos por tu backend
export type StoreMediaType = 'LOGO' | 'BANNER' | 'PREVIEW_VIDEO' | 'GALLERY';

export interface StoreProfile {
  providerId?: number;
  slug: string;
  displayName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  previewVideoUrl: string | null;
  promotionalImages: string[];
  
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