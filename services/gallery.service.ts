import axiosInstance from '@/lib/axios';
import { GalleryImage, GalleryType } from '@/types/store';
import { storeService } from './store.service';

const BASE_URL = '/api/catalog/gallery';

export interface GalleryImageRequest {
  galleryType: GalleryType;
  catalogItemId?: number;
  imageUrl: string;
  caption?: string;
  displayOrder?: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  isVideo?: boolean;
}

export const galleryService = {
  // --- Private Endpoints ---
  
  getStoreGallery: async (type?: GalleryType): Promise<GalleryImage[]> => {
    const params = type ? { type } : {};
    const response = await axiosInstance.get<GalleryImage[]>(`${BASE_URL}/store`, { params });
    return response.data;
  },

  getItemGallery: async (itemId: number): Promise<GalleryImage[]> => {
    const response = await axiosInstance.get<GalleryImage[]>(`${BASE_URL}/item/${itemId}`);
    return response.data;
  },

  addImage: async (request: GalleryImageRequest): Promise<GalleryImage> => {
    const response = await axiosInstance.post<GalleryImage>(BASE_URL, request);
    return response.data;
  },

  updateImage: async (imageId: number, updates: Partial<GalleryImageRequest>): Promise<GalleryImage> => {
    const response = await axiosInstance.put<GalleryImage>(`${BASE_URL}/${imageId}`, updates);
    return response.data;
  },

  reorderGallery: async (imageIds: number[]): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/reorder`, { imageIds });
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${imageId}`);
  },

  migratePromotionalImages: async (): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/migrate-promotional`);
  },

  // Helper method that combines GCS upload + Gallery registration
  uploadAndAddImage: async (
    file: File, 
    galleryType: GalleryType, 
    catalogItemId?: number,
    beforeFile?: File,
    afterFile?: File
  ): Promise<GalleryImage> => {
    
    // Si es Before/After, se suben dos imágenes
    if (galleryType === 'BEFORE_AFTER' && beforeFile && afterFile) {
      const beforeRes = await storeService.uploadMedia(beforeFile, 'BEFORE_AFTER');
      const afterRes = await storeService.uploadMedia(afterFile, 'BEFORE_AFTER');
      
      return galleryService.addImage({
        galleryType,
        catalogItemId,
        imageUrl: afterRes.url, // Usamos la de 'después' como principal si se requiere
        beforeImageUrl: beforeRes.url,
        afterImageUrl: afterRes.url,
        caption: 'Antes y Después',
        isVideo: false
      });
    }
    
    // Subida normal
    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'PREVIEW_VIDEO' : galleryType === 'OFFICE' ? 'OFFICE' : 
                     galleryType === 'EQUIPMENT' ? 'EQUIPMENT' : 
                     galleryType === 'CERTIFICATION' ? 'CERTIFICATION' : 'GALLERY';
                     
    const uploadRes = await storeService.uploadMedia(file, mediaType as any);
    
    return galleryService.addImage({
      galleryType,
      catalogItemId,
      imageUrl: uploadRes.url,
      isVideo
    });
  }
};
