"use client";

import React, { useState, useEffect, useCallback, JSX, ReactNode } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  UserCheck, 
  Clock, 
  LayoutDashboard,
  FileText,
  Camera,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// --- Tipos y Enums ---

enum KYCStatus {
  NOT_STARTED = "not_started",
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  VERIFIED = "verified",
  REJECTED = "rejected",
  EXPIRED = "expired",
  ABANDONED = "abandoned",
  ERROR = "error",
}

type KycStatusValue = `${KYCStatus}`;

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

enum ActionStatus {
  IDLE = "idle",
  LOADING_STATUS = "loading_status",
  CREATING_SESSION = "creating_session",
  REDIRECTING = "redirecting",
  ERROR = "error"
}

interface APIErrorResponse { message: string; }

// --- Animaciones Mejoradas ---
const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

const cardVariants = {
  initial: { y: 50, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: { 
      delay: 0.2,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const statusVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      delay: 0.4,
      duration: 0.4,
      ease: "backOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// --- Componente de Progress Steps ---
const ProgressSteps = ({ currentStatus }: { currentStatus: KycStatusValue }) => {
  const steps = [
    { key: KYCStatus.NOT_STARTED, label: "Iniciar", icon: <UserCheck className="w-4 h-4" /> },
    { key: KYCStatus.IN_PROGRESS, label: "Verificando", icon: <Camera className="w-4 h-4" /> },
    { key: KYCStatus.PENDING, label: "Revisión", icon: <FileText className="w-4 h-4" /> },
    { key: KYCStatus.VERIFIED, label: "Completo", icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const getCurrentStepIndex = () => {
    switch (currentStatus) {
      case KYCStatus.NOT_STARTED: return 0;
      case KYCStatus.IN_PROGRESS: return 1;
      case KYCStatus.PENDING: return 2;
      case KYCStatus.VERIFIED: return 3;
      case KYCStatus.REJECTED:
      case KYCStatus.ERROR:
      case KYCStatus.EXPIRED:
      case KYCStatus.ABANDONED: return -1; // Error states
      default: return 0;
    }
  };

  const currentStep = getCurrentStepIndex();

  if (currentStep === -1) return null; // Don't show progress for error states

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center space-y-2">
            <motion.div
              className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center relative
                ${index <= currentStep 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white shadow-lg' 
                  : 'bg-gray-700/50 border-gray-600 text-gray-400'
                }
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              {index < currentStep ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                step.icon
              )}
              {index === currentStep && currentStatus === KYCStatus.IN_PROGRESS && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
            <motion.span 
              className={`text-xs font-medium ${
                index <= currentStep ? 'text-purple-300' : 'text-gray-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.7 }}
            >
              {step.label}
            </motion.span>
          </div>
          {index < steps.length - 1 && (
            <motion.div
              className={`flex-1 h-0.5 mx-2 ${
                index < currentStep 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gray-600'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1 + 0.8, duration: 0.3 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Componente de Features ---
const FeatureList = () => {
  const features = [
    { icon: <Shield className="w-4 h-4" />, text: "Verificación segura y encriptada", color: "text-green-400" },
    { icon: <Zap className="w-4 h-4" />, text: "Proceso rápido (5 minutos)", color: "text-purple-400" },
    { icon: <FileText className="w-4 h-4" />, text: "Documentos aceptados: INE/Pasaporte", color: "text-pink-400" }
  ];

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className="flex items-center space-x-3 text-sm text-gray-300 bg-gray-700/50 rounded-lg p-3 border border-gray-600/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 + index * 0.1 }}
        >
          <div className={`${feature.color}`}>
            {feature.icon}
          </div>
          <span>{feature.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

// --- Componente Principal Mejorado ---
export default function KYCVerification(): JSX.Element {
  const [actionStatus, setActionStatus] = useState<ActionStatus>(ActionStatus.LOADING_STATUS);
  const [kycSystemStatus, setKycSystemStatus] = useState<KycStatusValue>(KYCStatus.NOT_STARTED);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();


  // --- Funciones Auxiliares ---
  const formatDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    try {
        return new Date(dateString).toLocaleString('es-MX', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
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
    toast.error(message, { autoClose: 5000 });
  }, [stopPolling]);

  // --- Lógica Principal ---
  const checkKYCStatus = useCallback(async (isInitialCheck = false) => {
    if (!isInitialCheck && actionStatus === ActionStatus.LOADING_STATUS) return;

    console.log(isInitialCheck ? "Verificando estado inicial KYC..." : "Verificando estado KYC (Polling)...");
    if (!isInitialCheck || actionStatus !== ActionStatus.IDLE) {
        setActionStatus(ActionStatus.LOADING_STATUS);
    }

    try {
      const { data } = await axios.get<OnboardingStatusResponse>(
        `/api/auth/status`,
        { withCredentials: true }
      );

      const receivedStatus = data.onboardingStatus.kyc.status;
      const currentKycStatus: KycStatusValue = Object.values(KYCStatus).includes(receivedStatus as KYCStatus)
            ? receivedStatus
            : KYCStatus.ERROR;

      setKycSystemStatus(currentKycStatus);
      setLastUpdate(formatDate(new Date().toISOString()));
      setError(null); // Clear previous errors on successful status check

      const finalStatuses: KycStatusValue[] = [KYCStatus.VERIFIED, KYCStatus.REJECTED, KYCStatus.ERROR, KYCStatus.EXPIRED, KYCStatus.ABANDONED];

      if (finalStatuses.includes(currentKycStatus)) {
        stopPolling();
        setActionStatus(ActionStatus.IDLE);
         if (currentKycStatus === KYCStatus.VERIFIED && !isInitialCheck) {
             toast.success("¡Verificación KYC completada exitosamente!", { autoClose: 4000 });
         }
      } else {
         setActionStatus(ActionStatus.IDLE);
      }

    } catch (error) {
      handleApiError(error, "Verificación de estado KYC");
    }
  }, [ stopPolling, handleApiError, actionStatus]);

  // Efecto para chequeo inicial y manejo de polling
  useEffect(() => {
    let initialCheckTimerId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startPollingIfNeeded = async () => {
        try {
            const { data } = await axios.get<OnboardingStatusResponse>(`/api/auth/status`, { withCredentials: true });
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
                intervalId = setInterval(() => checkKYCStatus(false), 10000);
                setPollingIntervalId(intervalId);
            } else if (validInitialStatus === KYCStatus.VERIFIED){
                 toast.success("Tu identidad ya está verificada", { autoClose: 3000 });
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
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Iniciar sesión de verificación con Didit
  const handleStartVerification = async () => {
    setActionStatus(ActionStatus.CREATING_SESSION);
    setError(null);
    setIsRetrying(false);

    try {
      console.log("🚀 Creando sesión KYC...");
      const { data } = await axios.post<{ verification_url: string }>(
        `/api/kyc/create-session`,
        {},
        { withCredentials: true }
      );
      console.log("✅ Sesión KYC creada.");

      if (data.verification_url) {
        setActionStatus(ActionStatus.REDIRECTING);
        toast.info("Redirigiendo a la verificación...", { autoClose: 2000 });
        console.log("🔄 Redirigiendo a:", data.verification_url);
        sessionStorage.setItem('kycRedirectInitiated', 'true');
        window.location.href = data.verification_url;
      } else {
        throw new Error("No se recibió la URL de verificación desde el backend.");
      }
    } catch (error) {
      handleApiError(error, "Inicio de verificación KYC");
      setActionStatus(ActionStatus.IDLE);
      setIsRetrying(true);
    }
  };

  // Retry functionality
  const handleRetry = () => {
    setIsRetrying(false);
    setError(null);
    checkKYCStatus(true);
  };

  // --- Lógica de Renderizado ---
  const getStatusRenderProps = (status: KycStatusValue): { 
    icon: ReactNode; 
    text: string; 
    color: string; 
    bgColor: string; 
    borderColor: string;
    gradient: string;
    description: string;
  } => {
    const statusConfig = {
      [KYCStatus.NOT_STARTED]: { 
        icon: <UserCheck className="w-6 h-6" />, 
        text: "Verificación Requerida", 
        color: "text-gray-300", 
        bgColor: "bg-gray-700/30", 
        borderColor: "border-gray-600/40",
        gradient: "from-gray-600/20 to-gray-700/20",
        description: "Necesitamos verificar tu identidad para continuar"
      },
      [KYCStatus.PENDING]: { 
        icon: <Clock className="w-6 h-6" />, 
        text: "Revisión en Proceso", 
        color: "text-purple-300", 
        bgColor: "bg-purple-500/10", 
        borderColor: "border-purple-400/30",
        gradient: "from-purple-500/10 to-pink-500/10",
        description: "Nuestro equipo está revisando tu documentación"
      },
      [KYCStatus.IN_PROGRESS]: { 
        icon: <Loader2 className="w-6 h-6 animate-spin" />, 
        text: "Verificación Activa", 
        color: "text-purple-300", 
        bgColor: "bg-purple-500/10", 
        borderColor: "border-purple-400/30",
        gradient: "from-purple-500/10 to-pink-500/10",
        description: "Tu sesión de verificación está en curso"
      },
      [KYCStatus.VERIFIED]: { 
        icon: <CheckCircle2 className="w-6 h-6" />, 
        text: "Identidad Verificada", 
        color: "text-green-400", 
        bgColor: "bg-green-500/10", 
        borderColor: "border-green-400/30",
        gradient: "from-green-500/10 to-emerald-500/10",
        description: "Tu identidad ha sido verificada exitosamente"
      },
      [KYCStatus.REJECTED]: { 
        icon: <XCircle className="w-6 h-6" />, 
        text: "Verificación Rechazada", 
        color: "text-red-400", 
        bgColor: "bg-red-500/10", 
        borderColor: "border-red-400/30",
        gradient: "from-red-500/10 to-red-400/10",
        description: "La documentación requiere correcciones"
      },
      [KYCStatus.ERROR]: { 
        icon: <AlertCircle className="w-6 h-6" />, 
        text: "Error en Verificación", 
        color: "text-red-400", 
        bgColor: "bg-red-500/10", 
        borderColor: "border-red-400/30",
        gradient: "from-red-500/10 to-red-400/10",
        description: "Ocurrió un error técnico durante el proceso"
      },
      [KYCStatus.EXPIRED]: { 
        icon: <Clock className="w-6 h-6" />, 
        text: "Sesión Expirada", 
        color: "text-purple-300", 
        bgColor: "bg-purple-500/10", 
        borderColor: "border-purple-400/30",
        gradient: "from-purple-500/10 to-pink-500/10",
        description: "La sesión anterior ha expirado"
      },
      [KYCStatus.ABANDONED]: { 
        icon: <XCircle className="w-6 h-6" />, 
        text: "Proceso Incompleto", 
        color: "text-purple-300", 
        bgColor: "bg-purple-500/10", 
        borderColor: "border-purple-400/30",
        gradient: "from-purple-500/10 to-pink-500/10",
        description: "El proceso anterior no se completó"
      },
    };
    return statusConfig[status] ?? statusConfig[KYCStatus.ERROR];
  };

  const renderStatus = () => {
    const statusProps = getStatusRenderProps(kycSystemStatus);
    return (
      <motion.div 
        className={`
          relative border ${statusProps.borderColor} bg-gradient-to-br ${statusProps.gradient} 
          backdrop-blur-sm rounded-xl p-6 text-center space-y-4 shadow-inner overflow-hidden
        `}
        variants={statusVariants}
        initial="initial"
        animate="animate"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <motion.div 
          className={`flex items-center justify-center space-x-3 ${statusProps.color} relative z-10`}
          variants={kycSystemStatus === KYCStatus.VERIFIED ? pulseVariants : {}}
          animate={kycSystemStatus === KYCStatus.VERIFIED ? "animate" : ""}
        >
          <div className="relative">
            {statusProps.icon}
            {kycSystemStatus === KYCStatus.VERIFIED && (
              <motion.div
                className="absolute -inset-2 rounded-full bg-green-400/20 blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{statusProps.text}</h3>
            <p className="text-sm opacity-80 mt-1">{statusProps.description}</p>
          </div>
        </motion.div>

        {lastUpdate && (
          <motion.p 
            className="text-xs text-gray-400 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Actualizado: {lastUpdate}
          </motion.p>
        )}

        {/* Polling indicator */}
        {(kycSystemStatus === KYCStatus.PENDING || kycSystemStatus === KYCStatus.IN_PROGRESS) && (
          <motion.div
            className="flex items-center justify-center space-x-2 text-xs text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
            <span>Actualizando automáticamente</span>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Determinar texto y acción del botón principal
  let buttonAction: () => void;
  let buttonText: string;
  let buttonIcon: ReactNode = <ArrowRight className="w-5 h-5" />;
  let isActionDisabled: boolean = false;
  let buttonVariant: "default" | "destructive" | "success" = "default";
  const isLoading = actionStatus === ActionStatus.LOADING_STATUS || actionStatus === ActionStatus.CREATING_SESSION || actionStatus === ActionStatus.REDIRECTING;

  switch (kycSystemStatus) {
    case KYCStatus.VERIFIED:
      buttonAction = () => router.push('/quhealthy/dashboard');
      buttonText = "Acceder al Panel";
      buttonIcon = <LayoutDashboard className="w-5 h-5" />;
      isActionDisabled = isLoading;
      buttonVariant = "success";
      break;
    case KYCStatus.REJECTED:
    case KYCStatus.ERROR:
    case KYCStatus.EXPIRED:
    case KYCStatus.ABANDONED:
      buttonAction = handleStartVerification;
      buttonText = "Reintentar Verificación";
      buttonIcon = <RefreshCw className="w-5 h-5" />;
      isActionDisabled = isLoading;
      buttonVariant = "destructive";
      break;
    case KYCStatus.PENDING:
    case KYCStatus.IN_PROGRESS:
       buttonAction = () => {};
       buttonText = "Verificación en Proceso";
       buttonIcon = <Loader2 className="w-5 h-5 animate-spin" />;
       isActionDisabled = true;
       break;
    case KYCStatus.NOT_STARTED:
    default:
      buttonAction = handleStartVerification;
      buttonText = "Iniciar Verificación";
      buttonIcon = <UserCheck className="w-5 h-5" />;
      isActionDisabled = isLoading;
  }

  const getButtonClasses = () => {
    const base = "w-full font-semibold text-base shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group";
    
    switch (buttonVariant) {
      case "success":
        return `${base} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white`;
      case "destructive":
        return `${base} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white`;
      default:
        return `${base} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white`;
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500 opacity-20 blur-3xl rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 10
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-lg relative z-10"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="text-center space-y-6 pt-8 pb-6 relative">
            <motion.div 
              className="mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 p-4 rounded-2xl w-fit shadow-inner backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ShieldCheck className="w-12 h-12 text-purple-400" />
            </motion.div>
            
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Verificación de Identidad
              </h1>
              <p className="text-gray-300 text-sm px-4 leading-relaxed">
                Protegemos tu seguridad y cumplimos las regulaciones financieras. 
                El proceso es rápido, seguro y completamente encriptado.
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            {/* Progress Steps */}
            <ProgressSteps currentStatus={kycSystemStatus} />

            {/* Error Alert */}
            <AnimatePresence>
              {actionStatus === ActionStatus.ERROR && error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive" className="bg-red-400/10 border-red-400/50 text-red-400 backdrop-blur-sm">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                  {isRetrying && (
                    <motion.div
                      className="mt-3 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        size="sm"
                        className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reintentar
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Display */}
            {renderStatus()}

            {/* Contextual Messages */}
            <AnimatePresence>
              {kycSystemStatus === KYCStatus.REJECTED && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-red-400/10 border-red-400/30 text-red-400 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription className="text-sm">
                      <strong>Documentación rechazada:</strong> Revisa que tus documentos estén vigentes, 
                      legibles y coincidan con tu información personal. Si persiste el problema, 
                      contacta a nuestro equipo de soporte.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              {kycSystemStatus === KYCStatus.EXPIRED && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-purple-400/10 border-purple-400/30 text-purple-300 backdrop-blur-sm">
                    <Clock className="h-4 w-4"/>
                    <AlertDescription className="text-sm">
                      <strong>Sesión expirada:</strong> Por seguridad, las sesiones de verificación 
                      tienen un tiempo límite. Puedes iniciar una nueva sesión cuando estés listo.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {kycSystemStatus === KYCStatus.ABANDONED && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-purple-400/10 border-purple-400/30 text-purple-300 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription className="text-sm">
                      <strong>Proceso incompleto:</strong> No completaste el proceso anterior. 
                      Puedes continuarlo o iniciar uno nuevo cuando tengas tiempo disponible.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {kycSystemStatus === KYCStatus.PENDING && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-purple-400/10 border-purple-400/30 text-purple-300 backdrop-blur-sm">
                    <Clock className="h-4 w-4"/>
                    <AlertDescription className="text-sm">
                      <strong>En revisión manual:</strong> Nuestro equipo especializado está 
                      revisando tu documentación. Normalmente este proceso toma entre 24-48 horas hábiles.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {kycSystemStatus === KYCStatus.VERIFIED && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-green-400/10 border-green-400/30 text-green-400 backdrop-blur-sm">
                    <CheckCircle2 className="h-4 w-4"/>
                    <AlertDescription className="text-sm">
                      <strong>Verificación exitosa:</strong> Tu identidad ha sido confirmada. 
                      Ya puedes acceder a todas las funcionalidades de la plataforma.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature List - Only show for initial states */}
            {(kycSystemStatus === KYCStatus.NOT_STARTED || 
              kycSystemStatus === KYCStatus.REJECTED || 
              kycSystemStatus === KYCStatus.ERROR ||
              kycSystemStatus === KYCStatus.EXPIRED ||
              kycSystemStatus === KYCStatus.ABANDONED) && (
              <FeatureList />
            )}

            {/* Tips for Success */}
            {(kycSystemStatus === KYCStatus.NOT_STARTED || 
              kycSystemStatus === KYCStatus.REJECTED || 
              kycSystemStatus === KYCStatus.ERROR ||
              kycSystemStatus === KYCStatus.EXPIRED ||
              kycSystemStatus === KYCStatus.ABANDONED) && (
              <motion.div
                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="font-semibold text-purple-300 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Consejos para una verificación exitosa:
                </h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    Asegúrate de tener buena iluminación y un fondo neutro
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    Mantén tu documento completamente visible y sin reflejos
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    Completa el proceso en una sola sesión para mejores resultados
                  </li>
                </ul>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <motion.div 
              className="w-full"
              whileHover={{ scale: isActionDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isActionDisabled ? 1 : 0.98 }}
            >
              <Button
                onClick={buttonAction}
                disabled={isActionDisabled}
                size="lg"
                className={getButtonClasses()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading && actionStatus === ActionStatus.LOADING_STATUS && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  {isLoading && actionStatus === ActionStatus.CREATING_SESSION && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  {isLoading && actionStatus === ActionStatus.REDIRECTING && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  
                  {!isLoading && buttonIcon}
                  
                  <span className="font-semibold">
                    {isLoading && actionStatus === ActionStatus.CREATING_SESSION ? "Preparando Sesión..." :
                     isLoading && actionStatus === ActionStatus.REDIRECTING ? "Redirigiendo..." :
                     isLoading && actionStatus === ActionStatus.LOADING_STATUS ? "Verificando Estado..." :
                     buttonText}
                  </span>
                  
                  {!isLoading && kycSystemStatus !== KYCStatus.PENDING && kycSystemStatus !== KYCStatus.IN_PROGRESS && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  )}
                </div>
              </Button>
            </motion.div>

            {/* Loading Progress Indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="w-full mt-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full bg-gray-700/50 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        duration: 2, 
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    {actionStatus === ActionStatus.CREATING_SESSION ? "Configurando tu sesión de verificación..." :
                     actionStatus === ActionStatus.REDIRECTING ? "Preparando redirección segura..." :
                     "Consultando estado actual..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </Card>

        {/* Footer Info */}
        <motion.div
          className="mt-6 text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-gray-400">
            Todos los datos son procesados con encriptación de grado bancario
          </p>
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda? Contacta a nuestro{" "}
            <button className="text-purple-400 hover:text-purple-300 underline transition-colors duration-300">
              equipo de soporte
            </button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}