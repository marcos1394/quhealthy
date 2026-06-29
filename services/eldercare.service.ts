import axiosInstance from '@/lib/axios';

export interface VitalSignDto {
    id: number;
    type: string;
    value: string;
    secondaryValue?: string;
    unit: string;
    measuredAt: string;
    isOutOfRange: boolean;
    alertMessage?: string;
}

export interface MedicationTaskDto {
    id: number;
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
    isManual: boolean;
}

export interface EldercareDashboardDto {
    recentVitals: VitalSignDto[];
    activeMedications: MedicationTaskDto[];
}

export interface AddVitalSignRequest {
    type: string;
    value: string;
    secondaryValue?: string;
    unit: string;
    measuredAt?: string;
    source: string;
}

export interface AddMedicationRequest {
    medicationName: string;
    dosage: string;
    frequency: string;
    durationDays?: number;
    instructions?: string;
}

export const eldercareService = {
    getDashboard: async (dependentId: string | number): Promise<EldercareDashboardDto> => {
        const response = await axiosInstance.get(`/appointment_service/api/appointment/consumer/dependents/${dependentId}/eldercare/dashboard`);
        return response.data;
    },

    addVitalSign: async (dependentId: string | number, data: AddVitalSignRequest): Promise<void> => {
        await axiosInstance.post(`/appointment_service/api/appointment/consumer/dependents/${dependentId}/eldercare/vital-signs`, data);
    },

    addMedication: async (dependentId: string | number, data: AddMedicationRequest): Promise<void> => {
        await axiosInstance.post(`/appointment_service/api/appointment/consumer/dependents/${dependentId}/eldercare/medications`, data);
    }
};
