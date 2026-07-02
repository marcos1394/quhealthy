import { useState, useCallback, useEffect } from 'react';
import { galleryService, GalleryImageRequest } from '@/services/gallery.service';
import { GalleryImage, GalleryType } from '@/types/store';
import { toast } from 'react-toastify';

export const useGallery = (type?: GalleryType, catalogItemId?: number) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: GalleryImage[] = [];
      if (catalogItemId) {
        data = await galleryService.getItemGallery(catalogItemId);
      } else {
        data = await galleryService.getStoreGallery(type);
      }
      setImages(data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Error al cargar la galería');
    } finally {
      setIsLoading(false);
    }
  }, [type, catalogItemId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const addImages = async (files: File[], specificType?: GalleryType) => {
    setIsUploading(true);
    const targetType = specificType || type;
    
    if (!targetType) {
      toast.error('Tipo de galería no especificado');
      setIsUploading(false);
      return;
    }

    try {
      // Sube secuencialmente (podría optimizarse con Promise.all pero para GCS directo es más seguro así)
      const newImages = [];
      for (const file of files) {
        const result = await galleryService.uploadAndAddImage(file, targetType, catalogItemId);
        newImages.push(result);
      }
      
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${files.length} imagen(es) subida(s) con éxito`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Error al subir imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const addBeforeAfter = async (beforeFile: File, afterFile: File, caption?: string) => {
    setIsUploading(true);
    try {
      const result = await galleryService.uploadAndAddImage(
        beforeFile, 
        'BEFORE_AFTER', 
        catalogItemId, 
        beforeFile, 
        afterFile
      );
      
      if (caption) {
        await galleryService.updateImage(result.id, { caption, galleryType: 'BEFORE_AFTER', imageUrl: result.imageUrl });
        result.caption = caption;
      }
      
      setImages(prev => [...prev, result]);
      toast.success('Comparación Antes/Después añadida con éxito');
    } catch (error) {
      console.error('Error uploading before/after:', error);
      toast.error('Error al subir imágenes');
    } finally {
      setIsUploading(false);
    }
  };

  const updateCaption = async (imageId: number, caption: string, imageUrl: string, galleryType: GalleryType) => {
    try {
      await galleryService.updateImage(imageId, { caption, imageUrl, galleryType });
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, caption } : img));
      toast.success('Descripción actualizada');
    } catch (error) {
      console.error('Error updating caption:', error);
      toast.error('Error al actualizar descripción');
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      await galleryService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Imagen eliminada');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar imagen');
    }
  };

  const reorderImages = async (newOrderIds: number[]) => {
    // Optimistic UI update
    const newImages = [...images].sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));
    setImages(newImages);
    
    try {
      await galleryService.reorderGallery(newOrderIds);
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Error al reordenar imágenes');
      fetchImages(); // Revert on error
    }
  };

  return {
    images,
    isLoading,
    isUploading,
    fetchImages,
    addImages,
    addBeforeAfter,
    updateCaption,
    deleteImage,
    reorderImages
  };
};
