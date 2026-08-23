// services/cfdi.service.ts
import axiosInstance from '@/lib/axios';
import {
  FiscalProfile,
  UploadCsdPayload,
  SelfServiceInvoicePayload,
  DirectInvoicePayload,
  CancelCfdiPayload,
  CfdiRecordResponse,
} from '@/types/cfdi';

const BASE_URL = '/api/payments/cfdi';

export const cfdiService = {
  /**
   * Obtiene la configuración fiscal y estado de sellos CSD del médico
   */
  getFiscalProfile: async (): Promise<FiscalProfile> => {
    const response = await axiosInstance.get<FiscalProfile>(`${BASE_URL}/fiscal-profile`);
    return response.data;
  },

  /**
   * Guarda o actualiza los datos fiscales y sube los archivos CSD (.cer, .key)
   */
  saveFiscalProfile: async (data: UploadCsdPayload): Promise<FiscalProfile> => {
    const response = await axiosInstance.post<FiscalProfile>(`${BASE_URL}/fiscal-profile`, data);
    return response.data;
  },

  /**
   * Emite una factura por autofacturación pública usando el token del ticket POS
   */
  issueSelfServiceInvoice: async (data: SelfServiceInvoicePayload): Promise<CfdiRecordResponse> => {
    const response = await axiosInstance.post<CfdiRecordResponse>(`${BASE_URL}/self-service/issue`, data);
    return response.data;
  },

  /**
   * Emisión directa de CFDI 4.0 (PUE o PPD) desde el dashboard del médico
   */
  issueDirectInvoice: async (data: DirectInvoicePayload): Promise<CfdiRecordResponse> => {
    const response = await axiosInstance.post<CfdiRecordResponse>(`${BASE_URL}/direct/issue`, data);
    return response.data;
  },

  /**
   * Cancela una factura ante el SAT con motivo oficial (01, 02, 03, 04)
   */
  cancelCfdi: async (uuidSat: string, data: CancelCfdiPayload): Promise<CfdiRecordResponse> => {
    const response = await axiosInstance.post<CfdiRecordResponse>(`${BASE_URL}/${uuidSat}/cancel`, data);
    return response.data;
  },

  /**
   * Emite la Factura Global al Público en General agrupando tickets no facturados
   */
  issueGlobalInvoice: async (posReceiptIds: number[]): Promise<CfdiRecordResponse> => {
    const response = await axiosInstance.post<CfdiRecordResponse>(`${BASE_URL}/global/issue`, posReceiptIds);
    return response.data;
  },

  /**
   * Obtiene el listado de facturas emitidas por el proveedor
   */
  getInvoices: async (page: number = 0, size: number = 20): Promise<{ content: CfdiRecordResponse[]; totalElements: number }> => {
    const response = await axiosInstance.get(`${BASE_URL}/invoices`, {
      params: { page, size },
    });
    return response.data;
  },
};
