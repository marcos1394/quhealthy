"use client";

import React, { useState, useEffect, useCallback, JSX, ReactNode } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Añadido CardFooter si se usa
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight,
  UserCheck, Clock, LayoutDashboard, GraduationCap, Store, Puzzle,
  ClipboardCheck
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";

// --- Tipos y Enums ---

enum KYCStatus {
  NOT_STARTED = "not_started", PENDING = "pending", IN_PROGRESS = "in_progress",
  VERIFIED = "verified", REJECTED = "rejected", EXPIRED = "expired",
  ABANDONED = "abandoned", ERROR = "error", APPROVED = "approved", IN_REVIEW = "in_review"
}
type KycStatusValue = `${KYCStatus}`;

enum LicenseStatus {
    PENDING = "pending", VERIFIED = "verified", REJECTED = "rejected"
}
type LicenseStatusValue = `${LicenseStatus}`;

// --- Interfaces de Respuesta API ---
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

interface APIErrorResponse { message: string; }

// --- Tipos para el Componente ---
enum ActionStatus {
  IDLE = "idle", LOADING_STATUS = "loading_status", ERROR = "error"
}

// CORREGIDO: Definición de la interfaz OnboardingStep
interface OnboardingStep {
  id: 'kyc' | 'license' | 'marketplace' | 'blocks';
  title: string;
  description: string;
  icon: ReactNode;
  isComplete: boolean;
  isRequired: boolean;
  statusText: string;
  statusColor: string;
  statusIcon: ReactNode;
  actionText: string;
  actionPath?: string;
  actionDisabled?: boolean;
}
// --------------------------------------------------


// --- Animación ---
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};
const stepVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
};

// --- Componente Principal: Tablero de Onboarding (Corregido) ---
export default function OnboardingDashboard(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<OnboardingStatusResponse | null>(null);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // --- Función para obtener estado ---
  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("🚀 Obteniendo estado de onboarding...");
    try {
      const { data } = await axios.get<OnboardingStatusResponse>(
        `${API_BASE_URL}/api/providers/status`,
        { withCredentials: true }
      );
      console.log("✅ Estado recibido:", data);
      setStatusData(data);

      // Redirección si ya está completo (asegúrate que la lógica sea robusta)
      if (
          data.onboardingStatus.kyc.isComplete &&
          (!data.onboardingStatus.license.isRequired || data.onboardingStatus.license.isComplete) &&
          data.onboardingStatus.marketplace.isConfigured
      ) {
          console.log("✅ Onboarding completo! Redirigiendo al Dashboard...");
          toast.success("¡Configuración completa!", { autoClose: 2000 });
          router.replace('/quhealthy/profile/providers/dashboard');
      }

    } catch (err: unknown) {
      const axiosError = err as AxiosError<APIErrorResponse>;
      const message = axiosError.response?.data?.message || (err as Error).message || "No se pudo cargar el estado del onboarding.";
      console.error("❌ Error obteniendo estado:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, router]);

  // --- Efecto para cargar estado al montar ---
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // --- Lógica para transformar estado en pasos visuales ---

  // Helper para obtener display visual del estado
  const getStatusDisplayProps = (status: KycStatusValue | LicenseStatusValue | null | undefined, isComplete: boolean, stepType: 'KYC' | 'Licencia' | 'Marketplace' | 'Blocks'): { icon: ReactNode; text: string; color: string } => {
    if (isComplete) return { icon: <CheckCircle2 className="w-4 h-4" />, text: stepType === 'Marketplace' || stepType === 'Blocks' ? "Configurado" : "Completado", color: "text-green-400" };

    switch (status) {
        case 'pending':
        case 'in_progress':
        case 'in_review':
        case LicenseStatus.PENDING: // Usar enum para claridad aquí si se quiere
             return { icon: <Clock className="w-4 h-4" />, text: "En Revisión", color: "text-yellow-400" };
        case 'rejected':
        case 'error':
        case LicenseStatus.REJECTED: // Usar enum aquí si se quiere
            return { icon: <XCircle className="w-4 h-4" />, text: "Rechazado/Error", color: "text-red-400" };
        case 'expired':
        case 'abandoned':
            return { icon: <AlertCircle className="w-4 h-4" />, text: "Expirado/Abandonado", color: "text-orange-400" };
        case 'not_started':
        default:
            return { icon: <AlertCircle className="w-4 h-4" />, text: "Pendiente", color: "text-gray-400" };
    }
  };

  // Función que genera los pasos a mostrar
  const getOnboardingSteps = (): OnboardingStep[] => {
    if (!statusData) return [];

    const { kyc, license, marketplace, blocks } = statusData.onboardingStatus;
    const steps: OnboardingStep[] = []; // Usa la interfaz definida

    // 1. KYC
    const kycStatusInfo = getStatusDisplayProps(kyc.status, kyc.isComplete, 'KYC');
    steps.push({
      id: 'kyc', title: "Verificación de Identidad", description: "Verifica tu identidad para seguridad.",
      icon: <UserCheck className="w-6 h-6" />, isComplete: kyc.isComplete, isRequired: true,
      statusText: kycStatusInfo.text, statusColor: kycStatusInfo.color, statusIcon: kycStatusInfo.icon,
      actionText: kyc.isComplete ? "Verificado" : (['rejected', 'error', 'expired', 'abandoned'].includes(kyc.status) ? "Reintentar Verificación" : "Verificar Identidad"),
      actionPath: kyc.isComplete ? undefined : "/quhealthy/authentication/providers/onboarding/kyc",
      actionDisabled: kyc.isComplete || ['pending', 'in_progress', 'in_review'].includes(kyc.status),
    });

    // 2. Licencia (Condicional)
    if (license.isRequired) {
      const licenseStatusInfo = getStatusDisplayProps(license.status, license.isComplete, 'Licencia');
      steps.push({
        id: 'license', title: "Validación de Cédula Profesional", description: "Requerido para proveedores de salud.",
        icon: <GraduationCap className="w-6 h-6" />, isComplete: license.isComplete, isRequired: true,
        statusText: licenseStatusInfo.text, statusColor: licenseStatusInfo.color, statusIcon: licenseStatusInfo.icon,
        actionText: license.isComplete ? "Validada" : (license.status === 'rejected' ? "Reintentar Validación" : "Validar Cédula"),
        actionPath: license.isComplete ? undefined : "/quhealthy/authentication/providers/onboarding/validatelicense",
        actionDisabled: license.isComplete || !kyc.isComplete || license.status === 'pending', // Depende de KYC completo
      });
    }

    // 3. Marketplace
    const marketplaceStatusInfo = getStatusDisplayProps(null, marketplace.isConfigured, 'Marketplace');
    steps.push({
      id: 'marketplace', title: "Configuración de Tienda", description: "Define tu tienda y servicios/productos.",
      icon: <Store className="w-6 h-6" />, isComplete: marketplace.isConfigured, isRequired: true, // Asumimos requerido
      statusText: marketplaceStatusInfo.text, statusColor: marketplaceStatusInfo.color, statusIcon: marketplaceStatusInfo.icon,
      actionText: marketplace.isConfigured ? "Configurada" : "Configurar Tienda",
      actionPath: marketplace.isConfigured ? undefined : "/quhealthy/authentication/providers/onboarding/marketplaceconfiguration",
      // Depende de KYC y Licencia (si aplica)
      actionDisabled: marketplace.isConfigured || !kyc.isComplete || (license.isRequired && !license.isComplete),
    });

    // 4. Blocks (Opcional / Futuro?) - Se mantiene comentado como ejemplo
    // const blocksStatusInfo = getStatusDisplayProps(null, blocks.isConfigured, 'Blocks');
    // if (statusData.planDetails.permissions.quBlocksAccess) { // Mostrar solo si el plan lo permite
    //     steps.push({
    //         id: 'blocks', title: "Configuración de Cursos (QuBlocks)", description: "Crea y gestiona tus cursos online.",
    //         icon: <Puzzle className="w-6 h-6" />, isComplete: blocks.isConfigured, isRequired: false, // Marcar como no requerido inicialmente?
    //         statusText: blocksStatusInfo.text, statusColor: blocksStatusInfo.color, statusIcon: blocksStatusInfo.icon,
    //         actionText: blocks.isConfigured ? "Configurado" : "Configurar Cursos",
    //         actionPath: blocks.isConfigured ? undefined : "/quhealthy/profile/providers/blocks-config",
    //         actionDisabled: blocks.isConfigured || !kyc.isComplete || (license.isRequired && !license.isComplete) || !marketplace.isConfigured,
    //     });
    // }

    return steps;
  };

  const onboardingSteps = getOnboardingSteps();
  const completedSteps = onboardingSteps.filter(step => step.isComplete && step.isRequired).length;
  const totalRequiredSteps = onboardingSteps.filter(step => step.isRequired).length;
  const progressPercentage = totalRequiredSteps > 0 ? Math.round((completedSteps / totalRequiredSteps) * 100) : (statusData ? 100 : 0); // Evitar NaN si no hay datos


  // Renderizado de Carga
  if (loading || !statusData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Renderizado de Error General
  if (error && !loading) {
     return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
         <Card className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl max-w-md p-6">
             <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>{error}</AlertDescription>
             </Alert>
             <Button onClick={fetchStatus} variant="outline" className="mt-4 w-full text-gray-300 border-gray-600 hover:bg-purple-900/30 hover:border-purple-700 hover:text-purple-300">Reintentar Carga</Button>
         </Card>
      </div>
    );
  }

  // Renderizado Principal del Tablero
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse rounded-full" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl animate-pulse delay-1000 rounded-full" />
      </div>

      <motion.div
        {...fadeIn}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl">
          <CardHeader className="text-center items-center flex flex-col pt-8 pb-6">
            <div className="mx-auto bg-purple-500/10 border border-purple-500/20 p-4 rounded-full w-fit shadow-inner mb-4">
              <ClipboardCheck className="w-10 h-10 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Completa tu Configuración</CardTitle>
            <CardDescription className="text-gray-300 text-sm px-4">
              Sigue estos pasos para activar todas las funcionalidades de tu cuenta QuHealthy.
            </CardDescription>
            <div className="w-full px-6 pt-4">
                 <Progress value={progressPercentage} className="w-full h-2 bg-gray-700 [&>div]:bg-purple-500" />
                 <p className="text-xs text-purple-300 mt-1 text-right">{progressPercentage}% completado ({completedSteps}/{totalRequiredSteps} requeridos)</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-8">
            {onboardingSteps.map((step, index) => (
               step.isRequired &&
              <motion.div key={step.id} custom={index} variants={stepVariant} initial="hidden" animate="visible">
                <Card className={`bg-gray-700/50 border border-gray-600/70 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-opacity duration-300 ${step.actionDisabled && !step.isComplete ? 'opacity-60' : 'opacity-100'}`}>
                    <div className={`p-2 rounded-full bg-purple-500/10 border border-purple-500/20 ${step.isComplete ? 'text-green-400' : 'text-purple-400'} self-start sm:self-center flex-shrink-0`}>
                        {step.isComplete ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="text-sm text-gray-400 mb-1">{step.description}</p>
                        <div className={`flex items-center text-xs gap-1 ${step.statusColor}`}>
                            {step.statusIcon}
                            <span>{step.statusText}</span>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0">
                      {!step.isComplete ? (
                          <Button
                              size="sm"
                              className={`w-full sm:w-auto transition-all duration-200 whitespace-nowrap ${step.actionDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'}`}
                              onClick={() => !step.actionDisabled && step.actionPath && router.push(step.actionPath)}
                              disabled={step.actionDisabled}
                              aria-label={step.actionText}
                          >
                              {step.actionText}
                             {!step.actionDisabled && <ArrowRight className="w-4 h-4 ml-1.5" />}
                          </Button>
                      ) : (
                           <span className="text-sm font-medium text-green-400 flex items-center justify-end gap-1.5 w-full sm:w-auto">
                                <CheckCircle2 className="w-4 h-4"/>
                                Completado
                            </span>
                      )}
                    </div>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
         {/* Botón para ir al dashboard si prefieren saltar pasos no obligatorios */}
         {/* <div className="text-center mt-4">
             <Button variant="link" className="text-purple-400 hover:text-purple-300" onClick={() => router.push('/quhealthy/profile/providers/dashboard')}>
                 Completar más tarde e ir al panel
             </Button>
         </div> */}
      </motion.div>
    </div>
  );
}