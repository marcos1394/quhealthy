// Ubicación: src/app/[locale]/(platform)/patient/booking/success/hybrid/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Home, ShoppingBag, Truck, ReceiptText, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

import { useBookingStore } from '@/hooks/useBookingStore';
import { appointmentService } from '@/services/appointment.service';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Componentes modulares (Reutilizados de tu vista de éxito de citas)
import { BackgroundEffects, Confetti } from '@/components/booking/success/SuccessEffects';

// Interfaz temporal para la orden (Ajusta los campos según lo que devuelva tu backend)
interface OrderItem {
  id: number;
  name?: string;
  serviceName?: string;
  itemName?: string; // 🚀 NUEVO: Lo que manda tu backend
  quantity: number;
  price: number;
  itemType: string;
}

interface OrderResponse {
  id: number;
  totalAmount: number;
  currency: string;
  status: string;
  shippingAddress?: string;
  createdAt: string;
  items?: OrderItem[];
  productsToDeliver?: string; // Por si tu backend manda los productos en un string JSON
}

export default function HybridSuccessPage() {
  const router = useRouter();
  const t = useTranslations('PatientBookingSuccess'); // Puedes usar el mismo archivo de traducciones
  const clearCart = useBookingStore((state) => state.clearCart);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // 1. Apagar el confetti después de 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    // 2. Limpiar el carrito de compras (Ya se pagó, no lo necesitamos)
    clearCart();

    // 3. Obtener la orden desde el backend
    const fetchOrder = async () => {
      try {
        const ordersList = await appointmentService.getConsumerOrders();
        
        // 🚀 FIX: Leemos .content porque Spring Boot devuelve un objeto Page
        if (ordersList && ordersList.content && ordersList.content.length > 0) {
          setOrder(ordersList.content[0]);
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error al obtener la orden:", error);
        toast.error("Hubo un problema al cargar los detalles de tu orden.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    return () => clearTimeout(timer);
  }, [clearCart]);


  // ==========================================
  // 🚦 ESTADOS DE CARGA Y ERROR
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <QhSpinner size="lg" />
        <p className="text-slate-500 mt-4 font-medium">Buscando tu orden...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No encontramos tu recibo</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 max-w-sm mx-auto">
          No pudimos localizar los detalles de esta orden. Sin embargo, si tu pago fue exitoso, recibirás un comprobante en tu correo electrónico.
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

  // Formatear el precio
  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: order.currency || 'MXN',
  }).format(order.totalAmount || 0);

  // 🚀 FIX: Aseguramos que JavaScript sepa que el createdAt viene en UTC
  const utcCreatedAt = order.createdAt.endsWith('Z') 
    ? order.createdAt 
    : `${order.createdAt}Z`;

  // Formatear la fecha
  const formattedDate = format(
    new Date(utcCreatedAt),
    "EEEE, d 'de' MMMM yyyy 'a las' HH:mm 'hrs'", 
    { locale: es }
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 pb-32 font-sans selection:bg-medical-500/30">
      <BackgroundEffects />
      <Confetti show={showConfetti} />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* HEADER DEL ÉXITO */}
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
              Tu orden ha sido procesada correctamente. Hemos enviado un recibo a tu correo electrónico.
            </p>
          </div>

          {/* TICKET DE COMPRA */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-3xl relative">
            
            {/* Adorno superior (estilo ticket impreso) */}
            <div className="h-2 w-full bg-repeating-linear-gradient from-transparent to-transparent bg-[length:20px_20px] bg-gradient-to-r from-emerald-400 to-teal-500" />
            
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-dashed border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Orden #</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{order.id.toString().padStart(6, '0')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{formattedDate}</p>
                </div>
              </div>

              {/* DIRECCIÓN DE ENVÍO (Si existe) */}
              {order.shippingAddress && (
                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-medical-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Dirección de Envío</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                    {order.shippingAddress}
                  </p>
                </div>
              )}

              {/* LISTA DE ÍTEMS O DESCRIPCIÓN */}
              <div className="mb-8">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-slate-400" /> Detalle de Compra
                </h3>
                
                {/* 
                  Aquí mostramos los ítems. Si tu backend guarda un string, mostramos el string.
                  Si guarda un array de objetos, los iteramos.
                */}
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-2">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">{item.quantity}x</span>
                          {item.itemName || item.name || item.serviceName || 'Producto/Servicio'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-600 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      {order.productsToDeliver || 'Artículos de tu carrito híbrido'}
                    </div>
                  )}
                </div>
              </div>

              {/* TOTAL */}
              <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-500">Total Pagado</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">{formattedTotal}</span>
              </div>
            </CardContent>

            {/* Adorno inferior (recortes circulares de ticket) */}
            <div className="absolute -left-4 top-[50%] w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full" />
            <div className="absolute -right-4 top-[50%] w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full" />
          </Card>

          {/* BOTONES DE ACCIÓN */}
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
