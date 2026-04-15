// Ubicación: src/hooks/useProfileOnboarding.ts

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboarding.service';
import { UpdateProfileRequest, ProfileResponse, CategoryResponse, TagResponse, OnboardingStatusResponse } from '@/types/onboarding';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useProfileOnboarding = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);

  const [initialData, setInitialData] = useState<ProfileResponse | null>(null);
  const [globalStatus, setGlobalStatus] = useState<OnboardingStatusResponse | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statusData, profileData] = await Promise.all([
        onboardingService.getOnboardingStatus().catch(() => null),
        onboardingService.getProfile().catch(e => {
          if (e.response?.status === 404) return null;
          throw e;
        })
      ]);

      setGlobalStatus(statusData);
      setInitialData(profileData);
    } catch (err: any) {
      console.error("Error cargando perfil:", err);
      setError("Error de conexión al cargar tu perfil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = async (formData: any) => {
    setIsSaving(true);
    try {
      const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";
      const derivedSector = Number(formData.parentCategoryId) === 1 ? 'HEALTH' : 'BEAUTY';

      // 🚀 FIX: Construimos el payload con el arreglo 'locations' obligatorio
      // Usamos "any" aquí temporalmente si tu interfaz de TS no está actualizada
      const payload: any = {
        businessName: formData.businessName.trim(),
        bio: formData.bio.trim(),
        sector: derivedSector,
        personType: formData.personType as 'FISICA' | 'MORAL',
        parentCategoryId: Number(formData.parentCategoryId),
        categoryId: Number(formData.categoryId),
        subCategoryId: Number(formData.subCategoryId),
        timeZone: detectedTimeZone,
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone?.trim() || "",
        websiteUrl: formData.websiteUrl?.trim() || null,
        profileImageUrl: formData.profileImageUrl || null,
        tagIds: Array.isArray(formData.tagIds) ? formData.tagIds.map((id: any) => Number(id)) : [],
        
        // 📍 LA ESTRUCTURA RELACIONAL CORRECTA PARA JAVA
        locations: [
          {
            name: "Consultorio Principal",
            address: formData.address,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude),
            placeId: formData.placeId || null,
            timeZone: detectedTimeZone,
            isMain: true
          }
        ]
      };

      await onboardingService.updateProfile(payload);

      toast.success("¡Información profesional guardada!");
      router.refresh();
      return true;

    } catch (error: any) {
      console.error("Error al guardar perfil:", error);
      // Extraemos el mensaje de validación si existe
      const msg = error.response?.data?.errors?.locations || error.response?.data?.message || "No se pudo guardar la información.";
      toast.error(msg);
      return false; // 🚀 FIX: Quitamos el "return;" huérfano para que devuelva false correctamente
    } finally {
      setIsSaving(false);
    }
  };

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

  const getSubCategories = async (categoryId: number) => {
    if (!categoryId) return [];
    try {
      return await onboardingService.getSubcategories(categoryId);
    } catch (err) {
      console.error("Error cargando subcategorías:", err);
      return [];
    }
  };

  useEffect(() => {
    loadProfile();
    loadCatalogs();
  }, [loadProfile, loadCatalogs]);

  return {
    initialData,
    globalStatus,
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