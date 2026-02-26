import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboarding.service';
import { UpdateProfileRequest, ProfileResponse, CategoryResponse, TagResponse } from '@/types/onboarding';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gestionar el flujo de datos del perfil profesional.
 * Maneja la carga de información existente, catálogos y la persistencia final.
 */
export const useProfileOnboarding = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Catálogos
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  
  // Datos iniciales del perfil (Snapshot desde la DB)
  const [initialData, setInitialData] = useState<ProfileResponse | null>(null);

  /**
   * 1. Carga el perfil actual del profesional.
   * Maneja el caso 404 (Usuario nuevo) para inicializar un formulario limpio.
   */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await onboardingService.getProfile();
      setInitialData(data);
    } catch (err: any) {
      const status = err.response?.status;

      if (status === 404) {
        // Usuario sin registro previo en onboarding-service (Self-healing)
        setInitialData(null); 
      } else {
        const msg = "Error de conexión al cargar tu perfil.";
        console.error("Error cargando perfil:", err);
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 2. Guarda o actualiza el perfil completo.
   * Transforma el estado local del formulario al DTO UpdateProfileRequest.
   */
  const saveProfile = async (formData: any) => {
    setIsSaving(true);
    try {
      
      // 🚀 1. DETECCIÓN AUTOMÁTICA DE ZONA HORARIA DEL NAVEGADOR
      // Si por alguna razón el navegador no la soporta (muy raro), usamos un fallback seguro.
      const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";

      // 🛠️ CONSTRUCCIÓN DEL PAYLOAD (Alineado con Java @RequestBody)
      const payload: UpdateProfileRequest = {
        // Identidad e Industria
        businessName: formData.businessName.trim(),
        parentCategoryId: Number(formData.parentCategoryId), // ✅ NUEVO: Salud (1) o Belleza (2)
        bio: formData.bio.trim(),
        
        // Imagen (Si está vacía, enviamos null explícito)
        profileImageUrl: formData.profileImageUrl || null, 
        
        // Ubicación (Garantizamos tipos numéricos para PostgreSQL)
        address: formData.address,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        placeId: formData.placeId || null,

        // Contacto
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone?.trim() || "",
        websiteUrl: formData.websiteUrl?.trim() || null,

        // Categorización (Especialidad y Subespecialidad)
        categoryId: Number(formData.categoryId),
        subCategoryId: Number(formData.subCategoryId),
        
        // Tags (Mapeo seguro a array de IDs numéricos)
        tagIds: Array.isArray(formData.tagIds) 
          ? formData.tagIds.map((id: any) => Number(id)) 
          : [],

        // 🚀 2. INYECTAMOS LA ZONA HORARIA EN EL PAYLOAD
        timeZone: detectedTimeZone
      };

      // Envío al microservicio
      await onboardingService.updateProfile(payload);
      
      toast.success("¡Información profesional guardada!");
      
      // Refrescamos y redirigimos (al menú de onboarding o dashboard según estado)
      router.refresh(); 
      return true; // Indicador de éxito para el componente
      
    } catch (error: any) {
      console.error("Error al guardar perfil:", error);
      const msg = error.response?.data?.message || "No se pudo guardar la información.";
      toast.error(msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 3. Carga de catálogos generales (Categorías nivel 2 y Tags).
   */
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

  /**
   * 4. Obtención de subcategorías (Nivel 3) filtradas por categoría.
   */
  const getSubCategories = async (categoryId: number) => {
    if (!categoryId) return [];
    try {
      return await onboardingService.getSubCategories(categoryId);
    } catch (err) {
      console.error("Error cargando subcategorías:", err);
      return [];
    }
  };

  // Ciclo de vida inicial
  useEffect(() => {
    loadProfile();
    loadCatalogs();
  }, [loadProfile, loadCatalogs]);

  return {
    // Datos y Catálogos
    initialData,
    categories,
    tags,
    getSubCategories,
    
    // Estados de UI
    isLoading,
    isSaving,
    error,
    
    // Acciones
    saveProfile,
    refetch: loadProfile
  };
};