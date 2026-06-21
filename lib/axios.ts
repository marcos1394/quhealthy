import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { useSessionStore } from '@/stores/SessionStore';
import { isInitialRefreshInProgress, initialRefreshPromise, nukeCookies } from '@/stores/SessionStore';
import { UserRole } from '@/types/auth';

// Estructura de error esperada desde Spring Boot
interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
}

// =========================================================================
// 1. INSTANCIA BASE
// =========================================================================
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // ✅ Crítico: envía automáticamente la cookie HttpOnly "refreshToken" al backend
  withCredentials: true,
});

// =========================================================================
// 2. COLA DE REQUESTS FALLIDOS (Token Refresh Auto)
//    Mientras se renueva el token, los requests 401 quedan en cola y se
//    reintentan con el nuevo access token en cuanto el refresh termina.
// =========================================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error || token === null) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// =========================================================================
// 3. INTERCEPTOR DE SOLICITUD — Inyecta el Bearer token
// =========================================================================
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 🚀 FIX: Si hay un refresh inicial en progreso, esperamos a que termine
    // antes de enviar cualquier request (excepto el propio refresh o login)
    const url = config.url ?? '';
    const isAuthRoute = url.includes('/api/auth/refresh-token') || url.includes('/api/auth/login');
    
    if (isInitialRefreshInProgress && initialRefreshPromise && !isAuthRoute) {
      try {
        await initialRefreshPromise;
      } catch (e) {
        // Si falla, ignoramos y dejamos que el request pase (probablemente retorne 401/403)
      }
    }

    const token = useSessionStore.getState().token;
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // 🚀 FIX: Safari bloquea cookies de 3ros por defecto (ITP). 
      // Usamos localStorage (1st party) y enviamos el header X-Device-Id.
      if (typeof window !== 'undefined') {
        let deviceId = localStorage.getItem('qd_id');
        if (!deviceId) {
          deviceId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          localStorage.setItem('qd_id', deviceId);
        }
        config.headers['X-Device-Id'] = deviceId;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// =========================================================================
// 4. INTERCEPTOR DE RESPUESTA — Auto-refresh en 401
//    🚀 FIX BUG-5: Ahora coordina con initializeSession() para evitar
//    race conditions que disparen falsos Replay Attacks.
// =========================================================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipAuthRedirect?: boolean;
    };

    // ── 404: lo pasamos directo al componente ────────────────────────────
    if (error.response?.status === 404) {
      return Promise.reject(buildCustomError(error));
    }

    // ── 401: intentamos renovar el token ─────────────────────────────────
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Evitamos bucle infinito si el propio login o refresh devuelve 401
      const url = originalRequest.url ?? '';
      if (
        url.includes('/api/auth/login') ||
        url.includes('/api/auth/refresh-token') ||
        url.includes('/api/auth/logout')
      ) {
        return Promise.reject(buildCustomError(error));
      }

      // 🚀 FIX BUG-5: Si initializeSession() ya está haciendo refresh,
      // esperamos su resultado en vez de hacer otro refresh que rompería la rotación
      if (isInitialRefreshInProgress && initialRefreshPromise) {
        return initialRefreshPromise.then((newToken) => {
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        }).catch(() => Promise.reject(buildCustomError(error)));
      }

      // Si ya hay un refresh en curso (desde otro 401) → encolar este request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ FIX CRÍTICO: body vacío — el refreshToken viaja exclusivamente en
        //    la cookie HttpOnly (withCredentials: true la envía automáticamente).
        const refreshRes = await axios.post<{
          token: string;
          refreshToken?: string;
          role?: string;
          user?: unknown;
          status?: string;
          expiresIn?: number;
        }>(
          '/api/auth/refresh-token',
          {}, // ← body vacío intencional
          {
            baseURL: axiosInstance.defaults.baseURL,
            withCredentials: true, // ← la cookie se adjunta aquí
          }
        );

        const newToken = refreshRes.data.token;

        // Actualizar store con el nuevo access token (y refresh si el backend lo rota)
        useSessionStore.getState().updateToken({
          token: newToken,
          role: refreshRes.data.role as UserRole | undefined,
          user: refreshRes.data.user as never,
          status: refreshRes.data.status as never,
        });

        // Despachar todos los requests encolados con el nuevo token
        processQueue(null, newToken);

        // Reintentar el request original que disparó el 401
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // El refresh falló (cookie expirada / revocada) → logout forzado
        processQueue(refreshError as AxiosError, null);
        useSessionStore.getState().clearSession(); // clearSession ya llama nukeCookies()

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isProtectedRoute = 
            /\/dashboard/.test(currentPath) ||
            /\/profile/.test(currentPath) ||
            /\/wallet/.test(currentPath) ||
            /\/appointments/.test(currentPath) ||
            /\/orders/.test(currentPath) ||
            /\/checkout/.test(currentPath) ||
            /\/settings/.test(currentPath) ||
            /\/reviews/.test(currentPath);

          if (isProtectedRoute && !originalRequest?.skipAuthRedirect) {
            window.location.href = '/login?expired=true';
          }
        }

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    // ── Resto de errores HTTP ─────────────────────────────────────────────
    return Promise.reject(await buildCustomError(error));
  }
);

// =========================================================================
// 5. HELPER: Construye un Error enriquecido con mensaje legible
// =========================================================================
async function buildCustomError(error: AxiosError<ApiErrorResponse>): Promise<Error> {
  const { getErrorMessage } = await import('@/lib/handleApiError');

  let message: string;

  if (error.response) {
    const serverMsg = error.response.data?.message || error.response.data?.error;
    message =
      serverMsg && !serverMsg.startsWith('Request failed')
        ? serverMsg
        : getErrorMessage(error.response.status);
  } else if (error.code === 'ECONNABORTED') {
    message = getErrorMessage('timeout');
  } else if (error.code === 'ERR_NETWORK' || !error.request) {
    message = getErrorMessage('network');
  } else {
    message = getErrorMessage('unknown');
  }

  const customError = new Error(message) as Error & {
    status?: number;
    originalError?: unknown;
  };
  customError.status = error.response?.status;
  customError.originalError = error.response?.data;

  return customError;
}

export default axiosInstance;