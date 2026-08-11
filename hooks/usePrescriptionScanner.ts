import { useState } from 'react';
import { onboardingService } from '@/services/onboarding.service';
import { PrescriptionScanResponse } from '@/types/onboarding';

export const usePrescriptionScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PrescriptionScanResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const scanPrescriptionFile = async (file: File) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const result = await onboardingService.scanPrescription(file);
      setScanResult(result);
      return result;
    } catch (err: any) {
      console.error("Error al escanear la receta:", err);
      const errorMsg = err.response?.data?.message || "Ocurrió un error al procesar la receta con IA.";
      setScanError(errorMsg);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  const clearScanResult = () => {
    setScanResult(null);
    setScanError(null);
  };

  return {
    isScanning,
    scanResult,
    scanError,
    scanPrescriptionFile,
    clearScanResult
  };
};
