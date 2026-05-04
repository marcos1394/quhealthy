import { useState, useEffect } from 'react';
import { publicService } from '@/services/public.service';

export const usePublicPrescription = (appointmentId: number) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Limpiamos la memoria del navegador si el usuario cierra la pestaña
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const verifyPinAndLoadPdf = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (pin.length !== 4) {
      setError("Por favor, ingresa exactamente 4 dígitos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfBlob = await publicService.verifyAndDownloadPrescription(appointmentId, pin);
      
      // Creamos una URL segura local en el navegador
      const fileUrl = URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
      setPdfUrl(fileUrl);
      
    } catch (err: any) {
      console.error("Error verificando PIN:", err);
      // Extraemos el mensaje de error del backend (ej. "Los dígitos no coinciden")
      if (err.response && err.response.data instanceof Blob) {
         // Si el error viene como Blob, lo leemos
         const textError = await err.response.data.text();
         setError(textError || "PIN incorrecto o receta no disponible.");
      } else {
         setError("PIN incorrecto o receta no encontrada. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pin,
    setPin,
    isLoading,
    error,
    pdfUrl,
    verifyPinAndLoadPdf
  };
};
