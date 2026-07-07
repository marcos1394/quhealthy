import api from './api';

export type TemplateType = 'SYSTEM' | 'CUSTOM';

export interface ClinicalTemplateField {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date';
    label: string;
    required: boolean;
    options?: string[]; // Para select, radio
}

export interface ClinicalTemplateSchema {
    fields: ClinicalTemplateField[];
}

export interface ClinicalTemplateRequest {
    name: string;
    description?: string;
    type: TemplateType;
    providerId?: number;
    category?: string;
    schema: ClinicalTemplateSchema;
    pdfTemplateText?: string;
}

export interface ClinicalTemplateResponse extends ClinicalTemplateRequest {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export const clinicalTemplateService = {
    getTemplates: async (providerId?: number): Promise<ClinicalTemplateResponse[]> => {
        const response = await api.get('/appointments/clinical-templates', {
            params: { providerId }
        });
        return response.data;
    },

    getTemplate: async (id: number): Promise<ClinicalTemplateResponse> => {
        const response = await api.get(`/appointments/clinical-templates/${id}`);
        return response.data;
    },

    createTemplate: async (data: ClinicalTemplateRequest): Promise<ClinicalTemplateResponse> => {
        const response = await api.post('/appointments/clinical-templates', data);
        return response.data;
    },

    updateTemplate: async (id: number, data: ClinicalTemplateRequest): Promise<ClinicalTemplateResponse> => {
        const response = await api.put(`/appointments/clinical-templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: number): Promise<void> => {
        await api.delete(`/appointments/clinical-templates/${id}`);
    }
};
