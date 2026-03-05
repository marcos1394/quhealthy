// app/provider/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // 💡 Tip: Puedes hacer esto dinámico según el locale del usuario
import { 
  Package, Truck, CheckCircle2, Loader2, MapPin 
} from "lucide-react";

import { useProviderOrders } from "@/hooks/useProviderOrders";
import { OrderResponseDto } from "@/types/order";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProviderOrdersPage() {
  const t = useTranslations('ProviderOrders');
  const { 
    orders, isLoading, isSubmitting, fetchOrders, shipOrder, markAsDelivered 
  } = useProviderOrders();
  
  // Estados de la UI (Modal)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    fetchOrders(t('toast_load_error'));
  }, [fetchOrders, t]);

  const handleShipSubmit = async () => {
    if (!selectedOrder || trackingNumber.trim().length < 5) return;
    
    const success = await shipOrder(
      selectedOrder.id, 
      trackingNumber.trim(),
      t('toast_ship_success'),
      t('toast_ship_error')
    );
    
    if (success) {
      setSelectedOrder(null);
      setTrackingNumber("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return <Badge className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"><Package className="w-3 h-3 mr-1"/> {t('badge_processing')}</Badge>;
      case 'SHIPPED':
        return <Badge className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"><Truck className="w-3 h-3 mr-1"/> {t('badge_shipped')}</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1"/> {t('badge_delivered')}</Badge>;
      default:
        return <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-medical-600 dark:text-medical-500" />
            {t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('subtitle')}</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('col_order')}</th>
                  <th className="px-6 py-4 font-medium">{t('col_patient')}</th>
                  <th className="px-6 py-4 font-medium">{t('col_items')}</th>
                  <th className="px-6 py-4 font-medium">{t('col_status')}</th>
                  <th className="px-6 py-4 font-medium text-right">{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-medical-500" />
                      {t('loading')}
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      {t('empty_state')}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* 1. Pedido */}
                      <td className="px-6 py-4 align-top">
                        <span className="font-bold text-slate-900 dark:text-white">#{order.id}</span>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                        </div>
                        <div className="font-medium text-slate-700 dark:text-slate-300 mt-2">
                          ${order.totalAmount} {order.currency}
                        </div>
                      </td>

                      {/* 2. Paciente */}
                      <td className="px-6 py-4 align-top">
                        <p className="font-bold text-slate-900 dark:text-white">{order.consumerName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">{order.consumerEmail}</p>
                        {order.shippingAddress && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 p-2.5 rounded-lg max-w-xs">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-medical-500 dark:text-medical-400" />
                            <span className="line-clamp-2" title={order.shippingAddress}>
                              {order.shippingAddress}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 3. Artículos */}
                      <td className="px-6 py-4 align-top">
                        <ul className="space-y-1.5">
                          {order.items.filter(i => !i.isDigital).map((item, idx) => (
                            <li key={idx} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                x{item.quantity}
                              </span>
                              <span className="mt-0.5 leading-tight">{item.itemName}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* 4. Estado */}
                      <td className="px-6 py-4 align-top">
                        {getStatusBadge(order.orderStatus)}
                        {order.trackingNumber && (
                          <div className="mt-2.5 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                            {t('tracking_label')} <strong className="text-slate-700 dark:text-slate-300">{order.trackingNumber}</strong>
                          </div>
                        )}
                      </td>

                      {/* 5. Acciones */}
                      <td className="px-6 py-4 align-top text-right">
                        {order.orderStatus === 'PROCESSING' && (
                          <Button 
                            size="sm" 
                            className="bg-medical-600 hover:bg-medical-700 text-white dark:bg-medical-500 dark:hover:bg-medical-600"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            {t('btn_ship')}
                          </Button>
                        )}
                        {order.orderStatus === 'SHIPPED' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            onClick={() => markAsDelivered(order.id, t('toast_deliver_success'), t('toast_deliver_error'))}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('btn_deliver')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 📦 MODAL DIALOG (Con soporte Dark Mode) */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t('modal_title')}</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {selectedOrder && t('modal_desc', { id: selectedOrder.id, name: selectedOrder.consumerName })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              {t('modal_input_label')} <span className="text-red-500">*</span>
            </label>
            <Input 
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('modal_placeholder')}
              className="font-mono bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-medical-500"
              autoFocus
            />
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSelectedOrder(null)}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('btn_cancel')}
            </Button>
            <Button 
              type="button" 
              className="bg-medical-600 text-white hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500"
              onClick={handleShipSubmit}
              disabled={isSubmitting || trackingNumber.trim().length < 5}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {t('btn_confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}