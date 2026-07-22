"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

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
 
 const [{ orders, suppliers, isLoading, isNewOrderModalOpen, newOrder, selectedCatalogItemId, itemQuantity, itemCost, receivingOrder, paymentMethod, payFromCashRegister }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_ORDERS': return { ...state, orders: typeof action.payload === 'function' ? action.payload(state.orders) : action.payload };
 case 'SET_SUPPLIERS': return { ...state, suppliers: typeof action.payload === 'function' ? action.payload(state.suppliers) : action.payload };
 case 'SET_ISLOADING': return { ...state, isLoading: typeof action.payload === 'function' ? action.payload(state.isLoading) : action.payload };
 case 'SET_ISNEWORDERMODALOPEN': return { ...state, isNewOrderModalOpen: typeof action.payload === 'function' ? action.payload(state.isNewOrderModalOpen) : action.payload };
 case 'SET_NEWORDER': return { ...state, newOrder: typeof action.payload === 'function' ? action.payload(state.newOrder) : action.payload };
 case 'SET_SELECTEDCATALOGITEMID': return { ...state, selectedCatalogItemId: typeof action.payload === 'function' ? action.payload(state.selectedCatalogItemId) : action.payload };
 case 'SET_ITEMQUANTITY': return { ...state, itemQuantity: typeof action.payload === 'function' ? action.payload(state.itemQuantity) : action.payload };
 case 'SET_ITEMCOST': return { ...state, itemCost: typeof action.payload === 'function' ? action.payload(state.itemCost) : action.payload };
 case 'SET_RECEIVINGORDER': return { ...state, receivingOrder: typeof action.payload === 'function' ? action.payload(state.receivingOrder) : action.payload };
 case 'SET_PAYMENTMETHOD': return { ...state, paymentMethod: typeof action.payload === 'function' ? action.payload(state.paymentMethod) : action.payload };
 case 'SET_PAYFROMCASHREGISTER': return { ...state, payFromCashRegister: typeof action.payload === 'function' ? action.payload(state.payFromCashRegister) : action.payload };
 default: return state;
 }
 },
 {
 orders: [], suppliers: [], isLoading: true, isNewOrderModalOpen: false, newOrder: { items: [] }, selectedCatalogItemId: '', itemQuantity: '', itemCost: '', receivingOrder: null, paymentMethod: 'CASH', payFromCashRegister: true
 }
 );

 const setOrders = (val: any) => dispatch({ type: 'SET_ORDERS', payload: val });
 const setSuppliers = (val: any) => dispatch({ type: 'SET_SUPPLIERS', payload: val });
 const setIsLoading = (val: any) => dispatch({ type: 'SET_ISLOADING', payload: val });
 const setIsNewOrderModalOpen = (val: any) => dispatch({ type: 'SET_ISNEWORDERMODALOPEN', payload: val });
 const setNewOrder = (val: any) => dispatch({ type: 'SET_NEWORDER', payload: val });
 const setSelectedCatalogItemId = (val: any) => dispatch({ type: 'SET_SELECTEDCATALOGITEMID', payload: val });
 const setItemQuantity = (val: any) => dispatch({ type: 'SET_ITEMQUANTITY', payload: val });
 const setItemCost = (val: any) => dispatch({ type: 'SET_ITEMCOST', payload: val });
 const setReceivingOrder = (val: any) => dispatch({ type: 'SET_RECEIVINGORDER', payload: val });
 const setPaymentMethod = (val: any) => dispatch({ type: 'SET_PAYMENTMETHOD', payload: val });
 const setPayFromCashRegister = (val: any) => dispatch({ type: 'SET_PAYFROMCASHREGISTER', payload: val });

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
 toast.error('Error de lectura en servidor', { theme: 'colored' });
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
 toast.error('Datos incompletos: Proveedor e ítems requeridos', { theme: 'colored' });
 return;
 }

 try {
 await purchaseOrderService.createPurchaseOrder(newOrder as CreatePurchaseOrderRequest);
 toast.success('Orden de compra emitida', { theme: 'colored' });
 setIsNewOrderModalOpen(false);
 setNewOrder({ items: [] });
 fetchData();
 } catch (error) {
 toast.error('Error en emisión de orden', { theme: 'colored' });
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
 description: `Pago O.C. #${receivingOrder.id} - ${receivingOrder.supplier.name}`,
 amount: receivingOrder.totalAmount,
 expenseDenominations: {} 
 });
 toast.success('Inventario auditado y gasto registrado', { theme: 'colored' });
 } catch (cashError) {
 toast.warning('Inventario OK. Fallo al registrar gasto en caja.', { theme: 'colored' });
 }
 } else {
 toast.success('Recepción de inventario completada', { theme: 'colored' });
 }

 setReceivingOrder(null);
 fetchData();
 } catch (error) {
 toast.error('Error al procesar recepción', { theme: 'colored' });
 }
 };

 const getStatusBadge = (status: string) => {
 switch (status) {
 case 'SENT': return <span className="border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"><Truck className="w-3.5 h-3.5" strokeWidth={2} /> Enviada</span>;
 case 'RECEIVED': return <span className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Recibida</span>;
 case 'CANCELLED': return <span className="border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"><XCircle className="w-3.5 h-3.5" strokeWidth={2} /> Cancelada</span>;
 default: return <span className="border border-gray-200 bg-gray-50 dark:bg-[#111] dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-xs font-bold shadow-sm">{status}</span>;
 }
 };

 return (
 <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors duration-500">
 <div className="max-w-7xl mx-auto space-y-8">
 
 {/* --- HEADER --- */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
 <PackagePlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Logística y Abastecimiento
 </p>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 Órdenes de Compra
 </h1>
 </div>
 </div>
 <button 
 className="w-full md:w-auto h-12 px-6 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm font-bold transition-colors rounded-xl border-0 shadow-sm"
 onClick={() => setIsNewOrderModalOpen(true)}
 >
 <Plus className="w-4 h-4" strokeWidth={2} /> Emitir Orden
 </button>
 </div>

 {/* --- HISTORIAL DE ÓRDENES --- */}
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl overflow-hidden shadow-sm">
 <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <h2 className="text-sm font-bold text-gray-900 dark:text-white">
 Registro Logístico
 </h2>
 </div>
 
 {isLoading ? (
 <div className="p-24 flex flex-col justify-center items-center">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
 Extrayendo registros...
 </p>
 </div>
 ) : orders.length === 0 ? (
 <div className="p-24 flex flex-col justify-center items-center text-center">
 <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-6">
 <ShoppingCart className="w-6 h-6 text-gray-400" strokeWidth={2} />
 </div>
 <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
 Libro de Órdenes Vacío
 </p>
 <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed">
 Aún no se han registrado órdenes de abastecimiento en el sistema.
 </p>
 </div>
 ) : (
 <div className="divide-y divide-gray-100 dark:divide-gray-800">
 {orders.map((order: any) => (
 <div key={order.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group cursor-default">
 <div className="flex items-start sm:items-center gap-5">
 <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors shadow-sm">
 <ShoppingCart className="w-5 h-5 text-gray-500" strokeWidth={2} />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-3 mb-1.5">
 <h4 className="font-bold text-sm text-gray-900 dark:text-white">
 DOC-{order.id.toString().padStart(4, '0')}
 </h4>
 {getStatusBadge(order.status)}
 </div>
 <p className="text-xs font-semibold text-gray-500 mb-2">
 Proveedor: <span className="text-gray-900 dark:text-white font-bold">{order.supplier.name}</span>
 </p>
 <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
 <span className="bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded-md font-semibold text-gray-600 dark:text-gray-400">
 {new Date(order.orderDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
 </span>
 <span>•</span>
 <span className="font-semibold">{order.items.length} ítems</span>
 <span>•</span>
 <span className="text-gray-900 dark:text-white font-bold">Total: ${order.totalAmount.toFixed(2)}</span>
 </div>
 </div>
 </div>
 
 <div className="shrink-0 flex justify-end w-full md:w-auto">
 {order.status === 'SENT' && (
 <button 
 onClick={() => setReceivingOrder(order)}
 className="h-10 px-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-colors text-xs font-bold flex items-center gap-2 shadow-sm"
 >
 <Truck className="w-4 h-4" strokeWidth={2} /> Auditar Recepción
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
 <DialogContent className="sm:max-w-4xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
 
 <div className="flex items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <PackagePlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Documento de Abastecimiento
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 Emisión de Orden de Compra
 </DialogTitle>
 </div>
 </div>
 <button onClick={() => setIsNewOrderModalOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
 <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-[#050505]/50 flex flex-col gap-4 p-6 md:p-8">
 
 {/* Proveedor */}
 <div className="p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
 <span className="w-5 h-5 rounded-md flex items-center justify-center bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 font-bold">1</span>
 Selección de Proveedor *
 </label>
 <Select onValueChange={(val) => setNewOrder({...newOrder, supplierId: parseInt(val)})}>
 <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-sm">
 <SelectValue placeholder="Seleccionar entidad..." />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
 {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id.toString()} className="text-sm font-semibold rounded-lg">{s.name}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>

 {/* Grid Controlador de Ítems */}
 <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
 <span className="w-5 h-5 rounded-md flex items-center justify-center bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400 font-bold">2</span>
 Ingresar Partidas al Documento
 </label>
 
 <div className="flex flex-col md:flex-row gap-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
 <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
 <Select value={selectedCatalogItemId} onValueChange={setSelectedCatalogItemId}>
 <SelectTrigger className="w-full h-12 bg-gray-50 dark:bg-[#050505] border-0 text-sm font-semibold text-gray-900 dark:text-white focus:ring-0 rounded-none">
 <SelectValue placeholder="Seleccionar ítem del catálogo..." />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
 {catalogItems.map(i => <SelectItem key={i.id} value={i.id.toString()} className="text-sm font-semibold rounded-lg">{i.name} (Disp: {i.stockQuantity})</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="w-full md:w-28 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
 <input 
 type="number" 
 placeholder="Cant." 
 className="w-full h-12 bg-gray-50 dark:bg-[#050505] border-0 text-sm font-semibold text-gray-900 dark:text-white text-center focus:outline-none focus:ring-0 placeholder:text-gray-400" 
 value={itemQuantity} 
 onChange={e => setItemQuantity(e.target.value ? parseInt(e.target.value) : '')} 
 />
 </div>
 <div className="w-full md:w-36 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 relative">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
 <input 
 type="number" 
 placeholder="Costo U." 
 className="w-full h-12 pl-7 pr-2 bg-gray-50 dark:bg-[#050505] border-0 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400" 
 value={itemCost} 
 onChange={e => setItemCost(e.target.value ? parseFloat(e.target.value) : '')} 
 />
 </div>
 <button 
 onClick={handleAddItem}
 className="h-12 w-full md:w-16 bg-gray-100 text-gray-700 dark:bg-[#111] dark:text-gray-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors shrink-0"
 >
 <Plus className="w-5 h-5" strokeWidth={2} />
 </button>
 </div>
 
 {/* Lista de Ítems (Hoja de Cálculo) */}
 {newOrder.items && newOrder.items.length > 0 && (
 <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
 <table className="w-full text-left">
 <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-700">
 <tr>
 <th className="px-4 py-3 text-xs font-bold text-gray-500">Cant</th>
 <th className="px-4 py-3 text-xs font-bold text-gray-500">Concepto</th>
 <th className="px-4 py-3 text-xs font-bold text-gray-500 text-right">C. Unit</th>
 <th className="px-4 py-3 text-xs font-bold text-gray-500 text-right">Subtotal</th>
 <th className="px-4 py-3 w-12"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
 {newOrder.items.map((item: any, idx: number) => {
 const catItem = catalogItems.find(c => c.id === item.catalogItemId);
 return (
 <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors">
 <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</td>
 <td className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{catItem?.name}</td>
 <td className="px-4 py-3 text-sm font-mono font-medium text-gray-600 dark:text-gray-400 text-right">${item.unitCost.toFixed(2)}</td>
 <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">${(item.quantity * item.unitCost).toFixed(2)}</td>
 <td className="px-4 py-3 text-center">
 <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
 <X className="w-4 h-4" strokeWidth={2} />
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 <tfoot className="bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-gray-700">
 <tr>
 <td colSpan={3} className="px-4 py-4 text-xs font-bold text-gray-500 text-right uppercase tracking-wider">Total Proyectado</td>
 <td className="px-4 py-4 text-xl font-bold text-emerald-600 dark:text-emerald-400 text-right">
 ${newOrder.items.reduce((acc: number, curr: any) => acc + (curr.quantity * curr.unitCost), 0).toFixed(2)}
 </td>
 <td></td>
 </tr>
 </tfoot>
 </table>
 </div>
 )}
 </div>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setIsNewOrderModalOpen(false)}
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold shadow-sm w-full sm:w-auto"
 >
 Cancelar Emisión
 </button>
 <button 
 onClick={handleCreateOrder}
 className="h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm border-0 w-full sm:w-auto"
 >
 <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Confirmar Documento
 </button>
 </div>
 </DialogContent>
 </Dialog>

 {/* --- MODAL RECIBIR ORDEN --- */}
 {receivingOrder && (
 <Dialog open={!!receivingOrder} onOpenChange={(open) => !open && setReceivingOrder(null)}>
 <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
 
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Auditoría Logística • DOC-{receivingOrder.id.toString().padStart(4, '0')}
 </p>
 <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-2">
 Recepción de Insumos
 </DialogTitle>
 </div>
 </div>
 </div>

 <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 p-6 md:p-8 gap-4">
 
 <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between shadow-sm">
 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Liquidación de Orden</span>
 <span className="text-2xl font-bold text-gray-900 dark:text-white">${receivingOrder.totalAmount.toFixed(2)}</span>
 </div>

 <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
 <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> Método de Pago Operativo
 </label>
 <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
 <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
 <SelectItem value="CASH" className="text-sm font-semibold rounded-lg">Efectivo (Caja Chica)</SelectItem>
 <SelectItem value="TRANSFER" className="text-sm font-semibold rounded-lg">Transferencia / Electrónico</SelectItem>
 <SelectItem value="CREDIT" className="text-sm font-semibold rounded-lg">A Crédito (Cuenta por Pagar)</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {paymentMethod === 'CASH' && (
 <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
 <div className="relative flex items-start mt-0.5">
 <input 
 type="checkbox" 
 id="deductCash" 
 checked={payFromCashRegister} 
 onChange={e => setPayFromCashRegister(e.target.checked)} 
 className="w-5 h-5 rounded-md border-amber-300 bg-white dark:bg-[#0a0a0a] checked:bg-amber-500 dark:checked:bg-amber-600 checked:border-amber-500 focus:ring-amber-500/20 cursor-pointer appearance-none transition-colors"
 />
 {payFromCashRegister && <CheckCircle2 className="w-3 h-3 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={3} />}
 </div>
 <label htmlFor="deductCash" className="text-xs font-semibold text-amber-800 dark:text-amber-400 cursor-pointer leading-relaxed">
 Deducir automáticamente como "Salida de Efectivo" en la caja registradora activa.
 </label>
 </div>
 )}
 
 <DialogDescription className="text-sm font-medium text-gray-500 leading-relaxed text-center mt-2">
 Confirme la entrada física para actualizar el stock del catálogo.
 </DialogDescription>
 </div>

 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setReceivingOrder(null)}
 className="w-full sm:w-auto h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold shadow-sm"
 >
 Posponer Auditoría
 </button>
 <button 
 onClick={handleReceiveOrder}
 className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm border-0"
 >
 <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Confirmar Ingreso de Stock
 </button>
 </div>
 </DialogContent>
 </Dialog>
 )}

 </div>
 </div>
 );
}