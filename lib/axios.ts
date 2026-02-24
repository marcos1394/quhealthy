import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosError, 
  AxiosResponse 
} from 'axios';
import { useSessionStore } from '@/stores/SessionStore'; // ✅ Importamos el Store

// Definimos la estructura de error que suele devolver Spring Boot
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
});

// 2. Interceptor de Solicitud (Request)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ✅ LEEMOS EL TOKEN DESDE ZUSTAND (Más seguro y reactivo)
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
  (error: AxiosError<ApiErrorResponse>) => {
    
    // Si es 404 (Recurso no encontrado), lo dejamos pasar para manejo local
    if (error.response && error.response.status === 404) {
      return Promise.reject(error);
    }

    let errorMessage = 'Ocurrió un error inesperado. Intenta nuevamente.';

    if (error.response) {
      // Prioridad 1: Mensaje del Backend
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } 
      else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Manejo específico de códigos HTTP
      switch (error.response.status) {
        case 401: // Unauthorized (Token vencido o inválido)
          errorMessage = 'Tu sesión ha expirado.';
          
          // ✅ LIMPIEZA AUTOMÁTICA DE SESIÓN
          useSessionStore.getState().clearSession();
          
          // Redirección forzada al login si no estamos ya ahí
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
             window.location.href = '/login?expired=true';
          }
          break;
          
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
          
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    // Creamos un error limpio
    const customError = new Error(errorMessage);
    (customError as any).status = error.response?.status;
    (customError as any).originalError = error.response?.data; // Guardamos la data original por si acaso

    return Promise.reject(customError);
  }
);

export default axiosInstance;