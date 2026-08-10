import axiosInstance from '@/lib/axios';

export interface MedicalTeamMemberDto {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  assigned: boolean; // Note: Jackson maps isAssigned to assigned in JSON
}

export const medicalTeamService = {
  getOncologyTeam: async (): Promise<MedicalTeamMemberDto[]> => {
    const response = await axiosInstance.get<MedicalTeamMemberDto[]>('/api/appointments/medical-team/oncology/me');
    return response.data;
  }
};
