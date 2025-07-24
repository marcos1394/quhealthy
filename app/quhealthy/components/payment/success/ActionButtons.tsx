"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Share2, Copy, Home, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface ActionButtonsProps {
  orderNumber: string;
  planName: string;
  invoiceUrl: string;
  isNavigating: boolean;
  onContinue: () => Promise<void>;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ orderNumber, planName, invoiceUrl, isNavigating, onContinue }) => {
  const router = useRouter();

  const copyToClipboard = async () => {
    if (orderNumber === "NoDisponible") return toast.error("Número de orden no disponible.");
    try {
      await navigator.clipboard.writeText(invoiceUrl);
      toast.success("¡Enlace de factura copiado!");
    } catch (error) {
      toast.error("No se pudo copiar el enlace.");
    }
  };
  
  const shareInvoice = () => {
    if (orderNumber === "NoDisponible") return toast.error("Número de orden no disponible.");
    if (navigator.share) {
      navigator.share({
        title: "Comprobante de Pago - QuHealthy",
        text: `Aquí está tu comprobante de pago para el plan ${planName} de QuHealthy: ${invoiceUrl}`,
        url: invoiceUrl,
      }).catch(err => { if (err.name !== 'AbortError') toast.error("No se pudo compartir."); });
    } else {
      copyToClipboard();
      toast.info("Enlace copiado. Puedes pegarlo para compartir.");
    }
  };

  const downloadInvoice = () => {
    if (orderNumber === "NoDisponible") return toast.error("Número de orden no disponible.");
    window.open(invoiceUrl, "_blank");
  };

  return (
    <div className="space-y-3 pt-4 border-t border-gray-700">
      <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold" onClick={onContinue} disabled={isNavigating}>
        {isNavigating ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><span>Verificando...</span></>
        ) : (
          <><span className='text-base'>Comenzar Configuración</span><ArrowRight className="w-5 h-5 ml-2" /></>
        )}
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-purple-900/30" onClick={downloadInvoice} disabled={orderNumber === "NoDisponible"}>
          <Download className="w-4 h-4 mr-2" /> Descargar Factura
        </Button>
        <Button variant="outline" className="text-gray-300 border-gray-600 hover:bg-purple-900/30" onClick={shareInvoice} disabled={orderNumber === "NoDisponible"}>
          <Share2 className="w-4 h-4 mr-2" /> Compartir Factura
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="ghost" className="w-full text-gray-400 hover:bg-purple-900/30" onClick={copyToClipboard} disabled={orderNumber === "NoDisponible"}>
          <Copy className="w-4 h-4 mr-2" /> Copiar Enlace
        </Button>
        <Button variant="ghost" className="w-full text-gray-400 hover:bg-purple-900/30" onClick={() => router.push("/")}>
          <Home className="w-4 h-4 mr-2" /> Volver al Inicio
        </Button>
      </div>
    </div>
  );
};