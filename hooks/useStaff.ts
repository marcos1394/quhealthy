// hooks/useStaff.ts
import { useState, useCallback } from 'react';
import { staffService } from '@/services/staff.service';
import { storeService } from '@/services/store.service'; // Para usar GCP uploadMedia
import { UI_StaffMember, StaffDTO, StaffRoleBackend } from '@/types/staff';
import { toast } from 'react-toastify';

export const useStaff = () => {
  const [staff, setStaff] = useState<UI_StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- TRADUCTORES ---
  const mapRoleToUI = (role: StaffRoleBackend): UI_StaffMember['role'] => {
    if (role === 'LEAD') return 'lead';
    if (role === 'ASSISTANT') return 'assistant';
    return 'specialist';
  };

  const mapRoleToBackend = (role: UI_StaffMember['role']): StaffRoleBackend => {
    if (role === 'lead') return 'LEAD';
    if (role === 'assistant') return 'ASSISTANT';
    return 'SPECIALIST';
  };

  // --- MÉTODOS ---
  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await staffService.getMyStaff();
      const mappedStaff: UI_StaffMember[] = data.map(member => ({
        id: member.id!,
        name: member.name,
        specialty: member.specialty || '',
        bio: member.bio || '',
        imageUrl: member.imageUrl,
        role: mapRoleToUI(member.role),
        credentials: member.credentials || '',
        isNew: false,
        hasUnsavedChanges: false
      }));
      setStaff(mappedStaff);
    } catch (error) {
      console.error("Error cargando equipo", error);
      toast.error("Hubo un error al cargar tu equipo de trabajo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveMember = async (member: UI_StaffMember): Promise<UI_StaffMember | null> => {
    const payload: StaffDTO = {
      name: member.name,
      specialty: member.specialty,
      bio: member.bio,
      imageUrl: member.imageUrl,
      role: mapRoleToBackend(member.role),
      credentials: member.credentials
    };

    try {
      let savedData: StaffDTO;
      if (member.isNew) {
        savedData = await staffService.addStaffMember(payload);
      } else {
        savedData = await staffService.updateStaffMember(member.id, payload);
      }
      return { ...member, id: savedData.id!, isNew: false, hasUnsavedChanges: false };
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar el miembro del equipo.");
      return null;
    }
  };

  const deleteMember = async (id: number): Promise<boolean> => {
    try {
      await staffService.deleteStaffMember(id);
      return true;
    } catch (error) {
      toast.error("Error al eliminar al colaborador.");
      return false;
    }
  };

  // ☁️ Subida de foto a GCP reutilizando tu storeService
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      // Usamos el tipo STAFF_AVATAR que agregamos a tus StoreMediaTypes
      const response = await storeService.uploadMedia(file, 'STAFF_AVATAR' as any);
      return response.url;
    } catch (error) {
      toast.error("Error al subir la imagen del colaborador.");
      return null;
    }
  };

  return {
    staff,
    setStaff,
    isLoading,
    fetchStaff,
    saveMember,
    deleteMember,
    uploadAvatar
  };
};