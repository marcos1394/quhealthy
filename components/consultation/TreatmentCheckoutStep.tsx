"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-giant-component */;

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
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full transition-colors duration-300">
      
      {/* HEADER TÉCNICO */}
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="w-16 h-16 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6 shrink-0">
          <Pill className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          Protocolo Farmacológico
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight uppercase text-black dark:text-white mb-3 leading-none">
          {t('digital_prescription_closure', { defaultValue: 'Cierre de Receta Digital' })}
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xl mx-auto mt-2 leading-relaxed">
          {t('prescription_desc', { defaultValue: 'FORMULE LA PRESCRIPCIÓN CLÍNICA. LOS BIENES FÍSICOS DISPONIBLES EN INVENTARIO HABILITARÁN SU VENTA DIRECTA AL PACIENTE.' })}
        </p>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] mb-8 flex flex-col rounded-none transition-colors">
        
        {/* Cabecera Interna */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-4 md:p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              <Pill className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              {t('rx_title', { defaultValue: 'FORMULARIO DE INDICACIONES' })}
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[9px] font-bold uppercase tracking-widest shrink-0 border border-black dark:border-white">
            <ShoppingBag className="w-3 h-3" strokeWidth={1.5} /> 
            <span>CATÁLOGO VINCULADO</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#050505]">
          
          {/* PANEL DE FORMULARIO (GRID BLUEPRINT) */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-0 border-b border-black dark:border-white">
            
            {/* Buscador de Producto / Medicamento */}
            <div className="col-span-1 md:col-span-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 relative flex flex-col" ref={dropdownRef}>
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
                {t('medication', { defaultValue: 'PRINCIPIO ACTIVO' })} / PRODUCTO
              </label>
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" strokeWidth={2} />
                <Input 
                  placeholder="ESCRIBA PARA BUSCAR EN INVENTARIO O TEXTO LIBRE..." 
                  value={newRx.medicationName} 
                  onChange={e => {
                    setNewRx({...newRx, medicationName: e.target.value, catalogItemId: undefined});
                    setShowDropdown(true);
                  }} 
                  onFocus={() => setShowDropdown(true)}
                  className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold uppercase tracking-widest pl-10 pr-10 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold transition-colors w-full" 
                />
                
                {isLoading && (
                  <Loader2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white animate-spin" />
                )}
              </div>

              {/* Dropdown Estricto */}
              {showDropdown && newRx.medicationName.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-[#0a0a0a] border-x border-b border-black dark:border-white max-h-60 overflow-y-auto custom-scrollbar shadow-xl">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-0">
                      {filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer border-b border-black/10 dark:border-white/10 last:border-0 transition-colors group"
                        >
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover border border-black/20 dark:border-white/20 shrink-0 bg-white" />
                          ) : (
                            <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
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
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center bg-gray-50 dark:bg-[#050505]">
                      SIN COINCIDENCIAS. SE REGISTRARÁ COMO TEXTO LIBRE (SIN VENTA).
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dosis */}
            <div className="col-span-1 md:col-span-3 border-b border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
                {t('dosage', { defaultValue: 'DOSIS' })}
              </label>
              <Input 
                placeholder={t('rx_dosage', { defaultValue: 'EJ. 1 TABLETA' })} 
                value={newRx.dosage} 
                onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold transition-colors w-full" 
              />
            </div>

            {/* Cantidad Venta */}
            <div className="col-span-1 md:col-span-3 border-b md:border-r-0 border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">3</span>
                CANT. (VENTA Opcional)
              </label>
              <Input 
                type="number" 
                min="1" 
                placeholder="U." 
                value={newRx.quantity || 1} 
                onChange={e => setNewRx({...newRx, quantity: parseInt(e.target.value) || 1})} 
                className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold text-center transition-colors w-full" 
              />
            </div>
            
            {/* Frecuencia */}
            <div className="col-span-1 md:col-span-2 border-b border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">4</span>
                {t('frequency', { defaultValue: 'FRECUENCIA' })}
              </label>
              {newRx.frequencyEnum === 'CUSTOM' ? (
                <div className="flex gap-0 border border-black/20 dark:border-white/20">
                  <Input 
                    placeholder="EJ. CADA 8 HORAS" 
                    value={newRx.frequency} 
                    onChange={e => setNewRx({...newRx, frequency: e.target.value})} 
                    className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border-0 text-xs font-semibold uppercase tracking-widest focus-visible:ring-0 flex-1 placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold transition-colors" 
                  />
                  <button 
                    onClick={() => setNewRx({...newRx, frequencyEnum: '', frequency: ''})}
                    className="w-10 h-10 bg-white dark:bg-[#0a0a0a] border-l border-black/20 dark:border-white/20 flex justify-center items-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
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
                  <SelectTrigger className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold uppercase tracking-widest focus:ring-0 focus:border-black dark:focus:border-white transition-colors w-full">
                    <SelectValue placeholder="SELECCIONE..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-xl">
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:bg-gray-100 dark:focus:bg-[#111] rounded-none">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Duración */}
            <div className="col-span-1 md:col-span-2 border-b border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">5</span>
                {t('duration', { defaultValue: 'DURACIÓN' })}
              </label>
              <div className="flex gap-0 border border-black/20 dark:border-white/20">
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
                  className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border-0 text-xs font-semibold uppercase tracking-widest focus-visible:ring-0 w-20 shrink-0 text-center placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold border-r border-black/20 dark:border-white/20 transition-colors" 
                />
                <Input 
                  placeholder="TEXTO LIBRE..." 
                  value={newRx.duration} 
                  onChange={e => setNewRx({...newRx, duration: e.target.value})} 
                  className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border-0 text-xs font-semibold uppercase tracking-widest focus-visible:ring-0 flex-1 placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold transition-colors" 
                />
              </div>
            </div>
            
            {/* Instrucciones Extra */}
            <div className="col-span-1 md:col-span-2 border-b md:border-r-0 border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">6</span>
                {t('extra_instructions', { defaultValue: 'INSTRUCCIONES EXTRA' })}
              </label>
              <Input 
                placeholder={t('rx_instructions', { defaultValue: 'EJ. TOMAR CON ALIMENTOS' })} 
                value={newRx.instructions} 
                onChange={e => setNewRx({...newRx, instructions: e.target.value})} 
                className="bg-gray-50 dark:bg-[#050505] h-10 rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white placeholder:text-gray-400 placeholder:text-[9px] placeholder:font-bold transition-colors w-full" 
              />
            </div>

            {/* Botón de Agregar (Integrado al Grid) */}
            <div className="col-span-1 md:col-span-6 bg-white dark:bg-[#0a0a0a]">
              <button 
                onClick={handleAddRx} 
                disabled={!newRx.medicationName} 
                className="w-full flex justify-center items-center gap-2 bg-black text-white dark:bg-white dark:text-black h-12 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:hover:bg-black rounded-none border-0"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} /> {t('rx_add_item', { defaultValue: 'AGREGAR INDICACIÓN A RECETA' })}
              </button>
            </div>
          </div>

          {/* LISTA DE RECETA */}
          <div className="flex-1 bg-gray-50 dark:bg-[#050505]">
            {prescription.length === 0 ? (
               <div className="h-full min-h-[250px] flex flex-col items-center justify-center p-10 text-center">
                 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-4">
                   <Pill className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                   {t('rx_empty_state', { defaultValue: 'RECETA EN BLANCO. AGREGA INDICACIONES EN EL PANEL SUPERIOR.' })}
                 </p>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-0">
                {prescription.map((item: any, index) => (
                  <div key={item.id || index} className="flex flex-col sm:flex-row border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] group hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
                    
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-xs uppercase tracking-widest text-black dark:text-white">
                          {item.medicationName} 
                        </h4>
                        <span className="border border-black/20 dark:border-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-white dark:bg-[#0a0a0a]">
                          {item.dosage}
                        </span>
                        {item.catalogItemId && (
                          <span className="flex items-center text-[9px] font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 border border-black dark:border-white">
                            <ShoppingBag className="w-3 h-3 mr-1.5" strokeWidth={1.5} /> VENTA DIRECTA (X{item.quantity || 1})
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                        {t('take_medication', { frequency: item.frequency, duration: item.duration })}
                      </p>
                      
                      {item.instructions && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-2 flex items-start gap-2">
                          <span className="border border-black/20 dark:border-white/20 px-1.5 bg-gray-50 dark:bg-[#050505] text-black dark:text-white shrink-0">NOTA</span> 
                          {item.instructions}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => removePrescriptionItem(item.id)} 
                      className="w-full sm:w-16 h-12 sm:h-auto border-t sm:border-t-0 sm:border-l border-black/10 dark:border-white/10 flex justify-center items-center text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors shrink-0 bg-white dark:bg-[#0a0a0a]"
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

      {/* FOOTER DE COMANDOS ESTRICTO */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-2 shrink-0">
        <button 
          onClick={onBack} 
          className="flex items-center justify-center gap-3 h-16 px-10 bg-transparent text-black dark:text-white border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors w-full sm:w-auto rounded-none"
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