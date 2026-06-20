"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Home, ShoppingBag, Truck, ReceiptText, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

import { useBookingStore } from '@/hooks/useBookingStore';
import { paymentService } from '@/services/payment.service'; 
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';

// Componentes modulares (Se mantiene la importación para no quebrar dependencias, 
// pero en la implementación arquitectónica no se renderizan los efectos festivos)
import { BackgroundEffects, Confetti } from '@/components/booking/success/SuccessEffects';

interface ReceiptItemDto {
  quantity: number;
  name: string;
  type: string; 
}

interface UnifiedReceiptResponse {
  transactionId: string;
  date: string; 
  totalPaid: number;
  currency: string;
  paymentMethod: string;
  customerName: string;
  shippingAddress?: string;
  items: ReceiptItemDto[];
}

export default function HybridSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const sessionId = searchParams.get('session_id'); 

  const t = useTranslations('PatientBookingSuccess');
  const clearCart = useBookingStore((state) => state.clearCart);

  const [receipt, setReceipt] = useState<UnifiedReceiptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearCart();

    const fetchReceipt = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return; 
      }

      try {
        const data = await paymentService.getUnifiedReceipt(sessionId);
        setReceipt(data);
      } catch (error) {
        console.error("Error al obtener el recibo unificado:", error);
        toast.error("ERROR: NO FUE POSIBLE RECUPERAR EL REGISTRO DE LA TRANSACCIÓN.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [sessionId, clearCart]);


  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR ARQUITECTÓNICOS
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Sincronizando Auditoría Financiera...
        </p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <ShoppingBag className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">Transacción Inubicable</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8">
          EL IDENTIFICADOR DE SESIÓN CARECE DE REGISTROS VÁLIDOS EN LA BASE DE DATOS. <br/>ID: <span className="font-mono text-[9px] break-all bg-gray-100 dark:bg-gray-900 px-1">{sessionId}</span>
        </p>
        <Button 
          onClick={() => router.push("/patient/dashboard")} 
          className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors"
        >
          Retornar al Panel Principal
        </Button>
      </div>
    );
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL (EXPEDIENTE TRANSACCIONAL)
  // ==========================================

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: receipt.currency || 'MXN',
  }).format(receipt.totalPaid || 0);

  const formattedDate = format(
    new Date(parseInt(receipt.date) * 1000), 
    "dd MMM yyyy - HH:mm 'HRS'", 
    { locale: es }
  ).toUpperCase();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white relative overflow-hidden py-12 px-6 sm:px-12 lg:px-24 pb-32 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      
      {/* Background técnico de puntos sutiles */}
      <BackgroundEffects />
      
      {/* NOTA: Confetti está deshabilitado en el diseño arquitectónico (ya lo refactorizamos a render nulo antes), 
        pero si se inyecta desde otro archivo, no mostrará colores festivos. 
      */}

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="w-20 h-20 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-8">
              <CheckCircle2 className="w-10 h-10" strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-black dark:text-white mb-3">
              Liquidación Aprobada
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto">
              LA ADQUISICIÓN HÍBRIDA HA SIDO PROCESADA CON ÉXITO. EL DOCUMENTO FISCAL HA SIDO EMITIDO AL CORREO DEL TITULAR.
            </p>
          </div>

          <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex flex-col">
            {/* Header del Ticket */}
            <div className="p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">ID Transaccional</p>
                <p className="text-xs font-mono font-bold text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 px-3 py-1.5 w-fit">
                  {receipt.transactionId.replace('cs_test_', '***').substring(0, 18)}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Marca Temporal</p>
                <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">{formattedDate}</p>
              </div>
            </div>

            <div className="p-8 space-y-10">
              
              {receipt.shippingAddress && (
                <div className="border-l-2 border-black dark:border-white pl-4 py-2 bg-gray-50 dark:bg-[#050505]">
                  <div className="flex items-center gap-3 mb-2 text-black dark:text-white">
                    <Truck className="w-4 h-4" strokeWidth={1.5} />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest">Coordenadas de Despliegue Logístico</h3>
                  </div>
                  <p className="text-xs font-light text-black dark:text-white uppercase leading-relaxed">
                    {receipt.shippingAddress}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
                  <Package className="w-4 h-4" strokeWidth={1.5} /> Relación de Activos Adquiridos
                </h3>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {receipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py-4 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors -mx-4 px-4">
                      <div className="flex items-start gap-4">
                        <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                          {item.quantity}X
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                            {item.name}
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            {item.type === 'SERVICE' ? 'PROCEDIMIENTO CLÍNICO' : 
                             item.type === 'PRODUCT' ? 'BIEN FÍSICO' : 'ACTIVO INTANGIBLE'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex justify-between items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Liquidación Neta</span>
              <span className="text-3xl font-semibold tracking-tight text-black dark:text-white">{formattedTotal}</span>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push("/patient/dashboard/orders")} 
              variant="outline" 
              className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              <ReceiptText className="w-4 h-4 mr-3" strokeWidth={1.5} />
              Auditar Adquisiciones
            </Button>
            
            <Button 
              onClick={() => router.push("/patient/dashboard")} 
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors"
            >
              Retornar al Panel Principal
              <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
            </Button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}