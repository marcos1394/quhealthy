"use client";
import React, { useState, useEffect, JSX } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";

enum VerificationStatus {
  IDLE = "idle",
  LOADING = "loading",
  INITIATED = "initiated",
  COMPLETED = "completed",
  ERROR = "error"
}

enum KYCStatus {
  NOT_STARTED = "not_started",
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  VERIFIED = "verified",
  REJECTED = "rejected",
  EXPIRED = "expired",
  ABANDONED = "abandoned",
  ERROR = "error"
}

interface CreateSessionResponse {
  verification_url: any;
  authorization_url: string;
  session_id: string;
  expires_at: string;
}

interface KYCStatusResponse {
  status: KYCStatus;
  details?: string;
  last_update?: string;
}

interface APIError {
  error: string;
  details?: string;
  code?: number;
}

export default function KYCVerification(): JSX.Element {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.IDLE);
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.NOT_STARTED);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const { data } = await axios.get<KYCStatusResponse>(
          "http://localhost:3001/api/kyc/status",
          { withCredentials: true }
        );
        
        setKycStatus(data.status);
        setLastUpdate(data.last_update ? new Date(data.last_update) : new Date());

        if (![KYCStatus.VERIFIED, KYCStatus.REJECTED, KYCStatus.ERROR].includes(data.status)) {
          const interval = setInterval(checkKYCStatus, 5000);
          setPollingInterval(interval);
        }
      } catch (error) {
        console.error("Error inicial:", error);
        handleKYCError(error);
      }
    };

    checkInitialStatus();
    
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);

  const handleKYCError = (error: unknown) => {
    const axiosError = error as AxiosError<APIError>;
    setError(axiosError.response?.data?.details || axiosError.message);
    setKycStatus(KYCStatus.ERROR);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleStartVerification = async () => {
    setVerificationStatus(VerificationStatus.LOADING);
    setError(null);
  
    try {
      const { data } = await axios.post<CreateSessionResponse>(
        "http://localhost:3001/api/kyc/create-session",
        {},
        { withCredentials: true }
      );
  
      console.log("🔗 URL de verificación obtenida:", data.verification_url);
  
      if (data.verification_url) {
        sessionStorage.setItem('kycVerificationStarted', 'true');
        window.location.href = data.verification_url; // Redirige correctamente
      } else {
        throw new Error("No se recibió la URL de verificación.");
      }
      
    } catch (error) {
      handleKYCError(error);
      setVerificationStatus(VerificationStatus.ERROR);
    }
  };
  

  const checkKYCStatus = async () => {
    try {
      const { data } = await axios.get<KYCStatusResponse>(
        "http://localhost:3001/api/kyc/status",
        { withCredentials: true }
      );
      
      setKycStatus(data.status);
      setLastUpdate(data.last_update ? new Date(data.last_update) : new Date());

      if ([KYCStatus.VERIFIED, KYCStatus.REJECTED, KYCStatus.ERROR].includes(data.status)) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      handleKYCError(error);
    }
  };

  const getStatusRenderProps = (status: KYCStatus) => {
    const statusConfig = {
      [KYCStatus.NOT_STARTED]: {
        icon: <AlertCircle className="w-6 h-6" />,
        text: "Verificación no iniciada",
        color: "text-gray-400"
      },
      [KYCStatus.IN_PROGRESS]: {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        text: "Verificación en progreso",
        color: "text-yellow-500"
      },
      [KYCStatus.PENDING]: {
        icon: <AlertCircle className="w-6 h-6" />,
        text: "Pendiente de revisión",
        color: "text-yellow-500"
      },
      [KYCStatus.VERIFIED]: {
        icon: <CheckCircle2 className="w-6 h-6" />,
        text: "Verificación exitosa",
        color: "text-green-500"
      },
      [KYCStatus.REJECTED]: {
        icon: <XCircle className="w-6 h-6" />,
        text: "Verificación rechazada",
        color: "text-red-500"
      },
      [KYCStatus.ERROR]: {
        icon: <XCircle className="w-6 h-6" />,
        text: "Error en verificación",
        color: "text-red-500"
      },
      [KYCStatus.EXPIRED]: {
        icon: <AlertCircle className="w-6 h-6" />,
        text: "Sesión expirada",
        color: "text-orange-500"
      },
      [KYCStatus.ABANDONED]: {
        icon: <AlertCircle className="w-6 h-6" />,
        text: "Proceso abandonado",
        color: "text-orange-500"
      }
    };

    return statusConfig[status];
  };

  const renderStatus = () => {
    const statusProps = getStatusRenderProps(kycStatus);
    if (!statusProps) return null;

    return (
      <div className={`flex items-center justify-center space-x-2 ${statusProps.color}`}>
        {statusProps.icon}
        <span>{statusProps.text}</span>
      </div>
    );
  };

  const buttonText = () => {
    switch (kycStatus) {
      case KYCStatus.VERIFIED:
        return "Verificación completada";
      case KYCStatus.IN_PROGRESS:
      case KYCStatus.PENDING:
        return "Verificación en proceso";
      case KYCStatus.ERROR:
        return "Reintentar verificación";
      default:
        return "Iniciar verificación";
    }
  };

  const isButtonDisabled = [
    VerificationStatus.LOADING,
    VerificationStatus.INITIATED,
    KYCStatus.IN_PROGRESS,
    KYCStatus.PENDING,
    KYCStatus.VERIFIED
  ].includes(verificationStatus) || [
    KYCStatus.IN_PROGRESS,
    KYCStatus.PENDING,
    KYCStatus.VERIFIED
  ].includes(kycStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-teal-500/10 p-4 rounded-full w-fit">
              <Shield className="w-10 h-10 text-teal-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Verificación KYC</h1>
              <p className="text-gray-400">
                Complete su verificación de identidad para acceder a todas las funcionalidades
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-700/50 p-4 rounded-lg">
              {renderStatus()}
              {lastUpdate && (
                <p className="text-center text-sm text-gray-400 mt-2">
                  Última actualización: {formatDate(lastUpdate)}
                </p>
              )}
            </div>

            {kycStatus === KYCStatus.REJECTED && (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertDescription className="text-red-300">
                  Su verificación ha sido rechazada. Por favor, intente nuevamente o contacte a soporte.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleStartVerification}
              disabled={isButtonDisabled}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verificationStatus === VerificationStatus.LOADING && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {buttonText()}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}