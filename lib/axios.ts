import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse
} from 'axios';
import { useSessionStore } from '@/stores/SessionStore';

// Estructura de error esperada desde Spring Boot
interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
}

// 1. Creación de la instancia
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Importante para enviar automáticamente el refreshToken (httpOnly cookie) al backend
});

// Variables para manejar la cola de requests rotos (Token Refresh Auto)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Interceptor de Solicitud (Request)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Leer el token directamente desde memoria (Zustand)
    const token = useSessionStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuesta (Response)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si es 404, lo dejamos pasar
    if (error.response && error.response.status === 404) {
      return Promise.reject(error);
    }

    // =========================================================================
    //  INTERCEPTOR 401: AUTO-REFRESH TOKEN (Implementado según requerimiento)
    // =========================================================================
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

      // Prevenir bucle infinito si falla el propio endpoint de login o refresh
      if (originalRequest.url?.includes('/api/auth/login') || originalRequest.url?.includes('/api/auth/refresh-token')) {
        return Promise.reject(error);
      }

      // Si ya hay alguien haciendo refresh, encolar el request actual
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Enviamos el refreshToken almacenado en Zustand
        const storedRefreshToken = useSessionStore.getState().refreshToken;
        const refreshRes = await axios.post('/api/auth/refresh-token',
          { refreshToken: storedRefreshToken },
          {
            baseURL: axiosInstance.defaults.baseURL,
            withCredentials: true
          }
        );

        const newToken = refreshRes.data.token;

        // Actualizar token en Zustand (persistido en localStorage)
        useSessionStore.getState().updateToken({
          token: newToken,
          refreshToken: refreshRes.data.refreshToken,
          role: refreshRes.data.role,
          user: refreshRes.data.user,
          status: refreshRes.data.status,
          expiresIn: refreshRes.data.expiresIn
        });

        // Procesar todos los pendientes con el nuevo token
        processQueue(null, newToken);

        // Reintentamos el request original que disparó este 401
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Falló el refresh (expiro o cookie inválida), limpiar y desloguear
        processQueue(refreshError as AxiosError, null);

        useSessionStore.getState().clearSession();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // =========================================================================
    //  MANEJO GENÉRICO DE ERRORES HTTP (usa diccionario i18n)
    // =========================================================================
    const { getErrorMessage } = await import('@/lib/handleApiError');

    let errorMessage: string;

    if (error.response) {
      // Prefer server-provided message if specific
      const serverMsg = error.response.data?.message || error.response.data?.error;
      if (serverMsg && !serverMsg.startsWith('Request failed')) {
        errorMessage = serverMsg;
      } else {
        errorMessage = getErrorMessage(error.response.status);
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = getErrorMessage('timeout');
    } else if (error.code === 'ERR_NETWORK' || !error.request) {
      errorMessage = getErrorMessage('network');
    } else {
      errorMessage = getErrorMessage('unknown');
    }

    const customError = new Error(errorMessage);
    (customError as any).status = error.response?.status;
    (customError as any).originalError = error.response?.data;

    return Promise.reject(customError);
  }
);

export default axiosInstance;