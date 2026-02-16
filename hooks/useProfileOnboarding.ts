import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboarding.service';
import { UpdateProfileRequest, ProfileResponse, CategoryResponse, TagResponse } from '@/types/onboarding';
import { toast } from 'react-toastify';

export const useProfileOnboarding = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  
  // Estado inicial del perfil (para pre-llenar el formulario)
  const [initialData, setInitialData] = useState<ProfileResponse | null>(null);

const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Limpiar errores previos
    
    try {
      const data = await onboardingService.getProfile();
      setInitialData(data);
    } catch (err: any) {
      const status = err.response?.status;

      // CASO 1: Usuario Nuevo (404)
      // Si el backend dice "No encontrado", significa que debemos mostrar el formulario vacío.
      // NO seteamos error, solo dejamos de cargar.
      if (status === 404) {
        console.log("Usuario nuevo detectado. Mostrando formulario vacío.");
        setInitialData(null); 
      } 
      // CASO 2: Error Real (500, Sin Internet, 403, etc.)
      else {
        const msg = "No pudimos cargar tu información existente.";
        console.error("Error cargando perfil:", err);
        // toast.error(msg); // Opcional: puedes quitarlo para no molestar al usuario si recarga mucho
        setError(msg); // ❌ Esto es lo que activa la pantalla roja
      }
    } finally {
      // Siempre apagamos el loading, sea éxito, 404 o error real.
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Guardar datos
  const saveProfile = async (formData: any) => {
    setIsSaving(true);
    try {
      
      // 🛠️ CONSTRUCCIÓN DEL PAYLOAD (DTO)
      const payload: UpdateProfileRequest = {
        // Textos (Trim para quitar espacios basura)
        businessName: formData.businessName.trim(),
        bio: formData.bio.trim(),
        contactPhone: formData.contactPhone?.trim() || "",
        contactEmail: formData.contactEmail.trim(),
        websiteUrl: formData.websiteUrl ? formData.websiteUrl.trim() : null,
        
        // Imagen (Enviamos null explícito para que Java no se queje)
        profileImageUrl: null, 
        
        // Ubicación (Conversión segura a números)
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        placeId: formData.placeId || null,

        // Categorías (Conversión a Enteros Long)
        categoryId: Number(formData.categoryId),
        subCategoryId: Number(formData.subCategoryId),
        
        // Tags (Si es undefined, enviamos lista vacía [])
        tagIds: Array.isArray(formData.tagIds) ? formData.tagIds.map(Number) : []
      };

      // Llamada al servicio
      await onboardingService.updateProfile(payload);
      
      toast.success("¡Perfil configurado exitosamente!");
      router.push('/onboarding'); // Volver al menú principal
      router.refresh(); 
      
    } catch (error: any) {
      console.error("Error payload:", error);
      const msg = error.response?.data?.message || "Error al guardar perfil.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
};


  // Función para cargar catálogos iniciales
  const loadCatalogs = useCallback(async () => {
    try {
      const [cats, availableTags] = await Promise.all([
        onboardingService.getCategories(),
        onboardingService.getTags()
      ]);
      setCategories(cats);
      setTags(availableTags);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
    }
  }, []);

  // Función para cargar subcategorías bajo demanda
  const getSubCategories = async (categoryId: number) => {
    try {
      return await onboardingService.getSubCategories(categoryId);
    } catch (err) {
      console.error("Error cargando subcategorías:", err);
      return [];
    }
  };

  useEffect(() => {
    loadProfile();
    loadCatalogs(); // Cargar categorías y tags al montar
  }, [loadProfile, loadCatalogs]);

  return {
    initialData,
    categories,
    tags,
    getSubCategories,
    isLoading,
    isSaving,
    error,
    saveProfile,
    refetch: loadProfile
  };
};