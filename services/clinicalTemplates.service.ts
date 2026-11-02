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
    reviewsCount?: number;
}

export interface ClinicalTemplateResponse extends ClinicalTemplateRequest {
    id: number;
    createdAt: string;
    updatedAt: string;
    reviewsCount?: number;
    isLiked?: boolean;
}

export interface ClinicalTemplateReview {
    id: number;
    templateId: number;
    providerId: number;
    authorName?: string;
    rating: number; // 1 to 5
    comment?: string;
    createdAt: string;
}

export interface TemplateLikeToggleResult {
    templateId: number;
    liked: boolean;
    likesCount: number;
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

    likeTemplate: async (id: number, providerId?: number): Promise<void> => {
        await axiosInstance.put(`/api/appointments/clinical-templates/${id}/like`, null, {
            params: { providerId }
        });
    },

    toggleLike: async (id: number, providerId?: number): Promise<TemplateLikeToggleResult> => {
        const response = await axiosInstance.post(`/api/appointments/clinical-templates/${id}/like`, null, {
            params: { providerId }
        });
        return response.data;
    },

    getLikedTemplateIds: async (providerId: number): Promise<number[]> => {
        const response = await axiosInstance.get('/api/appointments/clinical-templates/liked-ids', {
            params: { providerId }
        });
        return response.data;
    },

    getReviews: async (templateId: number): Promise<ClinicalTemplateReview[]> => {
        const response = await axiosInstance.get(`/api/appointments/clinical-templates/${templateId}/reviews`);
        return response.data;
    },

    addReview: async (
        templateId: number,
        data: { providerId: number; authorName?: string; rating: number; comment?: string }
    ): Promise<ClinicalTemplateReview> => {
        const response = await axiosInstance.post(`/api/appointments/clinical-templates/${templateId}/reviews`, data);
        return response.data;
    },

    cloneTemplate: async (id: number, providerId: number): Promise<ClinicalTemplateResponse> => {
        const response = await axiosInstance.post(`/api/appointments/clinical-templates/${id}/clone`, null, {
            params: { providerId }
        });
        return parseTemplate(response.data);
    }
};
