
// types/store.ts

// Tipos de multimedia permitidos por tu backend
export type StoreMediaType = 'LOGO' | 'BANNER' | 'PREVIEW_VIDEO' | 'GALLERY' | 'STAFF_AVATAR' | 'ITEM_IMAGE' | 'BEFORE_AFTER' | 'CERTIFICATION' | 'EQUIPMENT' | 'OFFICE';

export type GalleryType = 'OFFICE' | 'EQUIPMENT' | 'CERTIFICATION' | 'BEFORE_AFTER' | 'SERVICE_WORK' | 'PROMOTIONAL';

export interface GalleryImage {
  id: number;
  providerId: number;
  catalogItemId?: number;
  galleryType: GalleryType;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  isVideo?: boolean;
  createdAt: string;
}

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