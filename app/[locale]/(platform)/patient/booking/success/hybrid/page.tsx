// Ubicación: src/app/[locale]/(platform)/patient/booking/success/hybrid/page.tsx
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
import { paymentService } from '@/services/payment.service'; // 🚀 Usamos el PaymentService
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Componentes modulares
import { BackgroundEffects, Confetti } from '@/components/booking/success/SuccessEffects';

// 🚀 NUEVAS INTERFACES ENTERPRISE (Alineadas con tu backend Java)
interface ReceiptItemDto {
  quantity: number;
  name: string;
  type: string; // 'SERVICE', 'PRODUCT', 'COURSE'
}

interface UnifiedReceiptResponse {
  transactionId: string;
  date: string; // Timestamp de Stripe en segundos
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
  const sessionId = searchParams.get('session_id'); // 🚀 Leemos el ID de Stripe de la URL

  const t = useTranslations('PatientBookingSuccess');
  const clearCart = useBookingStore((state) => state.clearCart);

  const [receipt, setReceipt] = useState<UnifiedReceiptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // 1. Apagar confetti después de 5s
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    // 2. Vaciamos el carrito (ya no lo necesitamos para leer, solo para limpiar)
    clearCart();

    // 3. Consultar el recibo unificado al Backend Enterprise
    const fetchReceipt = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return; // Si no hay ID en la URL, se mostrará el estado de error
      }

      try {
        const data = await paymentService.getUnifiedReceipt(sessionId);
        setReceipt(data);
      } catch (error) {
        console.error("Error al obtener el recibo unificado:", error);
        toast.error("Hubo un problema al cargar el detalle de tu recibo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();

    return () => clearTimeout(timer);
  }, [sessionId, clearCart]);


  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <QhSpinner size="lg" />
        <p className="text-slate-500 mt-4 font-medium">Generando tu recibo detallado...</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recibo no encontrado</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm mx-auto">
          No pudimos localizar la transacción <br/><span className="text-xs break-all">{sessionId}</span>
        </p>
        <Button onClick={() => router.push("/patient/dashboard")} className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
          Ir a mis compras
        </Button>
      </div>
    );
  }

  // ==========================================
  // ✨ RENDERIZADO PRINCIPAL (TICKET DE COMPRA)
  // ==========================================

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: receipt.currency || 'MXN',
  }).format(receipt.totalPaid || 0);

  // 🚀 FIX DE FECHA: Stripe manda el tiempo en Segundos (UNIX). Multiplicamos por 1000 para Milisegundos en JS.
  const formattedDate = format(
    new Date(parseInt(receipt.date) * 1000), 
    "EEEE, d 'de' MMMM yyyy 'a las' HH:mm 'hrs'", 
    { locale: es }
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 pb-32 font-sans selection:bg-medical-500/30">
      <BackgroundEffects />
      <Confetti show={showConfetti} />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10 border-4 border-white dark:border-slate-900"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">
              ¡Pago Exitoso!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
              Tu compra híbrida ha sido procesada correctamente. Hemos enviado el comprobante a tu correo electrónico.
            </p>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl relative">
            <div className="h-2 w-full bg-repeating-linear-gradient from-transparent to-transparent bg-[length:20px_20px] bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-dashed border-slate-200 dark:border-slate-700 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Transacción</p>
                  <p className="text-xs font-mono font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {receipt.transactionId.replace('cs_test_', '***').substring(0, 15)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{formattedDate}</p>
                </div>
              </div>

              {receipt.shippingAddress && (
                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-medical-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Dirección de Envío</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    {receipt.shippingAddress}
                  </p>
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-slate-400" /> Detalle de Compra
                </h3>
                
                <div className="space-y-4">
                  {receipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/50 pb-3 last:border-0 last:pb-0">
                      <span className="flex items-center gap-3">
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-md text-xs">
                          {item.quantity}x
                        </span>
                        <span>
                          {item.name}
                          <span className="block text-xs text-slate-400 font-normal mt-0.5">
                            {item.type === 'SERVICE' ? 'Cita Médica' : 
                             item.type === 'PRODUCT' ? 'Producto Físico' : 'Contenido Digital'}
                          </span>
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-500">Total Pagado</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{formattedTotal}</span>
              </div>
            </CardContent>

            <div className="absolute -left-4 top-[50%] w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full" />
            <div className="absolute -right-4 top-[50%] w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full" />
          </Card>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push("/patient/dashboard/orders")} 
              variant="outline" 
              className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <ReceiptText className="w-5 h-5 mr-2" />
              Ver mis compras
            </Button>
            
            <Button 
              onClick={() => router.push("/patient/dashboard")} 
              className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Ir a mi panel principal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
