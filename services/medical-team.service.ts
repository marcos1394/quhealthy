import { getApiUrl } from "@/lib/utils/api-utils";
import axios from "axios";
import { getSession } from "next-auth/react";

export interface MedicalTeamMemberDto {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  assigned: boolean; // Note: Jackson maps isAssigned to assigned in JSON
}

export const medicalTeamService = {
  getOncologyTeam: async (): Promise<MedicalTeamMemberDto[]> => {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
      throw new Error("No authentication token available");
    }

    try {
      const response = await axios.get(`${getApiUrl("appointment")}/api/appointments/medical-team/oncology/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching oncology medical team:", error);
      throw error;
    }
  }
};
