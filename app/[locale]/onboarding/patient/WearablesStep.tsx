"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-initialize-state */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Watch, Apple, Smartphone, Link as LinkIcon, Loader2, Check } from "lucide-react";
import { wearableService, WearableConnection } from "@/services/wearable.service";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// SVG Icons para marcas que no están en Lucide
const GoogleFitIcon = () => (
 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M11.996 9.484L8.746 6.234C7.575 5.063 5.676 5.063 4.505 6.234C3.334 7.405 3.334 9.304 4.505 10.475L11.996 17.966L15.246 14.716L11.996 11.466V9.484Z" fill="#EA4335"/>
 <path d="M11.996 17.966L19.487 10.475C20.658 9.304 20.658 7.405 19.487 6.234C18.316 5.063 16.417 5.063 15.246 6.234L11.996 9.484V11.466L15.246 14.716L11.996 17.966Z" fill="#34A853"/>
 <path d="M15.246 14.716L19.487 18.957C20.658 20.128 20.658 22.027 19.487 23.198C18.316 24.369 16.417 24.369 15.246 23.198L10.513 18.465L15.246 14.716Z" fill="#FBBC05"/>
 <path d="M10.513 18.465L4.505 12.457C3.334 11.286 3.334 9.387 4.505 8.216C5.676 7.045 7.575 7.045 8.746 8.216L15.246 14.716L10.513 18.465Z" fill="#4285F4"/>
 </svg>
);

const GarminIcon = () => (
 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
 <path d="M12 0L2.5 10l9.5 14L21.5 10 12 0zm0 18.5L5.5 10 12 3.5 18.5 10 12 18.5z"/>
 </svg>
);

const OuraIcon = () => (
 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
 <circle cx="12" cy="12" r="10" />
 <circle cx="12" cy="12" r="6" />
 </svg>
);

const FitbitIcon = () => (
 <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
 <path d="M21.7 10.3c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3zm-5.7-1.1c1.1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2zm-5.4 6c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0-11c.9 0 1.6.7 1.6 1.6s-.7 1.6-1.6 1.6-1.6-.7-1.6-1.6.7-1.6 1.6-1.6zm0 5.4c1 0 1.9.8 1.9 1.9s-.8 1.9-1.9 1.9-1.9-.8-1.9-1.9.8-1.9 1.9-1.9zm-5.4 1.1c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4.6-1.4 1.4-1.4z"/>
 </svg>
);

export const WearablesStep = () => {
 const [connections, setConnections] = useState<WearableConnection[]>([]);
 const [loading, setLoading] = useState(true);
 const [processingAuth, setProcessingAuth] = useState(false);

 const WEARABLES = [
 { id: "google_fit", name: "Google Fit", icon: GoogleFitIcon, desc: "Sincroniza pasos, sueño y ritmo cardíaco", color: "bg-white dark:bg-white", textColor: "text-black", border: "border-gray-200 dark:border-gray-200" },
 { id: "apple_health", name: "Apple Health", icon: Apple, desc: "Disponible exclusivamente en iOS", color: "bg-black dark:bg-black", textColor: "text-white dark:text-white", border: "border-black dark:border-black", mobileOnly: true },
 { id: "garmin", name: "Garmin Connect", icon: GarminIcon, desc: "Sincroniza actividades deportivas y métricas", color: "bg-black dark:bg-black", textColor: "text-white", border: "border-black dark:border-gray-800" },
 { id: "fitbit", name: "Fitbit", icon: FitbitIcon, desc: "Actividad diaria, sueño y estrés", color: "bg-[#00B0B9]", textColor: "text-white", border: "border-[#00B0B9]" },
 { id: "oura", name: "Oura Ring", icon: OuraIcon, desc: "Datos avanzados de recuperación biométrica", color: "bg-gray-900 dark:bg-gray-900", textColor: "text-white", border: "border-gray-900" },
 ];

 useEffect(() => {
 // 1. Revisar si venimos de un Callback OAuth
 const urlParams = new URLSearchParams(window.location.search);
 const code = urlParams.get("code");
 const stateParam = urlParams.get("state");
 
 // El state parameter contiene: "providerId_randomToken" (ej: "google_fit_a1b2c3")
 const provider = stateParam ? stateParam.split('_')[0] + '_' + stateParam.split('_')[1] : "google_fit";

 if (code && !processingAuth) {
 // Verificación de Seguridad CSRF (State Parameter)
 const savedState = sessionStorage.getItem("oauth_state");
 if (savedState && savedState !== stateParam) {
 console.error("CSRF Validation failed. State mismatch.", { expected: savedState, got: stateParam });
 toast.error("Error de seguridad: La sesión de validación no coincide (Posible CSRF).");
 // Limpiar URL por seguridad
 window.history.replaceState({}, document.title, window.location.pathname);
 sessionStorage.removeItem("oauth_state");
 return;
 }
 
 sessionStorage.removeItem("oauth_state");
 setProcessingAuth(true);
 wearableService.handleCallback(provider, code)
 .then(() => {
 toast.success(`Dispositivo conectado: ${provider}`);
 // Limpiar URL
 window.history.replaceState({}, document.title, window.location.pathname);
 loadConnections();
 })
 .catch((err) => {
 console.error("Error oauth", err);
 toast.error("Error al establecer conexión con el dispositivo.");
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
 toast.info("Apple Health requiere sincronización nativa desde un dispositivo iOS.");
 return;
 }

 if (providerId === "google_fit") {
 const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
 if (!clientId) {
 toast.error("Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID en el entorno.");
 return;
 }
 
 const redirectUri = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
 const scope = encodeURIComponent("https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.blood_pressure.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read");
 
 // 🛡️ Generar Estado Seguro Aleatorio contra CSRF
 const csrfToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
 const state = `google_fit_${csrfToken}`;
 sessionStorage.setItem("oauth_state", state);

 const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
 
 window.location.href = url;
 return;
 }

 toast.info(`La integración técnica con ${providerId} estará disponible en la próxima actualización.`);
 };

 const handleDisconnect = async (providerId: string) => {
 try {
 await wearableService.disconnectProvider(providerId);
 toast.success("Enlace revocado exitosamente.");
 loadConnections();
 } catch (error) {
 toast.error("Error al revocar permisos.");
 }
 };

 return (
 <div className="space-y-8">
 {/* Header Editorial */}
 <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
 <h3 className="text-2xl font-semibold text-black dark:text-white tracking-tight">Ecosistema Biométrico</h3>
 <p className="text-gray-500 font-light mt-2 max-w-2xl text-sm leading-relaxed">
 Vincula sensores y dispositivos portátiles para inyectar telemetría en tiempo real a tu expediente médico central.
 </p>
 </div>

 {processingAuth && (
 <div className="border border-blue-500 bg-blue-50 dark:bg-blue-900/10 p-4 flex items-center justify-center gap-3">
 <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Autenticando protocolo seguro...</span>
 </div>
 )}

 {loading && !processingAuth ? (
 <div className="flex justify-center py-12">
 <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {WEARABLES.map((wearable) => {
 const connected = isConnected(wearable.id);
 
 return (
 <div 
 key={wearable.id}
 className={cn(
 "p-6 border transition-colors relative flex flex-col justify-between group",
 connected 
 ? "border-black dark:border-white bg-gray-50 dark:bg-[#050505]" 
 : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white"
 )}
 >
 <div>
 <div className="flex items-start justify-between mb-6">
 <div className={cn("w-12 h-12 flex items-center justify-center border", wearable.color, wearable.border)}>
 <wearable.icon className={cn("w-6 h-6", wearable.textColor)} />
 </div>
 
 {connected && (
 <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
 <Check className="w-3 h-3" strokeWidth={2} /> Enlazado
 </span>
 )}
 {wearable.mobileOnly && !connected && (
 <span className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
 <Smartphone className="w-3 h-3" strokeWidth={1.5} /> App iOS Requerida
 </span>
 )}
 </div>
 
 <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
 {wearable.name}
 </h4>
 <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
 {wearable.desc}
 </p>
 </div>

 <div>
 {connected ? (
 <button 
 onClick={() => handleDisconnect(wearable.id)}
 className="w-full h-12 border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
 >
 Revocar Acceso
 </button>
 ) : (
 <button 
 onClick={() => handleConnect(wearable.id)}
 className="w-full h-12 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
 >
 <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.5} /> Sincronizar Protocolo
 </button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 
 {/* Privacy Notice (Architectural Note) */}
 <div className="border-l-2 border-black dark:border-white pl-5 py-2 bg-gray-50 dark:bg-[#050505]">
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-2">
 <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> Cifrado Biométrico E2E
 </p>
 <p className="text-xs text-gray-500 font-light leading-relaxed">
 La telemetría de tus dispositivos es cifrada de extremo a extremo. QuHealthy interactúa exclusivamente con los nodos autorizados para nutrir el modelo algorítmico consentido en tu perfil clínico inicial.
 </p>
 </div>

 </div>
 );
};