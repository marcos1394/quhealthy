import axiosInstance from '@/lib/axios';

export type TemplateType = 'SYSTEM' | 'CUSTOM';

export interface ClinicalTemplateField {
    id: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'boolean';
    label: string;
    required: boolean;
    readonly?: boolean;
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
    content?: string;
    isPublic?: boolean;
    authorName?: string;
    downloads?: number;
    rating?: number;
    likes?: number;
}

export interface ClinicalTemplateResponse extends ClinicalTemplateRequest {
    id: number;
    createdAt: string;
    updatedAt: string;
}

const parseTemplate = (tmpl: any): ClinicalTemplateResponse => {
    if (typeof tmpl.schema === 'string') {
        try {
            tmpl.schema = JSON.parse(tmpl.schema);
        } catch (e) {
            tmpl.schema = { fields: [] };
        }
    }
    return tmpl as ClinicalTemplateResponse;
};

export const clinicalTemplateService = {
    getTemplates: async (providerId?: number): Promise<ClinicalTemplateResponse[]> => {
        const response = await axiosInstance.get('/api/appointments/clinical-templates', {
            params: { providerId }
        });
        return response.data.map(parseTemplate);
    },

    getCommunityTemplates: async (): Promise<ClinicalTemplateResponse[]> => {
        const response = await axiosInstance.get('/api/appointments/clinical-templates/community');
        return response.data.map(parseTemplate);
    },

    getTemplate: async (id: number): Promise<ClinicalTemplateResponse> => {
        const response = await axiosInstance.get(`/api/appointments/clinical-templates/${id}`);
        return parseTemplate(response.data);
    },

    createTemplate: async (data: ClinicalTemplateRequest): Promise<ClinicalTemplateResponse> => {
        const response = await axiosInstance.post('/api/appointments/clinical-templates', data);
        return parseTemplate(response.data);
    },

    updateTemplate: async (id: number, data: ClinicalTemplateRequest): Promise<ClinicalTemplateResponse> => {
        const response = await axiosInstance.put(`/api/appointments/clinical-templates/${id}`, data);
        return parseTemplate(response.data);
    },

    deleteTemplate: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/api/appointments/clinical-templates/${id}`);
    },

    likeTemplate: async (id: number): Promise<void> => {
        await axiosInstance.put(`/api/appointments/clinical-templates/${id}/like`);
    },

    cloneTemplate: async (id: number, providerId: number): Promise<ClinicalTemplateResponse> => {
        const response = await axiosInstance.post(`/api/appointments/clinical-templates/${id}/clone`, null, {
            params: { providerId }
        });
        return parseTemplate(response.data);
    }
};
