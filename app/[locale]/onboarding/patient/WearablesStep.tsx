import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Watch, Apple, Activity, Smartphone, Link as LinkIcon, Loader2 } from "lucide-react";
import { wearableService, WearableConnection } from "@/services/wearable.service";
import { toast } from "react-toastify";

// SVG Icons para marcas que no están en Lucide
const GoogleFitIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.996 9.484L8.746 6.234C7.575 5.063 5.676 5.063 4.505 6.234C3.334 7.405 3.334 9.304 4.505 10.475L11.996 17.966L15.246 14.716L11.996 11.466V9.484Z" fill="#EA4335"/>
    <path d="M11.996 17.966L19.487 10.475C20.658 9.304 20.658 7.405 19.487 6.234C18.316 5.063 16.417 5.063 15.246 6.234L11.996 9.484V11.466L15.246 14.716L11.996 17.966Z" fill="#34A853"/>
    <path d="M15.246 14.716L19.487 18.957C20.658 20.128 20.658 22.027 19.487 23.198C18.316 24.369 16.417 24.369 15.246 23.198L10.513 18.465L15.246 14.716Z" fill="#FBBC05"/>
    <path d="M10.513 18.465L4.505 12.457C3.334 11.286 3.334 9.387 4.505 8.216C5.676 7.045 7.575 7.045 8.746 8.216L15.246 14.716L10.513 18.465Z" fill="#4285F4"/>
  </svg>
);

const GarminIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L2.5 10l9.5 14L21.5 10 12 0zm0 18.5L5.5 10 12 3.5 18.5 10 12 18.5z"/>
  </svg>
);

const OuraIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const FitbitIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.7 10.3c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3zm-5.7-1.1c1.1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2zm-5.4 6c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0-11c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0 5.4c1 0 1.9.8 1.9 1.9s-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9.8-1.9 1.9-1.9zm-5.4 1.1c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4.6-1.4 1.4-1.4z"/>
  </svg>
);

export const WearablesStep = () => {
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);

  const WEARABLES = [
    { id: "google_fit", name: "Google Fit", icon: GoogleFitIcon, desc: "Sincroniza pasos, sueño y ritmo cardíaco", color: "bg-white", textColor: "text-slate-900", border: "border-slate-200" },
    { id: "apple_health", name: "Apple Health", icon: Apple, desc: "Disponible en la App de iOS", color: "bg-black", textColor: "text-white", border: "border-black", mobileOnly: true },
    { id: "garmin", name: "Garmin Connect", icon: GarminIcon, desc: "Sincroniza actividades deportivas y vitales", color: "bg-[#000000]", textColor: "text-white", border: "border-gray-800" },
    { id: "fitbit", name: "Fitbit", icon: FitbitIcon, desc: "Actividad diaria, sueño y estrés", color: "bg-[#00B0B9]", textColor: "text-white", border: "border-[#00B0B9]" },
    { id: "oura", name: "Oura Ring", icon: OuraIcon, desc: "Datos avanzados de sueño y recuperación", color: "bg-slate-900", textColor: "text-white", border: "border-slate-800" },
  ];

  useEffect(() => {
    // 1. Revisar si venimos de un Callback OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const provider = urlParams.get("state") || "google_fit"; // Temporal: asumimos google si no hay state

    if (code && !processingAuth) {
      setProcessingAuth(true);
      wearableService.handleCallback(provider, code)
        .then(() => {
          toast.success(`¡${provider} conectado exitosamente!`);
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.pathname);
          loadConnections();
        })
        .catch((err) => {
          console.error("Error oauth", err);
          toast.error("Error al conectar el dispositivo.");
        })
        .finally(() => setProcessingAuth(false));
    } else {
      loadConnections();
    }
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await wearableService.getConnections();
      setConnections(data);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = (providerId: string) => {
    return connections.some(c => c.provider === providerId && c.status === "CONNECTED");
  };

  const handleConnect = (providerId: string) => {
    if (providerId === "apple_health") {
      toast.info("Apple Health solo puede conectarse desde la aplicación de iOS (iPhone).");
      return;
    }

    if (providerId === "google_fit") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID;
      if (!clientId) {
        toast.error("Falta configurar NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID en el entorno.");
        return;
      }
      
      const redirectUri = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
      const scope = encodeURIComponent("https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.blood_pressure.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read");
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=google_fit`;
      
      window.location.href = url;
      return;
    }

    toast.info(`La integración de ${providerId} estará disponible próximamente.`);
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await wearableService.disconnectProvider(providerId);
      toast.success("Dispositivo desconectado");
      loadConnections();
    } catch (error) {
      toast.error("No se pudo desconectar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <Watch className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Conecta tus Dispositivos</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2">
          Sincroniza tus relojes y pulseras inteligentes para alimentar tu expediente con datos en tiempo real.
        </p>
      </div>

      {processingAuth && (
        <div className="p-4 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium">Completando conexión segura...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WEARABLES.map((wearable) => {
          const connected = isConnected(wearable.id);
          
          return (
            <div 
              key={wearable.id}
              className={`p-5 rounded-2xl border ${connected ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} transition-all hover:shadow-md relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wearable.color} ${wearable.border} border shadow-sm`}>
                  <wearable.icon className={`w-7 h-7 ${wearable.textColor}`} />
                </div>
                {connected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                  </span>
                )}
                {wearable.mobileOnly && !connected && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    <Smartphone className="w-3.5 h-3.5" /> App iOS
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <h4 className="font-bold text-slate-900 dark:text-white">{wearable.name}</h4>
                <p className="text-sm text-slate-500 mt-1">{wearable.desc}</p>
              </div>

              <div className="mt-5">
                {connected ? (
                  <button 
                    onClick={() => handleDisconnect(wearable.id)}
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 text-sm transition"
                  >
                    Desconectar
                  </button>
                ) : (
                  <button 
                    onClick={() => handleConnect(wearable.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 text-sm flex items-center justify-center gap-2 transition"
                  >
                    <LinkIcon className="w-4 h-4" /> Vincular
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-200 dark:border-amber-800 flex gap-3 text-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>Tus datos son cifrados de extremo a extremo. QuHealthy solo accederá a las métricas estrictamente necesarias para el análisis algorítmico consentido en el paso 1.</p>
      </div>
    </div>
  );
};
