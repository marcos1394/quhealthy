import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosError, 
  AxiosResponse 
} from 'axios';

// Definimos la estructura de error que suele devolver Spring Boot
interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
}

// 1. Creación de la instancia con configuración Enterprise
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://api.quhealthy.org
  timeout: 15000, // 15 segundos de tolerancia
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. Interceptor de Solicitud (Request)
// Se ejecuta antes de que la petición salga del navegador
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Verificamos que estamos en el cliente (navegador) y no en el servidor (SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // Si hay token, lo inyectamos en el Header Authorization
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Respuesta (Response)
// Manejo centralizado de errores para no repetir try-catch complejos en los componentes
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Si la respuesta es exitosa (2xx), la dejamos pasar limpia
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    let errorMessage = 'Ocurrió un error inesperado. Intenta nuevamente.';

    if (error.response) {
      // El servidor respondió con un código de error (4xx, 5xx)
      
      // Prioridad 1: Mensaje personalizado del Backend (DTO de error)
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } 
      // Prioridad 2: Campo "error" estándar de Spring Security
      else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Manejo específico de códigos HTTP
      switch (error.response.status) {
        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          // Opcional: Lógica de logout automático
          // if (typeof window !== 'undefined') localStorage.removeItem('token');
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Nuestro equipo ha sido notificado.';
          break;
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta (problema de red/internet)
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }

    // Rechazamos la promesa con un objeto Error limpio que contiene solo el mensaje
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;