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
      toast.error('ERROR EN CONEXIÓN CON SERVIDOR', { theme: 'colored' });
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
      toast.error('EL NOMBRE DE LA ENTIDAD ES REQUERIDO', { theme: 'colored' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingSupplier.id) {
        await supplierService.updateSupplier(editingSupplier.id, editingSupplier);
        toast.success('REGISTRO DE PROVEEDOR ACTUALIZADO', { theme: 'colored' });
      } else {
        await supplierService.createSupplier(editingSupplier);
        toast.success('ENTIDAD PROVEEDORA REGISTRADA', { theme: 'colored' });
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('FALLO AL ACTUALIZAR EL REGISTRO', { theme: 'colored' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿CONFIRMA LA ELIMINACIÓN PERMANENTE DE ESTE PROVEEDOR DEL DIRECTORIO?')) return;
    
    try {
      await supplierService.deleteSupplier(id);
      toast.success('REGISTRO ELIMINADO', { theme: 'colored' });
      fetchSuppliers();
    } catch (error) {
      toast.error('FALLO AL ELIMINAR EL REGISTRO', { theme: 'colored' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER ARQUITECTÓNICO --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Directorio Operativo
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                BASE DE PROVEEDORES
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                GESTIÓN DE ENTIDADES COMERCIALES Y CONTACTOS DE ABASTECIMIENTO.
              </p>
            </div>
          </div>
          <button 
            className="w-full md:w-auto h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
            onClick={() => { setEditingSupplier({}); setIsModalOpen(true); }}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> NUEVO REGISTRO
          </button>
        </div>

        {/* --- PANEL DE BÚSQUEDA Y LISTADO --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 flex flex-col transition-colors rounded-none overflow-hidden">
          
          {/* Header Búsqueda */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
            <div className="p-6 md:p-8 flex-1 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                DIRECTORIO B2B
              </h2>
            </div>
            <div className="relative w-full md:w-96 flex-shrink-0">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
              <input 
                placeholder="BUSCAR IDENTIFICADOR O ENTIDAD..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 pl-14 pr-6 bg-transparent border-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Listado Técnico */}
          <div className="flex-1 bg-white dark:bg-[#0a0a0a]">
            {isLoading ? (
              <div className="p-24 flex flex-col justify-center items-center">
                <QhSpinner size="lg" className="text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
                  Sincronizando Base de Datos...
                </p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-24 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                  CERO REGISTROS ENCONTRADOS
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
                  MODIFIQUE LOS PARÁMETROS DE BÚSQUEDA O INGRESE UNA NUEVA ENTIDAD AL SISTEMA.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/10 dark:divide-white/10">
                {filteredSuppliers.map((supplier: any) => (
                  <div key={supplier.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                    <div className="flex items-start sm:items-center gap-5">
                      <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#0a0a0a] transition-colors">
                        <Building2 className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white mb-2">
                          {supplier.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          {supplier.contactName && (
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" strokeWidth={1.5}/> {supplier.contactName}</span>
                          )}
                          {supplier.phone && (
                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" strokeWidth={1.5}/> {supplier.phone}</span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" strokeWidth={1.5}/> {supplier.email}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0 w-full md:w-auto shrink-0 border border-black/20 dark:border-white/20">
                      <button 
                        onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                        className="flex-1 md:flex-none h-10 w-12 flex items-center justify-center border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(supplier.id)}
                        className="flex-1 md:flex-none h-10 w-12 flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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
          <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                    Ficha de Directorio B2B
                  </p>
                  <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                    {editingSupplier.id ? 'EDITAR ENTIDAD' : 'ALTA DE ENTIDAD'}
                  </DialogTitle>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0 disabled:opacity-50">
                <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
              </button>
            </div>

            {/* Formulario (Grid Blueprint) */}
            <div className="flex flex-col bg-gray-50 dark:bg-[#050505] overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
                    NOMBRE COMERCIAL O RAZÓN SOCIAL *
                  </label>
                  <input 
                    value={editingSupplier.name || ''} 
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })} 
                    placeholder="EJ. DISTRIBUIDORA NACIONAL SA DE CV"
                    className="w-full h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400"
                    disabled={isSaving}
                  />
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
                    REPRESENTANTE / CONTACTO
                  </label>
                  <input 
                    value={editingSupplier.contactName || ''} 
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactName: e.target.value })} 
                    placeholder="EJ. LIC. PÉREZ"
                    className="w-full h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400"
                    disabled={isSaving}
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">3</span>
                    NÚMERO TELEFÓNICO
                  </label>
                  <input 
                    value={editingSupplier.phone || ''} 
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} 
                    placeholder="EJ. +52 555 123 4567"
                    className="w-full h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400"
                    disabled={isSaving}
                  />
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">4</span>
                    CORREO ELECTRÓNICO (FACTURACIÓN/VENTAS)
                  </label>
                  <input 
                    type="email"
                    value={editingSupplier.email || ''} 
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })} 
                    placeholder="EJ. VENTAS@ENTIDAD.COM"
                    className="w-full h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400"
                    disabled={isSaving}
                  />
                </div>

              </div>
            </div>

            {/* Footer de Comandos */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto disabled:opacity-50"
              >
                ANULAR
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving || !editingSupplier.name}
                className="h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
              >
                {isSaving ? <><QhSpinner size="sm" className="text-current" /> PROCESANDO...</> : <><Save className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR REGISTRO</>}
              </button>
            </div>

          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}