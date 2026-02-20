// services/staff.service.ts
import axiosInstance from '@/lib/axios';
import { StaffDTO } from '@/types/staff';

const BASE_URL = '/api/store/staff';

export const staffService = {
  
  getMyStaff: async (): Promise<StaffDTO[]> => {
    const response = await axiosInstance.get(`${BASE_URL}/me`);
    return response.data;
  },

  addStaffMember: async (member: StaffDTO): Promise<StaffDTO> => {
    const response = await axiosInstance.post(BASE_URL, member);
    return response.data;
  },

  updateStaffMember: async (id: number, member: StaffDTO): Promise<StaffDTO> => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, member);
    return response.data;
  },

  deleteStaffMember: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  }
};