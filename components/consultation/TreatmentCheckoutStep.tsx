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
    { value: 'EVERY_4_HOURS', label: 'Cada 4 horas', readable: 'cada 4 horas' },
    { value: 'EVERY_6_HOURS', label: 'Cada 6 horas', readable: 'cada 6 horas' },
    { value: 'EVERY_8_HOURS', label: 'Cada 8 horas', readable: 'cada 8 horas' },
    { value: 'EVERY_12_HOURS', label: 'Cada 12 horas', readable: 'cada 12 horas' },
    { value: 'ONCE_DAILY', label: '1 vez al día', readable: '1 vez al día' },
    { value: 'AS_NEEDED', label: 'Según sea necesario (PRN)', readable: 'según sea necesario (PRN)' },
    { value: 'CUSTOM', label: 'Otra (Personalizada)...', readable: '' }
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="w-24 h-24 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-6">
          <Pill className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-serif italic font-bold uppercase text-black dark:text-white mb-4">
          {t('digital_prescription_closure')}
        </h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-lg mx-auto">
          {t('prescription_desc')}
        </p>
      </div>

      <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-8 mb-8 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black dark:border-white pb-6 mb-6 gap-4">
          <h3 className="font-serif italic font-bold text-2xl uppercase text-black dark:text-white flex items-center gap-3">
            <Pill className="w-6 h-6" strokeWidth={1.5} />
            {t('rx_title')}
          </h3>
          <div className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> 
            <span>VENTAS HABILITADAS</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-8">
          {/* Formulario */}
          <div className="bg-gray-50 dark:bg-[#050505] p-6 border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('medication')} / PRODUCTO
                </label>
                <div className="relative">
                  <Input 
                    placeholder="ESCRIBE PARA BUSCAR O AGREGA TEXTO..." 
                    value={newRx.medicationName} 
                    onChange={e => {
                      setNewRx({...newRx, medicationName: e.target.value, catalogItemId: undefined});
                      setShowDropdown(true);
                    }} 
                    onFocus={() => setShowDropdown(true)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light pl-10 pr-10 focus-visible:ring-0 focus-visible:border-black" 
                  />
                  <Search className="w-4 h-4 absolute left-4 top-4 text-gray-400" />
                  
                  {isLoading && (
                    <Loader2 className="w-4 h-4 absolute right-4 top-4 text-black dark:text-white animate-spin" />
                  )}
                </div>

                {showDropdown && newRx.medicationName.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer border-b border-black dark:border-white last:border-0 transition-colors group"
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover border border-black dark:border-white" />
                          ) : (
                            <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{product.name}</p>
                            <div className="flex gap-3 items-center text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mt-1">
                              <span>{product.price ? `$${product.price} MXN` : 'CONSULTAR'}</span>
                              {product.stockQuantity !== undefined && (
                                <span className={product.stockQuantity > 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                                  | {product.stockQuantity > 0 ? `${product.stockQuantity} EN STOCK` : 'AGOTADO'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">
                        NO ENCONTRADO EN CATÁLOGO. SE RECETARÁ COMO TEXTO LIBRE.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t('dosage')}</label>
                  <Input 
                    placeholder={t('rx_dosage')} 
                    value={newRx.dosage} 
                    onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">CANT. (VENTA)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="CANT." 
                    value={newRx.quantity || 1} 
                    onChange={e => setNewRx({...newRx, quantity: parseInt(e.target.value) || 1})} 
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black text-center" 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t('frequency')}</label>
                {newRx.frequencyEnum === 'CUSTOM' ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="EJ. CADA 8 HORAS" 
                      value={newRx.frequency} 
                      onChange={e => setNewRx({...newRx, frequency: e.target.value})} 
                      className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black flex-1 uppercase" 
                    />
                    <button 
                      onClick={() => setNewRx({...newRx, frequencyEnum: '', frequency: ''})}
                      className="w-12 h-12 border border-black dark:border-white flex justify-center items-center hover:bg-black hover:text-white transition-colors shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
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
                    <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light uppercase">
                      <SelectValue placeholder="SELECCIONA..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-black dark:border-white shadow-[4px_4px_0_0_#000]">
                      {FREQUENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs uppercase">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t('duration')}</label>
                <div className="flex gap-2">
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
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black w-24 shrink-0 text-center" 
                  />
                  <Input 
                    placeholder="TEXTO LIBRE" 
                    value={newRx.duration} 
                    onChange={e => setNewRx({...newRx, duration: e.target.value})} 
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black flex-1 uppercase" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t('extra_instructions')}</label>
                <Input 
                  placeholder={t('rx_instructions')} 
                  value={newRx.instructions} 
                  onChange={e => setNewRx({...newRx, instructions: e.target.value})} 
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black uppercase" 
                />
              </div>
            </div>

            <button 
              onClick={handleAddRx} 
              disabled={!newRx.medicationName} 
              className="w-full flex justify-center items-center gap-3 bg-black text-white dark:bg-white dark:text-black h-14 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] disabled:opacity-50"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} /> {t('rx_add_item')}
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {prescription.length === 0 ? (
               <div className="h-full min-h-[200px] flex flex-col items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                 <Pill className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" strokeWidth={1} />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('rx_empty_state')}</p>
               </div>
            ) : (
              prescription.map((item: any, index) => (
                <div key={item.id || index} className="flex justify-between items-center p-6 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                  <div>
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white flex flex-wrap items-center gap-3 mb-2">
                      {item.medicationName} 
                      {item.catalogItemId && (
                        <span className="flex items-center text-[9px] font-bold bg-black text-white px-2 py-1">
                          <ShoppingBag className="w-3 h-3 mr-2" strokeWidth={1.5} /> TIENDA (x{item.quantity || 1})
                        </span>
                      )}
                      <span className="border-l border-black dark:border-white pl-3 text-gray-500">{item.dosage}</span>
                    </h4>
                    <p className="text-xs font-light text-black dark:text-white uppercase tracking-wider">
                      {t('take_medication', { frequency: item.frequency, duration: item.duration })}
                    </p>
                    {item.instructions && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 bg-gray-50 dark:bg-[#050505] p-2 border border-gray-200 dark:border-gray-800">{t('note', { instructions: item.instructions })}</p>}
                  </div>
                  <button 
                    onClick={() => removePrescriptionItem(item.id)} 
                    className="w-12 h-12 flex justify-center items-center border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0 ml-4"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-4">
        <button 
          onClick={onBack} 
          className="flex items-center justify-center gap-3 h-14 px-8 border border-black dark:border-white bg-transparent text-black dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> {t('btn_back_to_evaluation')}
        </button>
        <div className="text-right text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center flex-wrap justify-center sm:justify-end">
           {t('use_finish_button')} 
           <strong className="mx-2 text-black dark:text-white flex items-center gap-2 border border-black dark:border-white px-2 py-1 bg-gray-50 dark:bg-[#050505]">
             <CheckCircle className="w-3 h-3" strokeWidth={1.5}/> {t('finish_and_charge_btn')}
           </strong> 
           {t('of_top_bar')}
        </div>
      </div>
    </div>
  );
};