import axiosInstance from '@/lib/axios';
import { SportsMedicalEvaluationRequest, SportsMedicalEvaluationResponse } from '@/types/sportsMedicine';

const BASE_URL = '/api/appointments/sports-evaluations';

export const sportsMedicineService = {
    
    createEvaluation: async (data: SportsMedicalEvaluationRequest): Promise<SportsMedicalEvaluationResponse> => {
        const response = await axiosInstance.post<SportsMedicalEvaluationResponse>(BASE_URL, data);
        return response.data;
    },

    updateEvaluation: async (id: number, data: SportsMedicalEvaluationRequest): Promise<SportsMedicalEvaluationResponse> => {
        const response = await axiosInstance.put<SportsMedicalEvaluationResponse>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    getEvaluation: async (id: number): Promise<SportsMedicalEvaluationResponse> => {
        const response = await axiosInstance.get<SportsMedicalEvaluationResponse>(`${BASE_URL}/${id}`);
        return response.data;
    },

    getPatientHistory: async (patientId: number): Promise<SportsMedicalEvaluationResponse[]> => {
        const response = await axiosInstance.get<SportsMedicalEvaluationResponse[]>(`${BASE_URL}/patient/${patientId}`);
        return response.data;
    },

    downloadPdf: async (id: number): Promise<void> => {
        const response = await axiosInstance.get(`${BASE_URL}/${id}/pdf`, {
            responseType: 'blob'
        });
        
        // Crear enlace temporal para forzar la descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `certificado-deportivo-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Limpieza
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};
