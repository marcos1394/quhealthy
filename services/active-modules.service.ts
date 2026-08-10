import axiosInstance from '@/lib/axios';

export interface ActiveModulesResponse {
  activeModules: string[];
  selfReported: boolean;
}

export const activeModulesService = {
  getActiveModules: async (consumerId: number): Promise<ActiveModulesResponse> => {
    const response = await axiosInstance.get<ActiveModulesResponse>(
      `/api/onboarding/consumer/${consumerId}/active-modules`
    );
    return response.data;
  },
};
