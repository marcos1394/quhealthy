import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onboardingService } from '@/services/onboarding.service';
import { UpdateProfileRequest, ProfileResponse } from '@/types/onboarding';
import { toast } from 'react-toastify';

export const useProfileOnboarding = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado inicial del perfil (para pre-llenar el formulario)
  const [initialData, setInitialData] = useState<ProfileResponse | null>(null);

 const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Limpiar errores previos
    try {
      const data = await onboardingService.getProfile();
      setInitialData(data);
    } catch (err: any) {
      // Si es 404 (Usuario nuevo), no es error. Si es otra cosa, sí.
      if (err.response?.status !== 404) {
        const msg = "No pudimos cargar tu información existente.";
        console.error("Error cargando perfil:", err);
        toast.error(msg);
        setError(msg); // ✅ Guardamos el error
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Guardar datos
  const saveProfile = async (data: UpdateProfileRequest) => {
    setIsSaving(true);
    try {
      await onboardingService.updateProfile(data);
      
      toast.success("Perfil actualizado correctamente");
      
      // Forzamos un refresh del status de onboarding para desbloquear el siguiente paso
      // Y redirigimos al checklist principal
      router.push('/onboarding'); 
      router.refresh();
      
    } catch (error: any) {
      console.error("Error guardando perfil:", error);
      const msg = error.response?.data?.message || "Error al guardar el perfil.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    initialData,
    isLoading,
    isSaving,
    saveProfile,
    error,   // ✅ Exponemos el error
    refetch: loadProfile // ✅ Exponemos la función para reintentar
  };
};