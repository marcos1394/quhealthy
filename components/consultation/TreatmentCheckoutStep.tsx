"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { Pill, ShoppingBag, Plus, Trash2, ArrowLeft, CheckCircle, Search, Package, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrescriptionItem } from '@/types/ehr';
import { useCatalog } from '@/hooks/useCatalog';
import { UI_Product } from '@/types/catalog';

interface TreatmentCheckoutStepProps {
  prescription: PrescriptionItem[];
  newRx: { medicationName: string; dosage: string; frequency: string; duration: string; instructions: string; catalogItemId?: number; price?: string | number; frequencyEnum?: string; durationDays?: number | string; quantity?: number };
  setNewRx: (rx: any) => void;
  handleAddRx: () => void;
  removePrescriptionItem: (id: string) => void;
  onBack: () => void;
}

export const TreatmentCheckoutStep: React.FC<TreatmentCheckoutStepProps> = ({
  prescription,
  newRx,
  setNewRx,
  handleAddRx,
  removePrescriptionItem,
  onBack
}) => {
  const t = useTranslations('EHR');
  const { products, isLoading, fetchInventory } = useCatalog();
  
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes((newRx.medicationName || '').toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: UI_Product) => {
    setNewRx({ 
      ...newRx, 
      medicationName: product.name, 
      catalogItemId: product.id,
      price: product.price || 0
    });
    setShowDropdown(false);
  };

  const FREQUENCY_OPTIONS = [
    { value: 'EVERY_4_HOURS', label: 'CADA 4 HORAS', readable: 'CADA 4 HORAS' },
    { value: 'EVERY_6_HOURS', label: 'CADA 6 HORAS', readable: 'CADA 6 HORAS' },
    { value: 'EVERY_8_HOURS', label: 'CADA 8 HORAS', readable: 'CADA 8 HORAS' },
    { value: 'EVERY_12_HOURS', label: 'CADA 12 HORAS', readable: 'CADA 12 HORAS' },
    { value: 'ONCE_DAILY', label: '1 VEZ AL DÍA', readable: '1 VEZ AL DÍA' },
    { value: 'AS_NEEDED', label: 'PRN (SEGÚN NECESIDAD)', readable: 'SEGÚN NECESIDAD (PRN)' },
    { value: 'CUSTOM', label: 'OTRA (PERSONALIZADA)...', readable: '' }
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full transition-colors duration-300">
      
      {/* HEADER ARQUITECTÓNICO */}
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="w-16 h-16 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-6">
          <Pill className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black dark:text-white mb-3">
          {t('digital_prescription_closure', { defaultValue: 'Cierre de Receta Digital' })}
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-lg mx-auto">
          {t('prescription_desc', { defaultValue: 'FORMULE LA PRESCRIPCIÓN CLÍNICA. LOS BIENES FÍSICOS DISPONIBLES EN INVENTARIO HABILITARÁN SU VENTA DIRECTA.' })}
        </p>
      </div>

      {/* CONTENEDOR PRINCIPAL TÉCNICO */}
      <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-6 md:p-10 mb-8 flex flex-col transition-colors">
        
        {/* Cabecera Interna */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-800 pb-6 mb-8 gap-4">
          <h3 className="font-bold text-lg uppercase tracking-wider text-black dark:text-white flex items-center gap-3">
            <Pill className="w-5 h-5" strokeWidth={1.5} />
            {t('rx_title', { defaultValue: 'FORMULARIO DE INDICACIONES' })}
          </h3>
          <div className="flex items-center gap-3 bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-black dark:border-white">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> 
            <span>CATÁLOGO VINCULADO</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-10">
          
          {/* PANEL DE FORMULARIO (BLUEPRINT) */}
          <div className="bg-gray-50 dark:bg-[#050505] p-6 md:p-8 border border-gray-300 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Buscador de Producto / Medicamento */}
              <div className="space-y-3 relative" ref={dropdownRef}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                  {t('medication', { defaultValue: 'PRINCIPIO ACTIVO' })} / PRODUCTO
                </label>
                <div className="relative">
                  <Input 
                    placeholder="ESCRIBA PARA BUSCAR EN INVENTARIO O TEXTO LIBRE..." 
                    value={newRx.medicationName} 
                    onChange={e => {
                      setNewRx({...newRx, medicationName: e.target.value, catalogItemId: undefined});
                      setShowDropdown(true);
                    }} 
                    onFocus={() => setShowDropdown(true)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border border-black dark:border-white text-[10px] font-semibold uppercase tracking-widest pl-12 pr-10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:font-bold transition-colors" 
                  />
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
                  
                  {isLoading && (
                    <Loader2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white animate-spin" />
                  )}
                </div>

                {showDropdown && newRx.medicationName.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer border-b border-gray-200 dark:border-gray-800 last:border-0 transition-colors group"
                        >
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover border border-black dark:border-white shrink-0 bg-white" />
                          ) : (
                            <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-gray-400 group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{product.name}</p>
                            <div className="flex gap-3 items-center text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400">
                              <span>{product.price ? `$${product.price} MXN` : 'CONSULTAR PRECIO'}</span>
                              {product.stockQuantity !== undefined && (
                                <span className={product.stockQuantity > 0 ? "text-black dark:text-white group-hover:text-white dark:group-hover:text-black" : "text-red-500 group-hover:text-red-400"}>
                                  | {product.stockQuantity > 0 ? `${product.stockQuantity} U. DISPONIBLES` : 'INVENTARIO AGOTADO'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center bg-gray-50 dark:bg-[#050505]">
                        SIN COINCIDENCIAS. SE REGISTRARÁ COMO TEXTO LIBRE.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                    {t('dosage', { defaultValue: 'DOSIS' })}
                  </label>
                  <Input 
                    placeholder={t('rx_dosage', { defaultValue: 'EJ. 1 TABLETA' })} 
                    value={newRx.dosage} 
                    onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border border-black dark:border-white text-[10px] font-semibold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:font-bold transition-colors" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                    CANT. (VENTA)
                  </label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="U." 
                    value={newRx.quantity || 1} 
                    onChange={e => setNewRx({...newRx, quantity: parseInt(e.target.value) || 1})} 
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border border-black dark:border-white text-[10px] font-semibold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:font-bold text-center transition-colors" 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                  {t('frequency', { defaultValue: 'FRECUENCIA' })}
                </label>
                {newRx.frequencyEnum === 'CUSTOM' ? (
                  <div className="flex gap-0 border border-black dark:border-white">
                    <Input 
                      placeholder="EJ. CADA 8 HORAS" 
                      value={newRx.frequency} 
                      onChange={e => setNewRx({...newRx, frequency: e.target.value})} 
                      className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-0 text-[10px] font-semibold uppercase tracking-widest focus-visible:ring-0 flex-1 placeholder:text-gray-400 placeholder:font-bold transition-colors" 
                    />
                    <button 
                      onClick={() => setNewRx({...newRx, frequencyEnum: '', frequency: ''})}
                      className="w-12 h-12 bg-gray-100 dark:bg-[#111] border-l border-black dark:border-white flex justify-center items-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <Select 
                    value={newRx.frequencyEnum || ''} 
                    onValueChange={(val) => {
                      if (val === 'CUSTOM') {
                        setNewRx({...newRx, frequencyEnum: val, frequency: ''});
                      } else {
                        const opt = FREQUENCY_OPTIONS.find(o => o.value === val);
                        setNewRx({...newRx, frequencyEnum: val, frequency: opt?.readable || ''});
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border border-black dark:border-white text-[10px] font-semibold uppercase tracking-widest focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
                      <SelectValue placeholder="SELECCIONE..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] bg-white dark:bg-[#0a0a0a]">
                      {FREQUENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-gray-100 dark:focus:bg-[#111]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                  {t('duration', { defaultValue: 'DURACIÓN' })}
                </label>
                <div className="flex gap-0 border border-black dark:border-white">
                  <Input 
                    type="number"
                    min="1"
                    placeholder="DÍAS"
                    value={newRx.durationDays || ''}
                    onChange={e => {
                      const days = e.target.value;
                      setNewRx({
                        ...newRx, 
                        durationDays: days, 
                        duration: days ? `POR ${days} DÍAS` : ''
                      });
                    }}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-0 text-[10px] font-semibold uppercase tracking-widest focus-visible:ring-0 w-20 shrink-0 text-center placeholder:text-gray-400 placeholder:font-bold border-r border-black dark:border-white transition-colors" 
                  />
                  <Input 
                    placeholder="TEXTO LIBRE..." 
                    value={newRx.duration} 
                    onChange={e => setNewRx({...newRx, duration: e.target.value})} 
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-0 text-[10px] font-semibold uppercase tracking-widest focus-visible:ring-0 flex-1 placeholder:text-gray-400 placeholder:font-bold transition-colors" 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                  {t('extra_instructions', { defaultValue: 'INSTRUCCIONES EXTRA' })}
                </label>
                <Input 
                  placeholder={t('rx_instructions', { defaultValue: 'EJ. TOMAR CON ALIMENTOS' })} 
                  value={newRx.instructions} 
                  onChange={e => setNewRx({...newRx, instructions: e.target.value})} 
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border border-black dark:border-white text-[10px] font-semibold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:font-bold transition-colors" 
                />
              </div>
            </div>

            <button 
              onClick={handleAddRx} 
              disabled={!newRx.medicationName} 
              className="w-full flex justify-center items-center gap-3 bg-black text-white dark:bg-white dark:text-black h-14 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] disabled:opacity-50 disabled:hover:bg-black border border-black dark:border-white"
            >
              <Plus className="w-4 h-4" strokeWidth={2} /> {t('rx_add_item', { defaultValue: 'AGREGAR INDICACIÓN' })}
            </button>
          </div>

          {/* LISTA DE RECETA (ESTADO VACÍO O LLENO) */}
          <div className="space-y-4 flex-1">
            {prescription.length === 0 ? (
               <div className="h-full min-h-[200px] flex flex-col items-center justify-center border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505]">
                 <Pill className="w-8 h-8 mb-4 text-gray-400" strokeWidth={1.5} />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   {t('rx_empty_state', { defaultValue: 'NO HAY INDICACIONES REGISTRADAS' })}
                 </p>
               </div>
            ) : (
              <div className="flex flex-col gap-4">
                {prescription.map((item: any, index) => (
                  <div key={item.id || index} className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                          {item.medicationName} 
                        </h4>
                        <span className="border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-gray-50 dark:bg-[#050505]">
                          {item.dosage}
                        </span>
                        {item.catalogItemId && (
                          <span className="flex items-center text-[9px] font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 border border-black dark:border-white">
                            <ShoppingBag className="w-3 h-3 mr-1.5" strokeWidth={1.5} /> INVENTARIO (X{item.quantity || 1})
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {t('take_medication', { frequency: item.frequency, duration: item.duration })}
                      </p>
                      
                      {item.instructions && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-3 flex items-start gap-2">
                          <span className="text-black dark:text-white shrink-0">NOTA:</span> {item.instructions}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removePrescriptionItem(item.id)} 
                      className="w-full sm:w-12 h-12 flex justify-center items-center border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER DE COMANDOS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-4">
        <button 
          onClick={onBack} 
          className="flex items-center justify-center gap-3 h-14 px-8 border border-black dark:border-white bg-transparent text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> {t('btn_back_to_evaluation', { defaultValue: 'RETORNAR A EVALUACIÓN' })}
        </button>
        <div className="text-center sm:text-right text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center flex-wrap justify-center sm:justify-end gap-2">
           PARA FINALIZAR UTILICE EL BOTÓN 
           <strong className="text-black dark:text-white flex items-center gap-2 border border-black dark:border-white px-3 py-1.5 bg-gray-50 dark:bg-[#050505]">
             <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5}/> {t('finish_and_charge_btn', { defaultValue: 'FINALIZAR Y COBRAR' })}
           </strong> 
           UBICADO EN LA BARRA SUPERIOR.
        </div>
      </div>
    </div>
  );
};