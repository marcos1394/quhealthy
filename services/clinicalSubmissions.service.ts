import api from './api';
import { ClinicalTemplateResponse } from './clinicalTemplates.service';

export type DocumentStatus = 'DRAFT' | 'FINALIZED';

export interface ClinicalSubmissionRequest {
    appointmentId: number;
    consumerId: number;
    providerId: number;
    templateId: number;
    data: any;
    status: DocumentStatus;
}

export interface ClinicalSubmissionResponse {
    id: number;
    appointmentId: number;
    consumerId: number;
    providerId: number;
    template: ClinicalTemplateResponse;
    data: any;
    status: DocumentStatus;
    createdAt: string;
    updatedAt: string;
}

export const clinicalSubmissionService = {
    getPatientHistory: async (consumerId: number): Promise<ClinicalSubmissionResponse[]> => {
        const response = await api.get(`/appointments/clinical-submissions/patient/${consumerId}`);
        return response.data;
    },

    getAppointmentSubmissions: async (appointmentId: number): Promise<ClinicalSubmissionResponse[]> => {
        const response = await api.get(`/appointments/clinical-submissions/appointment/${appointmentId}`);
        return response.data;
    },

    getSubmission: async (id: number): Promise<ClinicalSubmissionResponse> => {
        const response = await api.get(`/appointments/clinical-submissions/${id}`);
        return response.data;
    },

    saveSubmission: async (data: ClinicalSubmissionRequest): Promise<ClinicalSubmissionResponse> => {
        const response = await api.post('/appointments/clinical-submissions', data);
        return response.data;
    }
};
