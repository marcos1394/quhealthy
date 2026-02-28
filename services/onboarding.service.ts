import axiosInstance from '@/lib/axios';
import {
  CategoryResponse,
  KycDocumentResponse,
  OnboardingStatusResponse,
  ProfileResponse,
  SubCategoryResponse,
  TagResponse,
  UpdateProfileRequest,
  LicenseResponse,
  MessageResponse,
  KycDocumentType,
  ProviderSector,
  FiscalDataResponse,
  FiscalDataRequest,
  FiscalRegimeOption
} from '@/types/onboarding';

export const onboardingService = {

  async getOnboardingStatus(): Promise<OnboardingStatusResponse> {
    const response = await axiosInstance.get('/api/onboarding/status');
    return response.data;
  },

  async finalizeOnboarding(): Promise<MessageResponse> {
    const response = await axiosInstance.post('/api/onboarding/finalize', null, {
      headers: { 'Accept': 'application/json' }
    });
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
  // 📸 KYC E IDENTIDAD (Paso 2)
  // =================================================================

  async uploadKycDocument(file: File, type: KycDocumentType): Promise<KycDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosInstance.post(
      '/api/onboarding/kyc/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return response.data;
  },

  async getKycDocuments(): Promise<KycDocumentResponse[]> {
    const response = await axiosInstance.get('/api/onboarding/kyc/documents');
    return response.data;
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
          // Use 'this' gently or call directly the exported method
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
  // 🎓 CÉDULA / LICENCIA COMERCIAL (Paso 3)
  // =================================================================

  async getLicense(sector: ProviderSector): Promise<LicenseResponse | null> {
    try {
      const endpoint = sector === 'HEALTH'
        ? '/api/onboarding/license/professional'
        : '/api/onboarding/license/business';
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async uploadLicense(file: File, sector: ProviderSector): Promise<LicenseResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sector', sector);

    const response = await axiosInstance.post(
      '/api/onboarding/license/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return response.data;
  },

  async validateProfessionalLicense(licenseNumber: string): Promise<{
    isValid: boolean;
    holderName: string | null;
    career: string | null;
    institution: string | null;
    graduationYear: number | null;
  }> {
    const response = await axiosInstance.post(
      '/api/onboarding/license/validate-renamecc',
      { licenseNumber }
    );
    return response.data;
  },

  // =================================================================
  // 🏛️ FISCAL (Paso 4)
  // =================================================================

  async getFiscalData(): Promise<FiscalDataResponse | null> {
    try {
      const response = await axiosInstance.get('/api/onboarding/fiscal');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async saveFiscalData(data: FiscalDataRequest): Promise<void> {
    await axiosInstance.put('/api/onboarding/fiscal', data);
  },

  async uploadFiscalDocument(
    file: File,
    docType: 'TAX_CERTIFICATE' | 'ACTA_CONSTITUTIVA'
  ): Promise<{
    fileUrl: string;
    extractedRfc: string | null;
    extractedLegalName: string | null;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    const response = await axiosInstance.post(
      '/api/onboarding/fiscal/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      }
    );
    return response.data;
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

  async getFiscalRegimes(): Promise<FiscalRegimeOption[]> {
    const response = await axiosInstance.get('/api/onboarding/catalogs/fiscal-regimes');
    return response.data;
  }
};
