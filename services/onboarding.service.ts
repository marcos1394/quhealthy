import axiosInstance from '@/lib/axios';
import { CategoryResponse, 
    KycDocumentResponse, 
    OnboardingStatusResponse, 
    ProfileResponse, 
    SubCategoryResponse, 
    TagResponse, 
    UpdateProfileRequest,
    LicenseResponse 
} from '@/types/onboarding';

const BASE_URL = '/api/onboarding';
const BASE_PROFILE = '/api/onboarding/profile'; // ✅ Nueva Base URL
const BASE_CATALOGS = '/api/onboarding/catalogs';
const BASE_LICENSE = '/api/onboarding/license';

export const onboardingService = {
  /**
   * Obtiene el estado actual.
   * NO enviamos X-User-Id. El backend lo saca del Token JWT (Authorization header).
   */
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    // axiosInstance ya envía 'Authorization: Bearer ...' automáticamente
    const response = await axiosInstance.get<OnboardingStatusResponse>(
      `${BASE_URL}/status`
    );
    return response.data;
  },

  // =================================================================
  // 👤 PERFIL PROFESIONAL (Paso 1)
  // =================================================================

  /**
   * Obtiene la información actual del perfil del doctor logueado.
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(
      `${BASE_PROFILE}`
    );
    return response.data;
  },

  /**
   * Actualiza o Crea el perfil.
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    await axiosInstance.put(
      `${BASE_PROFILE}`,
      data
    );
  },

  /**
   * Obtiene un perfil público (Para vista previa o compartir).
   */
  getPublicProfile: async (providerId: number): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(
      `${BASE_PROFILE}/${providerId}`
    );
    return response.data;
  },

  // =================================================================
  // 📚 CATÁLOGOS (Públicos)
  // =================================================================

  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await axiosInstance.get<CategoryResponse[]>(`${BASE_CATALOGS}/categories`);
    return response.data;
  },

  getSubCategories: async (categoryId: number): Promise<SubCategoryResponse[]> => {
    const response = await axiosInstance.get<SubCategoryResponse[]>(
      `${BASE_CATALOGS}/categories/${categoryId}/subcategories`
    );
    return response.data;
  },

  getTags: async (): Promise<TagResponse[]> => {
    const response = await axiosInstance.get<TagResponse[]>(`${BASE_CATALOGS}/tags`);
    return response.data;
  },

  uploadKycDocument: async (file: File, type: DocumentType): Promise<KycDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // POST /api/onboarding/kyc/upload?type=INE_FRONT
    const response = await axiosInstance.post<KycDocumentResponse>(
      `/api/onboarding/kyc/upload?type=${type}`, 
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // Gemini puede tardar unos segundos en analizar
      }
    );
    return response.data;
  },

  getKycDocuments: async (): Promise<KycDocumentResponse[]> => {
    // Necesitas crear este endpoint GET en tu KycController si no existe,
    // para recuperar el estado al recargar la página.
    const response = await axiosInstance.get<KycDocumentResponse[]>('/api/onboarding/kyc/documents');
    return response.data;
  },

 finalizeOnboarding: async (): Promise<void> => {
    // ✅ Usamos la constante BASE_URL (/api/onboarding)
    await axiosInstance.post(`${BASE_URL}/finalize`);
  },

  // =================================================================
  // 🎓 CÉDULA PROFESIONAL (NUEVO)
  // =================================================================

  /**
   * Sube la cédula para extracción OCR con Gemini.
   */
  uploadLicense: async (file: File): Promise<LicenseResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // El backend NO pide ?type=... porque es un endpoint dedicado
    const response = await axiosInstance.post<LicenseResponse>(
      `${BASE_LICENSE}/upload`, 
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000 // ⚠️ Damos más tiempo (60s) porque Gemini lee mucho texto en cédulas
      }
    );
    return response.data;
  },

  /**
   * Obtiene el estado actual de la licencia.
   */
  getLicense: async (): Promise<LicenseResponse> => {
    const response = await axiosInstance.get<LicenseResponse>(`${BASE_LICENSE}`);
    return response.data;
  }

};


