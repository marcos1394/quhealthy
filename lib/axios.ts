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
    
    // ✅ CORRECCIÓN CRÍTICA: EXCEPCIÓN PARA 404
    // Si el error es 404 (Not Found), lo devolvemos intacto.
    // Esto permite que los hooks detecten "Usuario Nuevo" o "Recurso no encontrado"
    // y manejen la lógica (ej: mostrar formulario vacío) en lugar de lanzar una alerta de error.
    if (error.response && error.response.status === 404) {
      return Promise.reject(error);
    }

    // --- Inicio de lógica de errores genéricos ---
    let errorMessage = 'Ocurrió un error inesperado. Intenta nuevamente.';

    if (error.response) {
      // El servidor respondió con un código de error (4xx, 5xx) pero NO es 404
      
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
          // Opcional: Lógica de logout automático si lo deseas
          if (typeof window !== 'undefined') {
             // localStorage.removeItem('token');
             // window.location.href = '/auth/login';
          }
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

    // Rechazamos la promesa con un objeto Error limpio que contiene solo el mensaje procesado
    // Nota: Esto llega al catch() de tus servicios como "err.message"
    const customError = new Error(errorMessage);
    
    // Opcional: Adjuntamos el status original por si se necesita debuggear
    (customError as any).status = error.response?.status;

    return Promise.reject(customError);
  }
);

export default axiosInstance;