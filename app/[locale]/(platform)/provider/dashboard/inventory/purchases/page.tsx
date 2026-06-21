"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Plus, Search, Eye, CheckCircle2, XCircle, PackagePlus, AlertCircle, X, Truck, Banknote } from 'lucide-react';
import { purchaseOrderService, CreatePurchaseOrderRequest } from '@/services/purchase-order.service';
import { supplierService } from '@/services/supplier.service';
import { paymentService } from '@/services/payment.service';
import { useCatalog } from '@/hooks/useCatalog';
import { UI_PurchaseOrder, UI_Supplier } from '@/types/catalog';
import { toast } from 'react-toastify';

import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

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
  const [itemQuantity, setItemQuantity] = useState<number | ''>('');
  const [itemCost, setItemCost] = useState<number | ''>('');

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
      toast.error('ERROR DE LECTURA EN SERVIDOR', { theme: 'colored' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedCatalogItemId || !itemQuantity || !itemCost || itemQuantity <= 0 || itemCost < 0) return;
    
    const currentItems = newOrder.items || [];
    setNewOrder({
      ...newOrder,
      items: [
        ...currentItems,
        { catalogItemId: parseInt(selectedCatalogItemId), quantity: Number(itemQuantity), unitCost: Number(itemCost) }
      ]
    });
    
    // Reset inputs
    setSelectedCatalogItemId('');
    setItemQuantity('');
    setItemCost('');
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = [...(newOrder.items || [])];
    currentItems.splice(index, 1);
    setNewOrder({ ...newOrder, items: currentItems });
  };

  const handleCreateOrder = async () => {
    if (!newOrder.supplierId || !newOrder.items || newOrder.items.length === 0) {
      toast.error('DATOS INCOMPLETOS: PROVEEDOR E ÍTEMS REQUERIDOS', { theme: 'colored' });
      return;
    }

    try {
      await purchaseOrderService.createPurchaseOrder(newOrder as CreatePurchaseOrderRequest);
      toast.success('ORDEN DE COMPRA EMITIDA', { theme: 'colored' });
      setIsNewOrderModalOpen(false);
      setNewOrder({ items: [] });
      fetchData();
    } catch (error) {
      toast.error('ERROR EN EMISIÓN DE ORDEN', { theme: 'colored' });
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
            description: `PAGO O.C. #${receivingOrder.id} - ${receivingOrder.supplier.name}`,
            amount: receivingOrder.totalAmount,
            expenseDenominations: {} 
          });
          toast.success('INVENTARIO AUDITADO Y GASTO REGISTRADO', { theme: 'colored' });
        } catch (cashError) {
          toast.warning('INVENTARIO OK. FALLO AL REGISTRAR GASTO EN CAJA.', { theme: 'colored' });
        }
      } else {
        toast.success('RECEPCIÓN DE INVENTARIO COMPLETADA', { theme: 'colored' });
      }

      setReceivingOrder(null);
      fetchData();
    } catch (error) {
      toast.error('ERROR AL PROCESAR RECEPCIÓN', { theme: 'colored' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT': return <span className="border border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Truck className="w-3 h-3" strokeWidth={1.5} /> ENVIADA</span>;
      case 'RECEIVED': return <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> RECIBIDA</span>;
      case 'CANCELLED': return <span className="border border-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><XCircle className="w-3 h-3" strokeWidth={1.5} /> CANCELADA</span>;
      default: return <span className="border border-gray-500/30 bg-gray-50 dark:bg-[#111] text-gray-600 dark:text-gray-400 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER ARQUITECTÓNICO --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <PackagePlus className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Logística y Abastecimiento
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                ÓRDENES DE COMPRA
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                GESTIÓN DE INVENTARIO Y RECEPCIÓN DE INSUMOS.
              </p>
            </div>
          </div>
          <button 
            className="w-full md:w-auto h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
            onClick={() => setIsNewOrderModalOpen(true)}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> EMITIR ORDEN
          </button>
        </div>

        {/* --- HISTORIAL DE ÓRDENES --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 flex flex-col transition-colors rounded-none overflow-hidden">
          <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
              REGISTRO LOGÍSTICO
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-24 flex flex-col justify-center items-center">
              <QhSpinner size="lg" className="text-black dark:text-white" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
                EXTRAYENDO REGISTROS...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-24 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
                <ShoppingCart className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                LIBRO DE ÓRDENES VACÍO
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
                AÚN NO SE HAN REGISTRADO ÓRDENES DE ABASTECIMIENTO EN EL SISTEMA.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10 dark:divide-white/10">
              {orders.map(order => (
                <div key={order.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                  <div className="flex items-start sm:items-center gap-5">
                    <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors">
                      <ShoppingCart className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h4 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white">
                          DOC-{order.id.toString().padStart(4, '0')}
                        </h4>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        PROVEEDOR: <span className="text-black dark:text-white">{order.supplier.name}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                        <span className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5">
                          {new Date(order.orderDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span>{order.items.length} ÍTEMS</span>
                        <span className="text-black dark:text-white font-semibold">TOTAL: ${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex justify-end w-full md:w-auto">
                    {order.status === 'SENT' && (
                      <button 
                        onClick={() => setReceivingOrder(order)}
                        className="h-10 px-6 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none"
                      >
                        <Truck className="w-3.5 h-3.5" strokeWidth={1.5} /> AUDITAR RECEPCIÓN
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- MODAL NUEVA ORDEN --- */}
        <Dialog open={isNewOrderModalOpen} onOpenChange={(open) => !open && setIsNewOrderModalOpen(false)}>
          <DialogContent className="sm:max-w-4xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                  <PackagePlus className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Documento de Abastecimiento
                  </p>
                  <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                    EMISIÓN DE ORDEN DE COMPRA
                  </DialogTitle>
                </div>
              </div>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0">
                <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col">
              
              {/* Proveedor */}
              <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
                  SELECCIÓN DE PROVEEDOR *
                </label>
                <Select onValueChange={(val) => setNewOrder({...newOrder, supplierId: parseInt(val)})}>
                  <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:ring-0 focus:border-black rounded-none">
                    <SelectValue placeholder="SELECCIONAR ENTIDAD..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-xl">
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()} className="text-[10px] font-bold uppercase tracking-widest rounded-none">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid Controlador de Ítems */}
              <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
                  INGRESAR PARTIDAS AL DOCUMENTO
                </label>
                
                <div className="flex flex-col md:flex-row gap-0 border border-black/20 dark:border-white/20">
                  <div className="flex-1 border-b md:border-b-0 md:border-r border-black/20 dark:border-white/20">
                    <Select value={selectedCatalogItemId} onValueChange={setSelectedCatalogItemId}>
                      <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-[#050505] border-0 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest focus:ring-0 rounded-none">
                        <SelectValue placeholder="SELECCIONAR ÍTEM DEL CATÁLOGO..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-xl">
                        {catalogItems.map(i => <SelectItem key={i.id} value={i.id.toString()} className="text-[9px] font-bold uppercase tracking-widest rounded-none">{i.name} (DISP: {i.stockQuantity})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-24 border-b md:border-b-0 md:border-r border-black/20 dark:border-white/20">
                    <input 
                      type="number" 
                      placeholder="CANT." 
                      className="w-full h-14 bg-gray-50 dark:bg-[#050505] border-0 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest text-center focus:outline-none focus:ring-0 placeholder:text-gray-400" 
                      value={itemQuantity} 
                      onChange={e => setItemQuantity(e.target.value ? parseInt(e.target.value) : '')} 
                    />
                  </div>
                  <div className="w-full md:w-32 border-b md:border-b-0 md:border-r border-black/20 dark:border-white/20 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="COSTO U." 
                      className="w-full h-14 pl-6 pr-2 bg-gray-50 dark:bg-[#050505] border-0 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 placeholder:text-gray-400" 
                      value={itemCost} 
                      onChange={e => setItemCost(e.target.value ? parseFloat(e.target.value) : '')} 
                    />
                  </div>
                  <button 
                    onClick={handleAddItem}
                    className="h-14 w-full md:w-16 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Lista de Ítems (Hoja de Cálculo) */}
              {newOrder.items && newOrder.items.length > 0 && (
                <div className="bg-white dark:bg-[#0a0a0a] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">CANT</th>
                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">CONCEPTO</th>
                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">C. UNIT</th>
                        <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">SUBTOTAL</th>
                        <th className="px-6 py-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                      {newOrder.items.map((item, idx) => {
                        const catItem = catalogItems.find(c => c.id === item.catalogItemId);
                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                            <td className="px-6 py-4 text-xs font-semibold text-black dark:text-white">{item.quantity}</td>
                            <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{catItem?.name}</td>
                            <td className="px-6 py-4 text-xs font-mono text-gray-600 dark:text-gray-400 text-right">${item.unitCost.toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm font-semibold tracking-tight text-black dark:text-white text-right">${(item.quantity * item.unitCost).toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                                <X className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-[#050505] border-t border-black/20 dark:border-white/20">
                      <tr>
                        <td colSpan={3} className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">TOTAL PROYECTADO</td>
                        <td className="px-6 py-6 text-2xl font-semibold tracking-tight text-black dark:text-white text-right">
                          ${newOrder.items.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
              <button 
                onClick={() => setIsNewOrderModalOpen(false)}
                className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
              >
                ANULAR EMISIÓN
              </button>
              <button 
                onClick={handleCreateOrder}
                className="h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR DOCUMENTO
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- MODAL RECIBIR ORDEN --- */}
        {receivingOrder && (
          <Dialog open={!!receivingOrder} onOpenChange={(open) => !open && setReceivingOrder(null)}>
            <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
              
              <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Auditoría Logística • DOC-{receivingOrder.id.toString().padStart(4, '0')}
                    </p>
                    <DialogTitle className="text-xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-2">
                      RECEPCIÓN DE INSUMOS
                    </DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
                      CONFIRME LA ENTRADA FÍSICA PARA ACTUALIZAR EL STOCK DEL CATÁLOGO.
                    </DialogDescription>
                  </div>
                </div>
              </div>

              <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
                
                <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">LIQUIDACIÓN DE ORDEN</span>
                  <span className="text-3xl font-semibold tracking-tight text-black dark:text-white">${receivingOrder.totalAmount.toFixed(2)}</span>
                </div>

                <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <Banknote className="w-3.5 h-3.5" strokeWidth={1.5} /> MÉTODO DE PAGO OPERATIVO
                  </label>
                  <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                    <SelectTrigger className="w-full h-14 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-[10px] font-bold text-black dark:text-white uppercase tracking-widest focus:ring-0 focus:border-black rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-xl">
                      <SelectItem value="CASH" className="text-[9px] font-bold uppercase tracking-widest rounded-none">EFECTIVO (CAJA CHICA)</SelectItem>
                      <SelectItem value="TRANSFER" className="text-[9px] font-bold uppercase tracking-widest rounded-none">TRANSFERENCIA / ELECTRÓNICO</SelectItem>
                      <SelectItem value="CREDIT" className="text-[9px] font-bold uppercase tracking-widest rounded-none">A CRÉDITO (CUENTA POR PAGAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'CASH' && (
                  <div className="p-6 md:p-8 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500 flex items-start gap-4">
                    <div className="relative flex items-start mt-0.5">
                      <input 
                        type="checkbox" 
                        id="deductCash" 
                        checked={payFromCashRegister} 
                        onChange={e => setPayFromCashRegister(e.target.checked)} 
                        className="w-5 h-5 border-black/20 bg-white dark:bg-[#0a0a0a] checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white focus:ring-0 focus:ring-offset-0 rounded-none cursor-pointer appearance-none transition-colors"
                      />
                      {payFromCashRegister && <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-black absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={3} />}
                    </div>
                    <label htmlFor="deductCash" className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 cursor-pointer leading-relaxed">
                      DEDUCIR AUTOMÁTICAMENTE COMO "SALIDA DE EFECTIVO" EN LA CAJA REGISTRADORA ACTIVA.
                    </label>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setReceivingOrder(null)}
                  className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none"
                >
                  POSPONER AUDITORÍA
                </button>
                <button 
                  onClick={handleReceiveOrder}
                  className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR INGRESO DE STOCK
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
}