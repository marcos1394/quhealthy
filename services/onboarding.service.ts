import axiosInstance from '@/lib/axios';
import {
  CategoryResponse,
  KycDocumentResponse,
  OnboardingStatusResponse,
  ProfileResponse,
  SubCategoryResponse,
  TagResponse,
  UpdateProfileRequest,
  MessageResponse,
  KycDocumentType,
  FiscalDataRequest,
  FiscalDataResponse,
} from '@/types/onboarding';

export const onboardingService = {

  async getOnboardingStatus(): Promise<OnboardingStatusResponse> {
    const response = await axiosInstance.get('/api/onboarding/status');
    return response.data;
  },

  async finalizeOnboarding(): Promise<void> {
    const response = await axiosInstance.post('/api/onboarding/finalize');
    return response.data;
  },

  // =================================================================
  // 👤 PERFIL PROFESIONAL (Paso 1)
  // =================================================================

  async getProfile(): Promise<ProfileResponse | null> {
    try {
      const response = await axiosInstance.get('/api/onboarding/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await axiosInstance.put('/api/onboarding/profile', data);
  },

  // =================================================================
  // 🎨 PREFERENCIAS DE RECETA (PDF) Y MEDIA
  // =================================================================
  async updatePrescriptionPreferences(data: UpdatePrescriptionPreferencesRequest): Promise<void> {
    await axiosInstance.patch('/api/onboarding/prescription-preferences', data);
  },

  // 🚀 NUEVA FUNCIÓN: Sube Logo o Firma a GCP
  async uploadPrescriptionMedia(file: File, type: 'LOGO' | 'SIGNATURE'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', type);

    const response = await axiosInstance.post(
      '/api/onboarding/media/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data; // El backend nos devuelve { url: "https://..." }
  },

  // =================================================================
  // 📸 KYC E IDENTIDAD (Paso 2 + Licencia + Fiscal)
  // =================================================================
  // 🚀 El backend unifica todos los documentos bajo el KycController.
  // Para cédula profesional: type = 'PROFESSIONAL_LICENSE'
  // Para constancia fiscal:  type = 'TAX_CERTIFICATE'
  // Para acta constitutiva:  type = 'ACTA_CONSTITUTIVA'

  async uploadKycDocument(file: File, type: KycDocumentType): Promise<KycDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosInstance.post(
      '/api/onboarding/kyc/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000, // 🚀 3 minutos (Extracción ML en OCR puede ser muy lenta)
      }
    );
    return response.data;
  },

  async getKycDocuments(): Promise<KycDocumentResponse[]> {
    const response = await axiosInstance.get('/api/onboarding/kyc/documents');
    return response.data;
  },

  /**
   * Helper: Obtiene un documento KYC específico por tipo.
   * Útil para consultar el estado de la cédula o constancia fiscal.
   */
  async getKycDocumentByType(type: KycDocumentType): Promise<KycDocumentResponse | null> {
    const documents = await onboardingService.getKycDocuments();
    return documents.find(d => d.documentType === type) || null;
  },

  async pollKycDocumentStatus(
    type: KycDocumentType,
    intervalMs: number = 5000,
    maxAttempts: number = 24
  ): Promise<KycDocumentResponse> {
    let attempts = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const documents = await onboardingService.getKycDocuments();
          const doc = documents.find(d => d.documentType === type);
          if (doc && doc.verificationStatus !== 'PROCESSING') {
            clearInterval(interval);
            resolve(doc);
          }
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('KYC polling timeout — análisis de IA tardó demasiado'));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, intervalMs);
    });
  },

  // =================================================================
  // 📚 CATÁLOGOS
  // =================================================================

  async getCategories(): Promise<CategoryResponse[]> {
    const response = await axiosInstance.get('/api/onboarding/catalogs/categories');
    return response.data;
  },

  async getSubcategories(categoryId: number): Promise<SubCategoryResponse[]> {
    const response = await axiosInstance.get(
      `/api/onboarding/catalogs/categories/${categoryId}/subcategories`
    );
    return response.data;
  },

  async getTags(): Promise<TagResponse[]> {
    const response = await axiosInstance.get('/api/onboarding/catalogs/tags');
    return response.data;
  },
};
