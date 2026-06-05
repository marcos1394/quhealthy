"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { purchaseOrderService, CreatePurchaseOrderRequest } from '@/services/purchase-order.service';
import { supplierService } from '@/services/supplier.service';
import { paymentService } from '@/services/payment.service';
import { useCatalog } from '@/hooks/useCatalog';
import { UI_PurchaseOrder, UI_Supplier } from '@/types/catalog';
import { toast } from 'react-toastify';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function PurchasesPage() {
  const t = useTranslations('StoreHub');
  const { products, supplies } = useCatalog();
  
  const [orders, setOrders] = useState<UI_PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<UI_Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Order Modal State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<CreatePurchaseOrderRequest>>({ items: [] });
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemCost, setItemCost] = useState<number>(0);

  // Receive Order Modal State
  const [receivingOrder, setReceivingOrder] = useState<UI_PurchaseOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'CREDIT'>('CASH');
  const [payFromCashRegister, setPayFromCashRegister] = useState(true);
  
  const catalogItems = [...products, ...supplies];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, suppliersRes] = await Promise.all([
        purchaseOrderService.getPurchaseOrders(0, 100),
        supplierService.getSuppliers(0, 100)
      ]);
      setOrders(ordersRes.content);
      setSuppliers(suppliersRes.content);
    } catch (error) {
      toast.error('Error al cargar datos', { theme: 'colored' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedCatalogItemId || itemQuantity <= 0 || itemCost < 0) return;
    
    const currentItems = newOrder.items || [];
    setNewOrder({
      ...newOrder,
      items: [
        ...currentItems,
        { catalogItemId: parseInt(selectedCatalogItemId), quantity: itemQuantity, unitCost: itemCost }
      ]
    });
    
    // Reset inputs
    setSelectedCatalogItemId('');
    setItemQuantity(1);
    setItemCost(0);
  };

  const handleCreateOrder = async () => {
    if (!newOrder.supplierId || !newOrder.items || newOrder.items.length === 0) {
      toast.error('Selecciona un proveedor y al menos un ítem', { theme: 'colored' });
      return;
    }

    try {
      await purchaseOrderService.createPurchaseOrder(newOrder as CreatePurchaseOrderRequest);
      toast.success('Orden de compra creada', { theme: 'colored' });
      setIsNewOrderModalOpen(false);
      setNewOrder({ items: [] });
      fetchData();
    } catch (error) {
      toast.error('Error al crear orden de compra', { theme: 'colored' });
    }
  };

  const handleReceiveOrder = async () => {
    if (!receivingOrder) return;

    try {
      // 1. Recibir la orden (aumenta stock en Backend)
      await purchaseOrderService.receivePurchaseOrder(receivingOrder.id, paymentMethod);
      
      // 2. Integración con Caja Chica
      if (paymentMethod === 'CASH' && payFromCashRegister) {
        try {
          await paymentService.registerManualExpense({
            description: `Pago Orden de Compra #${receivingOrder.id} a ${receivingOrder.supplier.name}`,
            amount: receivingOrder.totalAmount,
            expenseDenominations: {} // Se deduce en general del Expected Balance, o podríamos pedir desglose. Por simplicidad, sin desglose.
          });
          toast.success('Stock actualizado y pago registrado en Caja', { theme: 'colored' });
        } catch (cashError) {
          toast.warning('El stock se actualizó, pero hubo un error al registrar el gasto en Caja Chica', { theme: 'colored' });
        }
      } else {
        toast.success('Stock actualizado correctamente', { theme: 'colored' });
      }

      setReceivingOrder(null);
      fetchData();
    } catch (error) {
      toast.error('Error al recibir la orden', { theme: 'colored' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT': return <Badge className="bg-blue-100 text-blue-700">Enviada</Badge>;
      case 'RECEIVED': return <Badge className="bg-emerald-100 text-emerald-700">Recibida</Badge>;
      case 'CANCELLED': return <Badge className="bg-red-100 text-red-700">Cancelada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-medical-50 text-medical-600 rounded-2xl border border-medical-100 shadow-inner">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Órdenes de Compra
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Gestiona el abastecimiento de insumos y productos para tu clínica.
            </p>
          </div>
        </div>
        <Button 
          className="bg-medical-600 hover:bg-medical-700 text-white shadow-md rounded-xl"
          onClick={() => setIsNewOrderModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle>Historial de Órdenes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center"><QhSpinner /></div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No hay órdenes de compra registradas.</div>
          ) : (
            <div className="divide-y">
              {orders.map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h4 className="font-bold text-slate-900">Orden #{order.id} - {order.supplier.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(order.orderDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} • {order.items.length} ítems • Total: ${order.totalAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    
                    {order.status === 'SENT' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setReceivingOrder(order)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Recibir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Order Modal */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Proveedor *</label>
              <Select onValueChange={(val) => setNewOrder({...newOrder, supplierId: parseInt(val)})}>
                <SelectTrigger><SelectValue placeholder="Selecciona un proveedor" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 border p-4 rounded-xl">
              <h4 className="font-semibold mb-2">Agregar Ítems</h4>
              <div className="flex gap-2">
                <Select value={selectedCatalogItemId} onValueChange={setSelectedCatalogItemId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Buscar en catálogo..." /></SelectTrigger>
                  <SelectContent>
                    {catalogItems.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name} ({i.stockQuantity} en stock)</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Cant." className="w-24" value={itemQuantity} onChange={e => setItemQuantity(parseInt(e.target.value))} />
                <Input type="number" placeholder="Costo Unit." className="w-32" value={itemCost} onChange={e => setItemCost(parseFloat(e.target.value))} />
                <Button onClick={handleAddItem}><Plus className="w-4 h-4" /></Button>
              </div>

              {newOrder.items && newOrder.items.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-bold text-slate-500">Ítems a Pedir:</h5>
                  {newOrder.items.map((item, idx) => {
                    const catItem = catalogItems.find(c => c.id === item.catalogItemId);
                    return (
                      <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                        <span>{item.quantity}x {catItem?.name}</span>
                        <span className="font-medium">${(item.quantity * item.unitCost).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="text-right font-black text-lg pt-2 border-t">
                    Total: ${newOrder.items.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderModalOpen(false)}>Cancelar</Button>
            <Button className="bg-medical-600 text-white" onClick={handleCreateOrder}>Emitir Orden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Order Modal */}
      {receivingOrder && (
        <Dialog open={!!receivingOrder} onOpenChange={(open) => !open && setReceivingOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recibir Orden de Compra</DialogTitle>
              <DialogDescription>
                Confirma la recepción de los insumos. Esto sumará el inventario a tu catálogo automáticamente.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border">
                <p className="font-medium">Total a Pagar: <span className="font-black text-xl text-slate-900">${receivingOrder.totalAmount}</span></p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Método de Pago</label>
                <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia / Tarjeta</SelectItem>
                    <SelectItem value="CREDIT">A Crédito (Pendiente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="deductCash" 
                    checked={payFromCashRegister} 
                    onChange={e => setPayFromCashRegister(e.target.checked)} 
                    className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="deductCash" className="font-medium text-sm">
                    Registrar automáticamente como una Salida de Efectivo en mi Caja Registradora Activa
                  </label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReceivingOrder(null)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleReceiveOrder}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Recepción
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
