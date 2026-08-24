/**
 * QuHealthy Telemetry & Analytics Client
 * Ingestión no-bloqueante de sesiones, heartbeats y uso de módulos
 */

import axiosInstance from '@/lib/axios';

const TELEMETRY_ENDPOINT = '/api/intelligence/telemetry';

export interface TelemetryEvent {
  sessionId: string;
  userId?: number;
  userRole?: string;
  moduleCode: string;
  actionType: string;
  targetResource?: string;
  durationMs?: number;
  deviceType?: string;
  browser?: string;
  os?: string;
  referrer?: string;
}

class TelemetryClient {
  private sessionId: string = '';
  private currentUserId?: number;
  private currentRole?: string;
  private currentModule: string = 'DASHBOARD';
  private sessionStartTime: number = Date.now();
  private lastActivityTime: number = Date.now();
  private eventBuffer: TelemetryEvent[] = [];
  private flushTimer: any = null;
  private heartbeatTimer: any = null;
  private isInitialized: boolean = false;

  public init(userId?: number, role?: string) {
    if (typeof window === 'undefined') return;

    this.currentUserId = userId;
    this.currentRole = role;

    // Recuperar o generar Session ID
    let sid = sessionStorage.getItem('quhealthy_sid');
    if (!sid) {
      sid = 'qs_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      sessionStorage.setItem('quhealthy_sid', sid);
    }
    this.sessionId = sid;

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.sessionStartTime = Date.now();
      this.lastActivityTime = Date.now();

      // Listeners de actividad del usuario
      window.addEventListener('mousemove', this.markActive, { passive: true });
      window.addEventListener('keydown', this.markActive, { passive: true });
      window.addEventListener('click', this.markActive, { passive: true });

      // Iniciar heartbeat cada 60 segundos
      this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), 60000);

      // Iniciar flush de eventos cada 15 segundos
      this.flushTimer = setInterval(() => this.flushEvents(), 15000);

      // Enviar primer heartbeat inmediatamente
      this.sendHeartbeat();
    }
  }

  private markActive = () => {
    this.lastActivityTime = Date.now();
  };

  public setModule(moduleCode: string) {
    this.currentModule = moduleCode.toUpperCase();
    this.trackEvent(this.currentModule, 'VIEW', window.location.pathname);
  }

  public trackAction(moduleCode: string, actionType: string, targetResource?: string) {
    this.trackEvent(moduleCode.toUpperCase(), actionType.toUpperCase(), targetResource);
  }

  private trackEvent(moduleCode: string, actionType: string, targetResource?: string, durationMs?: number) {
    if (typeof window === 'undefined' || !this.sessionId) return;

    const deviceType = window.innerWidth <= 768 ? 'MOBILE' : window.innerWidth <= 1024 ? 'TABLET' : 'DESKTOP';

    const event: TelemetryEvent = {
      sessionId: this.sessionId,
      userId: this.currentUserId,
      userRole: this.currentRole || 'ANONYMOUS',
      moduleCode,
      actionType,
      targetResource: targetResource || window.location.pathname,
      durationMs,
      deviceType,
      browser: navigator.userAgent.substring(0, 50),
      referrer: document.referrer || undefined,
    };

    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= 10) {
      this.flushEvents();
    }
  }

  public async sendHeartbeat() {
    if (typeof window === 'undefined' || !this.sessionId) return;

    const activeSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const deviceType = window.innerWidth <= 768 ? 'MOBILE' : window.innerWidth <= 1024 ? 'TABLET' : 'DESKTOP';

    try {
      await axiosInstance.post(
        `${TELEMETRY_ENDPOINT}/heartbeat`,
        {
          sessionId: this.sessionId,
          userId: this.currentUserId,
          userRole: this.currentRole || 'ANONYMOUS',
          currentModule: this.currentModule,
          activeSeconds,
          deviceType,
          browser: navigator.userAgent.substring(0, 50),
          os: navigator.platform,
          referrer: document.referrer || undefined,
        },
        { timeout: 5000 }
      );
    } catch {
      // Falla silenciosa para no degradar experiencia de usuario
    }
  }

  public async flushEvents() {
    if (this.eventBuffer.length === 0) return;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await axiosInstance.post(`${TELEMETRY_ENDPOINT}/events`, eventsToSend, {
        timeout: 5000,
      });
    } catch {
      // Reintentar en siguiente ciclo si falló
      this.eventBuffer.unshift(...eventsToSend);
    }
  }

  public destroy() {
    if (typeof window === 'undefined') return;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushEvents();
  }
}

export const telemetry = new TelemetryClient();
