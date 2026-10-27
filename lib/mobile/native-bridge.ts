/**
 * Native Bridge para QuHealthy Mobile (iOS TestFlight & Android)
 * Detecta entorno nativo (WKWebView / Capacitor), gestiona permisos WebRTC para LiveKit
 * y sincroniza tokens Push con notification_service (/api/notifications/devices).
 */

import axiosInstance from '@/lib/axios';

export type MobilePlatform = 'ios' | 'android' | 'web';

export interface DeviceTokenPayload {
  userId: number;
  deviceToken: string;
  platform: 'ios' | 'android';
  appVersion?: string;
}

export interface MediaPermissionsResult {
  camera: boolean;
  microphone: boolean;
  error?: string;
}

export interface DeepLinkParseResult {
  route: string;
  params: Record<string, string>;
}

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
    webkit?: {
      messageHandlers?: Record<string, { postMessage: (msg: any) => void }>;
    };
  }
}

export const nativeBridge = {
  /**
   * Detecta si la aplicación se está ejecutando dentro de un contenedor móvil nativo
   */
  isNativeApp(): boolean {
    if (typeof window === 'undefined') return false;

    // Capacitor native flag
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
      return window.Capacitor.isNativePlatform();
    }

    // iOS WKWebView messageHandlers
    if (window.webkit && window.webkit.messageHandlers) {
      return true;
    }

    // User Agent check for custom app wrapper
    const ua = navigator.userAgent || '';
    return /quhealthy-(ios|android)/i.test(ua);
  },

  /**
   * Identifica la plataforma de ejecución
   */
  getPlatform(): MobilePlatform {
    if (typeof window === 'undefined') return 'web';

    if (window.Capacitor?.getPlatform) {
      const capPlatform = window.Capacitor.getPlatform().toLowerCase();
      if (capPlatform === 'ios') return 'ios';
      if (capPlatform === 'android') return 'android';
    }

    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod|quhealthy-ios/i.test(ua)) return 'ios';
    if (/Android|quhealthy-android/i.test(ua)) return 'android';

    return 'web';
  },

  /**
   * Solicita y valida permisos de cámara y micrófono para teleconsulta LiveKit (WebRTC)
   */
  async requestMediaPermissions(): Promise<MediaPermissionsResult> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return {
        camera: false,
        microphone: false,
        error: 'Media devices API no está disponible en este dispositivo.',
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Detener los tracks inmediatamente tras confirmar acceso
      stream.getTracks().forEach((track) => track.stop());

      return {
        camera: true,
        microphone: true,
      };
    } catch (err: any) {
      return {
        camera: false,
        microphone: false,
        error: err.message || 'Permisos de medios denegados por el usuario o política de seguridad.',
      };
    }
  },

  /**
   * Sincroniza el token Push del dispositivo con notification_service
   */
  async registerPushDevice(payload: DeviceTokenPayload): Promise<boolean> {
    try {
      await axiosInstance.post('/api/notifications/devices', payload);
      return true;
    } catch (err) {
      console.error('Error al registrar token de dispositivo nativo:', err);
      return false;
    }
  },

  /**
   * Parsea Deep Links de esquemas nativos (quhealthy://) o Universal Links (https://www.quhealthy.org)
   */
  parseDeepLink(rawUrl: string): DeepLinkParseResult | null {
    if (!rawUrl) return null;

    try {
      // Normalizar esquema personalizado
      let normalized = rawUrl;
      if (rawUrl.startsWith('quhealthy://')) {
        normalized = rawUrl.replace('quhealthy://', 'https://www.quhealthy.org/');
      }

      const parsed = new URL(normalized);
      const params: Record<string, string> = {};
      parsed.searchParams.forEach((val, key) => {
        params[key] = val;
      });

      return {
        route: parsed.pathname,
        params,
      };
    } catch {
      return null;
    }
  },
};
