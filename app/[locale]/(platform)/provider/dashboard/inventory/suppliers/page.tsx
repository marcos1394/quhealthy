"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Plus, Search, Edit2, Trash2, Phone, Mail, User, X, Save } from 'lucide-react';
import { supplierService } from '@/services/supplier.service';
import { UI_Supplier } from '@/types/catalog';
import { toast } from 'react-toastify';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

export default function SuppliersPage() {
 const t = useTranslations('StoreHub');
 const [{ suppliers, isLoading, searchQuery, isModalOpen, editingSupplier, isSaving }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_SUPPLIERS': return { ...state, suppliers: typeof action.payload === 'function' ? action.payload(state.suppliers) : action.payload };
 case 'SET_ISLOADING': return { ...state, isLoading: typeof action.payload === 'function' ? action.payload(state.isLoading) : action.payload };
 case 'SET_SEARCHQUERY': return { ...state, searchQuery: typeof action.payload === 'function' ? action.payload(state.searchQuery) : action.payload };
 case 'SET_ISMODALOPEN': return { ...state, isModalOpen: typeof action.payload === 'function' ? action.payload(state.isModalOpen) : action.payload };
 case 'SET_EDITINGSUPPLIER': return { ...state, editingSupplier: typeof action.payload === 'function' ? action.payload(state.editingSupplier) : action.payload };
 case 'SET_ISSAVING': return { ...state, isSaving: typeof action.payload === 'function' ? action.payload(state.isSaving) : action.payload };
 default: return state;
 }
 },
 {
 suppliers: [], isLoading: true, searchQuery: '', isModalOpen: false, editingSupplier: {}, isSaving: false
 }
 );

 const setSuppliers = (val: any) => dispatch({ type: 'SET_SUPPLIERS', payload: val });
 const setIsLoading = (val: any) => dispatch({ type: 'SET_ISLOADING', payload: val });
 const setSearchQuery = (val: any) => dispatch({ type: 'SET_SEARCHQUERY', payload: val });
 const setIsModalOpen = (val: any) => dispatch({ type: 'SET_ISMODALOPEN', payload: val });
 const setEditingSupplier = (val: any) => dispatch({ type: 'SET_EDITINGSUPPLIER', payload: val });
 const setIsSaving = (val: any) => dispatch({ type: 'SET_ISSAVING', payload: val });

 const fetchSuppliers = async () => {
 setIsLoading(true);
 try {
 const res = await supplierService.getSuppliers(0, 100);
 setSuppliers(res.content);
 } catch (error) {
 toast.error('Error en conexión con servidor', { theme: 'colored' });
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 fetchSuppliers();
 }, []);

 const filteredSuppliers = suppliers.filter((s: any) => 
 s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
 (s.contactName && s.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
 );

 const handleSave = async () => {
 if (!editingSupplier.name) {
 toast.error('El nombre de la entidad es requerido', { theme: 'colored' });
 return;
 }

 setIsSaving(true);
 try {
 if (editingSupplier.id) {
 await supplierService.updateSupplier(editingSupplier.id, editingSupplier);
 toast.success('Registro de proveedor actualizado', { theme: 'colored' });
 } else {
 await supplierService.createSupplier(editingSupplier);
 toast.success('Entidad proveedora registrada', { theme: 'colored' });
 }
 setIsModalOpen(false);
 fetchSuppliers();
 } catch (error) {
 toast.error('Fallo al actualizar el registro', { theme: 'colored' });
 } finally {
 setIsSaving(false);
 }
 };

 const handleDelete = async (id: number) => {
 if (!confirm('¿Confirma la eliminación permanente de este proveedor del directorio?')) return;
 
 try {
 await supplierService.deleteSupplier(id);
 toast.success('Registro eliminado', { theme: 'colored' });
 fetchSuppliers();
 } catch (error) {
 toast.error('Fallo al eliminar el registro', { theme: 'colored' });
 }
 };

 return (
 <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors duration-500">
 <div className="max-w-7xl mx-auto space-y-8">
 
 {/* --- HEADER --- */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
 <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Directorio Operativo
 </p>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
 Base de Proveedores
 </h1>
 </div>
 </div>
 <button 
 className="w-full md:w-auto h-12 px-6 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm font-bold transition-colors rounded-xl border-0 shadow-sm"
 onClick={() => { setEditingSupplier({}); setIsModalOpen(true); }}
 >
 <Plus className="w-4 h-4" strokeWidth={2} /> Nuevo Registro
 </button>
 </div>

 {/* --- PANEL DE BÚSQUEDA Y LISTADO --- */}
 <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl overflow-hidden shadow-sm">
 
 {/* Header Búsqueda */}
 <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
 <h2 className="text-sm font-bold text-gray-900 dark:text-white">
 Directorio B2B
 </h2>
 </div>
 <div className="relative w-full md:w-96 flex-shrink-0">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
 <input 
 placeholder="Buscar identificador o entidad..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full h-16 pl-14 pr-6 bg-transparent border-0 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:font-normal"
 />
 </div>
 </div>

 {/* Listado Técnico */}
 <div className="flex-1 bg-white dark:bg-[#0a0a0a]">
 {isLoading ? (
 <div className="p-24 flex flex-col justify-center items-center">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 mt-6 animate-pulse">
 Sincronizando Base de Datos...
 </p>
 </div>
 ) : filteredSuppliers.length === 0 ? (
 <div className="p-24 flex flex-col justify-center items-center text-center">
 <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-6">
 <Building2 className="w-6 h-6 text-gray-400" strokeWidth={2} />
 </div>
 <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
 Cero Registros Encontrados
 </p>
 <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed">
 Modifique los parámetros de búsqueda o ingrese una nueva entidad al sistema.
 </p>
 </div>
 ) : (
 <div className="divide-y divide-gray-100 dark:divide-gray-800">
 {filteredSuppliers.map((supplier: any) => (
 <div key={supplier.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group">
 <div className="flex items-start sm:items-center gap-5">
 <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors shadow-sm">
 <Building2 className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
 </div>
 <div>
 <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
 {supplier.name}
 </h4>
 <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
 {supplier.contactName && (
 <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded-md"><User className="w-3.5 h-3.5" strokeWidth={2}/> {supplier.contactName}</span>
 )}
 {supplier.phone && (
 <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" strokeWidth={2}/> {supplier.phone}</span>
 )}
 {supplier.email && (
 <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" strokeWidth={2}/> {supplier.email}</span>
 )}
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
 <button 
 onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
 className="h-10 px-4 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm"
 >
 <Edit2 className="w-4 h-4 mr-2" strokeWidth={2} /> Editar
 </button>
 <button 
 onClick={() => handleDelete(supplier.id)}
 className="h-10 px-4 rounded-xl flex items-center justify-center border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors shadow-sm"
 >
 <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} /> Borrar
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* --- MODAL FICHA PROVEEDOR --- */}
 <Dialog open={isModalOpen} onOpenChange={(open) => !open && !isSaving && setIsModalOpen(false)}>
 <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
 
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-xs font-semibold text-gray-500 mb-1">
 Ficha de Directorio B2B
 </p>
 <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 {editingSupplier.id ? 'Editar Entidad' : 'Alta de Entidad'}
 </DialogTitle>
 </div>
 </div>
 <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 disabled:opacity-50">
 <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
 </button>
 </div>

 {/* Formulario (Grid Blueprint) */}
 <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 overflow-y-auto max-h-[70vh] custom-scrollbar p-6 md:p-8 gap-4">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 
 <div className="flex flex-col">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
 Nombre Comercial o Razón Social *
 </label>
 <input 
 value={editingSupplier.name || ''} 
 onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })} 
 placeholder="Ej. Distribuidora Nacional SA de CV"
 className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 shadow-sm"
 disabled={isSaving}
 />
 </div>

 <div className="flex flex-col">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
 Representante / Contacto
 </label>
 <input 
 value={editingSupplier.contactName || ''} 
 onChange={(e) => setEditingSupplier({ ...editingSupplier, contactName: e.target.value })} 
 placeholder="Ej. Lic. Pérez"
 className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 shadow-sm"
 disabled={isSaving}
 />
 </div>

 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 
 <div className="flex flex-col">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
 Número Telefónico
 </label>
 <input 
 value={editingSupplier.phone || ''} 
 onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} 
 placeholder="Ej. +52 555 123 4567"
 className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 shadow-sm"
 disabled={isSaving}
 />
 </div>

 <div className="flex flex-col">
 <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
 Correo Electrónico (Facturación/Ventas)
 </label>
 <input 
 type="email"
 value={editingSupplier.email || ''} 
 onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })} 
 placeholder="Ej. ventas@entidad.com"
 className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 shadow-sm"
 disabled={isSaving}
 />
 </div>

 </div>
 </div>

 {/* Footer de Comandos */}
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
 <button 
 onClick={() => setIsModalOpen(false)}
 disabled={isSaving}
 className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold shadow-sm w-full sm:w-auto disabled:opacity-50"
 >
 Cancelar
 </button>
 <button 
 onClick={handleSave} 
 disabled={isSaving || !editingSupplier.name}
 className="h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm border-0 w-full sm:w-auto disabled:opacity-50"
 >
 {isSaving ? <><QhSpinner size="sm" className="text-current" /> Procesando...</> : <><Save className="w-4 h-4" strokeWidth={2} /> Confirmar Registro</>}
 </button>
 </div>

 </DialogContent>
 </Dialog>

 </div>
 </div>
 );
}