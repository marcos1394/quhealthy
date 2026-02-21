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

  // 📥 Cargar el perfil al montar el hook
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

  // 💾 Actualizar el perfil en la base de datos (Incluye ahora Lat/Lng y Categoría)
  const updateProfile = async (updates: Partial<StoreProfile>): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Combinamos el perfil actual con las actualizaciones antes de enviar
      const payload = { ...profile, ...updates } as StoreProfile;
      const updatedData = await storeService.updateMyStore(payload);
      
      // Actualizamos el estado local con la respuesta fresca del backend
      setProfile(updatedData);
      toast.success("Cambios guardados exitosamente");
      return true;
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
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

  // ☁️ Subir imagen/video y actualizar el estado automáticamente
  const uploadMedia = async (file: File, type: StoreMediaType): Promise<string | null> => {
    setIsUploading(true);
    try {
      const response = await storeService.uploadMedia(file, type);
      const newUrl = response.url;

      // Actualizar el estado local inmediatamente para que la UI reaccione sin tener que recargar
      setProfile((prevProfile) => {
        if (!prevProfile) return prevProfile;
        
        const updatedProfile = { ...prevProfile };
        if (type === 'LOGO') updatedProfile.logoUrl = newUrl;
        if (type === 'BANNER') updatedProfile.bannerUrl = newUrl;
        if (type === 'PREVIEW_VIDEO') updatedProfile.previewVideoUrl = newUrl;
        if (type === 'GALLERY') {
          updatedProfile.promotionalImages = [...(updatedProfile.promotionalImages || []), newUrl];
        }
        return updatedProfile;
      });

      // Nota: STAFF_AVATAR y ITEM_IMAGE no se guardan en el StoreProfile general,
      // se gestionan en sus respectivos componentes/hooks.

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
    setProfile, // Expuesto por si necesitas hacer cambios optimistas rápidos en la UI
    isLoading,
    isSaving,
    isUploading,
    updateProfile,
    uploadMedia,
    refresh: fetchProfile // Útil si necesitas forzar una recarga desde algún componente
  };
};