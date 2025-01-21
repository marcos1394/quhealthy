"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import axios from "axios";
import KYCStatus from "../../../components/kycstatus";
import { KYCStatusTypes } from "../../../components/kycstatus";

const VerificationStatus = {
  IDLE: "idle",
  LOADING: "loading",
  INITIATED: "initiated",
  COMPLETED: "completed",
};

export default function KYCForm() {
  const [verificationStatus, setVerificationStatus] = useState(VerificationStatus.IDLE);
  const [kycStatus, setKycStatus] = useState<string>(KYCStatusTypes.LOADING);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const handleStartVerification = async () => {
    setVerificationStatus(VerificationStatus.LOADING);

    try {
      const response = await axios.post("http://localhost:3001/kyc/create-session");
      const { sessionToken } = response.data;

      // Aquí se integraría Veriff o el proveedor de verificación
      setTimeout(() => {
        setVerificationStatus(VerificationStatus.COMPLETED);
        fetchKYCStatus(); // Simula la actualización del estado KYC
      }, 2000);
    } catch (error) {
      console.error("Error al iniciar el proceso de verificación:", error);
      setVerificationStatus(VerificationStatus.IDLE);
    }
  };

  const fetchKYCStatus = async () => {
    try {
      const response = await axios.get("http://localhost:3001/kyc/status");
      setKycStatus(response.data.status);
      setLastUpdate(new Date().toLocaleString());
    } catch (error) {
      console.error("Error al obtener el estado KYC:", error);
      setKycStatus(KYCStatusTypes.ERROR);
    }
  };

  useEffect(() => {
    if (verificationStatus === VerificationStatus.COMPLETED) {
      fetchKYCStatus();
    }
  }, [verificationStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-teal-500/10 p-3 rounded-full w-fit">
            <Shield className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
            Verificación de Identidad
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-2">
            Complete su verificación de identidad para continuar
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <KYCStatus status={kycStatus} lastUpdate={lastUpdate} />
        </CardContent>

        <CardFooter>
          <button
            onClick={handleStartVerification}
            disabled={verificationStatus === VerificationStatus.LOADING || verificationStatus === VerificationStatus.INITIATED}
            className="w-full bg-teal-500 py-3 px-4 rounded-lg text-white font-semibold hover:bg-teal-600 
                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {verificationStatus === VerificationStatus.LOADING ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando Verificación...
              </>
            ) : (
              "Iniciar Verificación"
            )}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
