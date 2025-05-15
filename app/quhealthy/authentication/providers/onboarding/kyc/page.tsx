"use client";

import React, { useState, useEffect, useCallback, JSX, ReactNode } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight, UserCheck, Clock, LayoutDashboard } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// --- Tipos y Enums ---

// CORREGIDO: Definir KYCStatus como un enum real
enum KYCStatus {
  NOT_STARTED = "not_started",
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  VERIFIED = "verified", // Usaremos este como el estado "aprobado/completo"
  REJECTED = "rejected",
  EXPIRED = "expired",
  ABANDONED = "abandoned",
  ERROR = "error",
  // 'approved' se puede mapear a 'verified' si es necesario, o añadir aquí si Didit lo devuelve
  // 'in_review' se mapea a 'pending' o 'in_progress' según prefieras
}

// Tipo para los valores del enum (útil para tipar el estado)
type KycStatusValue = `${KYCStatus}`;

// Interfaces de la respuesta del API (sin cambios, usan KycStatusValue)
type LicenseStatusValue = 'pending' | 'verified' | 'rejected';
type PlanLimit = number | "Ilimitados";
interface KycStatusInfo { status: KycStatusValue; isComplete: boolean; }
interface LicenseStatusInfo { isRequired: boolean; status: LicenseStatusValue; isComplete: boolean; }
interface MarketplaceStatusInfo { isConfigured: boolean; }
interface BlocksStatusInfo { isConfigured: boolean; }
interface OnboardingStatusDetail { kyc: KycStatusInfo; license: LicenseStatusInfo; marketplace: MarketplaceStatusInfo; blocks: BlocksStatusInfo; }
interface PlanPermissionsInfo { quMarketAccess: boolean; quBlocksAccess: boolean; marketingLevel: number; supportLevel: number; advancedReports: boolean; userManagement: number; allowAdvancePayments: boolean; maxAppointments: PlanLimit; maxProducts: PlanLimit; maxCourses: PlanLimit; }
interface PlanDetailsInfo { planId: number | null; planName: string; hasActivePlan: boolean; endDate: string | null; permissions: PlanPermissionsInfo; }
interface ProviderDetailsInfo { parentCategoryId: number | null; email: string; name: string; }
interface OnboardingStatusResponse { onboardingStatus: OnboardingStatusDetail; planDetails: PlanDetailsInfo; providerDetails: ProviderDetailsInfo; }

// Enum para estados internos del componente
enum ActionStatus {
  IDLE = "idle",
  LOADING_STATUS = "loading_status",
  CREATING_SESSION = "creating_session",
  REDIRECTING = "redirecting",
  ERROR = "error"
}

interface APIErrorResponse { message: string; }

// --- Animación ---
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// --- Componente Principal (Corregido) ---
export default function KYCVerification(): JSX.Element {
  const [actionStatus, setActionStatus] = useState<ActionStatus>(ActionStatus.LOADING_STATUS);
  // Tipar el estado con el tipo de unión de strings derivado del enum
  const [kycSystemStatus, setKycSystemStatus] = useState<KycStatusValue>(KYCStatus.NOT_STARTED);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // --- Funciones Auxiliares ---
  const formatDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    try {
        return new Date(dateString).toLocaleString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
  };

  const stopPolling = useCallback(() => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
      console.log("Polling detenido.");
    }
  }, [pollingIntervalId]);

  const handleApiError = useCallback((error: unknown, context: string = "Operación") => {
    stopPolling();
    setActionStatus(ActionStatus.ERROR);
    const axiosError = error as AxiosError<APIErrorResponse>;
    const message = axiosError.response?.data?.message || axiosError.message || `${context} fallida. Intenta de nuevo.`;
    console.error(`Error en ${context}:`, error);
    setError(message);
  }, [stopPolling]); // Incluir stopPolling como dependencia

  // --- Lógica Principal ---
  const checkKYCStatus = useCallback(async (isInitialCheck = false) => {
    if (!isInitialCheck && actionStatus === ActionStatus.LOADING_STATUS) return;

    console.log(isInitialCheck ? "Verificando estado inicial KYC..." : "Verificando estado KYC (Polling)...");
    if (!isInitialCheck || actionStatus !== ActionStatus.IDLE) {
        setActionStatus(ActionStatus.LOADING_STATUS);
    }
    // No limpiamos error aquí, para que persista si hubo uno en la llamada anterior
    // setError(null);

    try {
      const { data } = await axios.get<OnboardingStatusResponse>(
        `${API_BASE_URL}/api/providers/status`,
        { withCredentials: true }
      );

      // Asegurarnos que el status recibido sea uno de los valores válidos del enum/tipo
      const receivedStatus = data.onboardingStatus.kyc.status;
      const currentKycStatus: KycStatusValue = Object.values(KYCStatus).includes(receivedStatus as KYCStatus)
            ? receivedStatus
            : KYCStatus.ERROR; // Si el backend devuelve algo inesperado, marcar como error

      setKycSystemStatus(currentKycStatus);
      setLastUpdate(formatDate(new Date().toISOString()));

      const finalStatuses: KycStatusValue[] = [KYCStatus.VERIFIED, KYCStatus.REJECTED, KYCStatus.ERROR, KYCStatus.EXPIRED, KYCStatus.ABANDONED];

      if (finalStatuses.includes(currentKycStatus)) {
        stopPolling();
        setActionStatus(ActionStatus.IDLE); // Estado final, permitir acción del botón
         if (currentKycStatus === KYCStatus.VERIFIED && !isInitialCheck) {
             toast.success("¡Verificación KYC completada!", { autoClose: 3000 });
         }
      } else {
         // Si no es final, volvemos a IDLE para la siguiente iteración del polling o acción del usuario
         setActionStatus(ActionStatus.IDLE);
      }

    } catch (error) {
      handleApiError(error, "Verificación de estado KYC");
    }
  // Incluir actionStatus en dependencias si queremos evitar llamadas concurrentes estrictamente
  }, [API_BASE_URL, stopPolling, handleApiError, actionStatus]);

  // Efecto para chequeo inicial y manejo de polling
  useEffect(() => {
    let initialCheckTimerId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startPollingIfNeeded = async () => {
        try {
            const { data } = await axios.get<OnboardingStatusResponse>(`${API_BASE_URL}/api/providers/status`, { withCredentials: true });
            const initialStatus = data.onboardingStatus.kyc.status;

            const validInitialStatus: KycStatusValue = Object.values(KYCStatus).includes(initialStatus as KYCStatus)
                ? initialStatus
                : KYCStatus.ERROR;

            setKycSystemStatus(validInitialStatus);
            setLastUpdate(formatDate(new Date().toISOString()));
            setActionStatus(ActionStatus.IDLE);

            const finalStatuses: KycStatusValue[] = [KYCStatus.VERIFIED, KYCStatus.REJECTED, KYCStatus.ERROR, KYCStatus.EXPIRED, KYCStatus.ABANDONED];

            if (!finalStatuses.includes(validInitialStatus)) {
                console.log("Iniciando polling para estado KYC...");
                intervalId = setInterval(() => checkKYCStatus(false), 10000); // Pasar false explícitamente
                setPollingIntervalId(intervalId);
            } else if (validInitialStatus === KYCStatus.VERIFIED){
                 toast.info("Tu identidad ya está verificada.", { autoClose: 2000 });
            }
        } catch (error) {
             handleApiError(error, "Verificación de estado inicial para polling");
        }
    };

    initialCheckTimerId = setTimeout(() => {
        startPollingIfNeeded();
    }, 500);

    return () => {
      if (initialCheckTimerId) clearTimeout(initialCheckTimerId);
      if (intervalId) clearInterval(intervalId);
      // No llamar a stopPolling() aquí directamente para evitar limpiar el ID del estado prematuramente
      // si el componente se desmonta/remonta rápido. La limpieza del estado se hace en stopPolling.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo una vez al montar (las funciones internas usan useCallback)

  // Iniciar sesión de verificación con Didit
  const handleStartVerification = async () => {
    setActionStatus(ActionStatus.CREATING_SESSION);
    setError(null);

    try {
      console.log("🚀 Creando sesión KYC...");
      const { data } = await axios.post<{ verification_url: string }>(
        `${API_BASE_URL}/api/kyc/create-session`,
        {},
        { withCredentials: true }
      );
      console.log("✅ Sesión KYC creada.");

      if (data.verification_url) {
        setActionStatus(ActionStatus.REDIRECTING);
        toast.info("Redirigiendo a la verificación...");
        console.log(" R Redirigiendo a:", data.verification_url);
        sessionStorage.setItem('kycRedirectInitiated', 'true');
        window.location.href = data.verification_url;
      } else {
        throw new Error("No se recibió la URL de verificación desde el backend.");
      }
    } catch (error) {
      handleApiError(error, "Inicio de verificación KYC");
      // Volver a IDLE aquí para permitir reintento si falla la creación de sesión
      setActionStatus(ActionStatus.IDLE);
    }
  };

  // --- Lógica de Renderizado ---
  const getStatusRenderProps = (status: KycStatusValue): { icon: ReactNode; text: string; color: string; bgColor: string, borderColor: string } => {
    const statusConfig = {
      // CORREGIDO: Usar el enum KYCStatus como clave
      [KYCStatus.NOT_STARTED]: { icon: <AlertCircle className="w-5 h-5" />, text: "Verificación Requerida", color: "text-gray-300", bgColor: "bg-gray-700/50", borderColor: "border-gray-600/50" },
      [KYCStatus.PENDING]: { icon: <Clock className="w-5 h-5" />, text: "Pendiente de Revisión", color: "text-yellow-300", bgColor: "bg-yellow-600/10", borderColor: "border-yellow-500/30" },
      [KYCStatus.IN_PROGRESS]: { icon: <Loader2 className="w-5 h-5 animate-spin" />, text: "Verificación en Progreso...", color: "text-blue-300", bgColor: "bg-blue-600/10", borderColor: "border-blue-500/30" },
      [KYCStatus.VERIFIED]: { icon: <CheckCircle2 className="w-5 h-5" />, text: "Identidad Verificada", color: "text-green-400", bgColor: "bg-green-600/10", borderColor: "border-green-500/30" },
      [KYCStatus.REJECTED]: { icon: <XCircle className="w-5 h-5" />, text: "Verificación Rechazada", color: "text-red-400", bgColor: "bg-red-600/10", borderColor: "border-red-500/30" },
      [KYCStatus.ERROR]: { icon: <AlertCircle className="w-5 h-5" />, text: "Error en Verificación", color: "text-red-400", bgColor: "bg-red-600/10", borderColor: "border-red-500/30" },
      [KYCStatus.EXPIRED]: { icon: <Clock className="w-5 h-5" />, text: "Sesión Expirada", color: "text-orange-400", bgColor: "bg-orange-600/10", borderColor: "border-orange-500/30" },
      [KYCStatus.ABANDONED]: { icon: <XCircle className="w-5 h-5" />, text: "Proceso Abandonado", color: "text-orange-400", bgColor: "bg-orange-600/10", borderColor: "border-orange-500/30" },
    };
    // Usar fallback seguro
    return statusConfig[status] ?? statusConfig[KYCStatus.ERROR];
  };

  const renderStatus = () => {
    const statusProps = getStatusRenderProps(kycSystemStatus);
    return (
      <div className={`border ${statusProps.borderColor} ${statusProps.bgColor} p-4 rounded-lg text-center space-y-2 shadow-inner`}>
         <div className={`flex items-center justify-center space-x-2 ${statusProps.color} font-medium text-lg`}>
            {statusProps.icon}
            <span>{statusProps.text}</span>
         </div>
        {lastUpdate && (
          <p className="text-xs text-gray-400">
            (Última comprobación: {lastUpdate})
          </p>
        )}
      </div>
    );
  };

  // Determinar texto y acción del botón principal
  let buttonAction: () => void;
  let buttonText: string;
  let buttonIcon: ReactNode = <ArrowRight className="w-5 h-5 ml-2" />;
  let isActionDisabled: boolean = false;
  const isLoading = actionStatus === ActionStatus.LOADING_STATUS || actionStatus === ActionStatus.CREATING_SESSION || actionStatus === ActionStatus.REDIRECTING;

  // CORREGIDO: Usar el enum KYCStatus en el switch
  switch (kycSystemStatus) {
    case KYCStatus.VERIFIED:
      buttonAction = () => router.push('/quhealthy/profile/providers/dashboard');
      buttonText = "Ir al Panel";
      buttonIcon = <LayoutDashboard className="w-5 h-5 ml-2" />;
      isActionDisabled = isLoading;
      break;
    case KYCStatus.REJECTED:
    case KYCStatus.ERROR:
    case KYCStatus.EXPIRED:
    case KYCStatus.ABANDONED:
      buttonAction = handleStartVerification;
      buttonText = "Reintentar Verificación";
      buttonIcon = <UserCheck className="w-5 h-5 mr-2" />;
      isActionDisabled = isLoading;
      break;
    case KYCStatus.PENDING:
    case KYCStatus.IN_PROGRESS:
       buttonAction = () => {};
       buttonText = "Verificación en Proceso...";
       isActionDisabled = true;
       break;
    case KYCStatus.NOT_STARTED:
    default:
      buttonAction = handleStartVerification;
      buttonText = "Iniciar Verificación de Identidad";
      buttonIcon = <UserCheck className="w-5 h-5 mr-2" />;
      isActionDisabled = isLoading;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse rounded-full" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl animate-pulse delay-1000 rounded-full" />
      </div>

      <motion.div
        {...fadeIn}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl">
          <CardHeader className="text-center space-y-4 pt-8 pb-6">
            <div className="mx-auto bg-purple-500/10 border border-purple-500/20 p-4 rounded-full w-fit shadow-inner">
              <UserCheck className="w-10 h-10 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">Verificación de Identidad (KYC)</h1>
              <p className="text-gray-300 text-sm px-4">
                Para la seguridad de todos y cumplir regulaciones, necesitamos verificar tu identidad. Este proceso es rápido y seguro.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6">
             {actionStatus === ActionStatus.ERROR && error && (
               <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
             )}

            {renderStatus()}

            {/* CORREGIDO: Usar enum KYCStatus */}
            {(kycSystemStatus === KYCStatus.REJECTED || kycSystemStatus === KYCStatus.ERROR) && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4"/>
                  <AlertDescription>
                     {kycSystemStatus === KYCStatus.REJECTED
                        ? "Tu verificación fue rechazada. Por favor, revisa tus documentos e inténtalo de nuevo. Si el problema persiste, contacta a soporte."
                        : "Ocurrió un error durante la verificación. Por favor, inténtalo de nuevo."
                     }
                  </AlertDescription>
              </Alert>
            )}
            {/* CORREGIDO: Usar enum KYCStatus */}
             {kycSystemStatus === KYCStatus.EXPIRED && (
              <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50 text-orange-300 text-sm">
                  <AlertCircle className="h-4 w-4"/>
                  <AlertDescription>
                     La sesión anterior expiró. Por favor, inicia el proceso de nuevo.
                  </AlertDescription>
              </Alert>
            )}
            {/* CORREGIDO: Usar enum KYCStatus */}
             {kycSystemStatus === KYCStatus.ABANDONED && (
              <Alert variant="destructive" className="bg-orange-500/10 border-orange-500/50 text-orange-300 text-sm">
                   <AlertCircle className="h-4 w-4"/>
                  <AlertDescription>
                     Parece que el proceso anterior no se completó. Puedes iniciarlo de nuevo cuando estés listo.
                  </AlertDescription>
              </Alert>
            )}

             <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside pl-2">
                <li>Necesitarás una identificación oficial vigente (INE/Pasaporte).</li>
                <li>Asegúrate de estar en un lugar bien iluminado.</li>
                <li>El proceso toma aproximadamente 5 minutos.</li>
            </ul>

          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              onClick={buttonAction}
              disabled={isActionDisabled}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base shadow-md disabled:opacity-60 transition-opacity duration-200 flex items-center justify-center gap-2"
            >
              {isLoading && ( <Loader2 className="w-5 h-5 animate-spin" /> )}
              {isLoading && actionStatus === ActionStatus.CREATING_SESSION ? "Iniciando..." :
               isLoading && actionStatus === ActionStatus.REDIRECTING ? "Redirigiendo..." :
               isLoading && actionStatus === ActionStatus.LOADING_STATUS ? "Consultando..." :
               buttonText}
              {!isLoading && buttonIcon}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}