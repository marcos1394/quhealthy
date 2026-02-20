
// hooks/useStoreProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { storeService } from '@/services/store.service';
import { StoreProfile, StoreMediaType } from '@/types/store';
import { toast } from 'react-toastify';

export const useStoreProfile = () => {
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Cargar el perfil al montar el hook
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storeService.getMyStore();
      setProfile(data);
    } catch (error) {
      console.error("Error cargando perfil de tienda:", error);
      toast.error("No pudimos cargar la información de tu tienda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Actualizar el perfil en la base de datos
  const updateProfile = async (updates: Partial<StoreProfile>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updatedData = await storeService.updateMyStore({ ...profile, ...updates } as StoreProfile);
      setProfile(updatedData);
      toast.success("Cambios guardados exitosamente");
      return true;
    } catch (error: any) {
      // Manejar el error específico del Slug duplicado que configuramos en Java
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error al guardar los cambios.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Subir imagen/video y actualizar el estado automáticamente
  const uploadMedia = async (file: File, type: StoreMediaType): Promise<string | null> => {
    setIsUploading(true);
    try {
      const response = await storeService.uploadMedia(file, type);
      const newUrl = response.url;

      // Actualizar el estado local inmediatamente para que la UI reaccione
      if (profile) {
        if (type === 'LOGO') setProfile({ ...profile, logoUrl: newUrl });
        if (type === 'BANNER') setProfile({ ...profile, bannerUrl: newUrl });
        if (type === 'PREVIEW_VIDEO') setProfile({ ...profile, previewVideoUrl: newUrl });
        if (type === 'GALLERY') setProfile({ ...profile, promotionalImages: [...profile.promotionalImages, newUrl] });
      }

      toast.success("Archivo subido con éxito");
      return newUrl;
    } catch (error: any) {
      console.error("Error subiendo archivo:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error al subir el archivo.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    profile,
    setProfile, // Expuesto por si necesitas hacer cambios optimistas en la UI antes de guardar
    isLoading,
    isSaving,
    isUploading,
    updateProfile,
    uploadMedia,
    refresh: fetchProfile
  };
};