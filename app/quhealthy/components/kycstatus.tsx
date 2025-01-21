"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// Exportar StatusTypes para que sea reutilizable
export const KYCStatusTypes = {
  LOADING: "loading",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  PENDING: "Pendiente",
  ERROR: "error",
};

interface KYCStatusProps {
  status: string; // Estado actual del proceso de verificación
  lastUpdate: string | null; // Última fecha de actualización
}

export default function KYCStatus({ status, lastUpdate }: KYCStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case KYCStatusTypes.APPROVED:
        return <CheckCircle2 className="w-8 h-8 text-green-400" />;
      case KYCStatusTypes.REJECTED:
        return <XCircle className="w-8 h-8 text-red-400" />;
      case KYCStatusTypes.PENDING:
        return <AlertCircle className="w-8 h-8 text-yellow-400" />;
      case KYCStatusTypes.ERROR:
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      default:
        return <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case KYCStatusTypes.APPROVED:
        return "¡Su verificación de identidad ha sido aprobada!";
      case KYCStatusTypes.REJECTED:
        return "Su verificación ha sido rechazada. Por favor, contacte con soporte.";
      case KYCStatusTypes.PENDING:
        return "Su verificación está en proceso de revisión.";
      case KYCStatusTypes.ERROR:
        return "Error al cargar el estado de verificación.";
      default:
        return "Cargando estado de verificación...";
    }
  };

  const getStatusAlert = () => {
    if (status === KYCStatusTypes.LOADING) return null;

    const alertStyles = {
      [KYCStatusTypes.APPROVED]: "bg-green-900/50 border-green-800",
      [KYCStatusTypes.REJECTED]: "bg-red-900/50 border-red-800",
      [KYCStatusTypes.PENDING]: "bg-yellow-900/50 border-yellow-800",
      [KYCStatusTypes.ERROR]: "bg-red-900/50 border-red-800",
    };

    return (
      <Alert className={alertStyles[status] || "bg-gray-900/50 border-gray-800"}>
        <AlertDescription>{getStatusMessage()}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="w-full">
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-teal-500/10 p-3 rounded-full w-fit">
            <Shield className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
            Estado de Verificación
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-2">
            Estado actual de su proceso de verificación de identidad
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {getStatusIcon()}
            <div className="text-center">{getStatusAlert()}</div>
          </div>

          {lastUpdate && status !== KYCStatusTypes.LOADING && (
            <p className="text-center text-sm text-gray-400">
              Última actualización: {lastUpdate}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
