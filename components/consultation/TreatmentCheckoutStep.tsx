import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { Pill, ShoppingBag, Plus, Trash2, ArrowLeft, CheckCircle, Search, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrescriptionItem } from '@/types/ehr';
import { useCatalog } from '@/hooks/useCatalog'; // 🚀 Importamos TU hook existente
import { UI_Product } from '@/types/catalog'; // 🚀 Importamos el tipo que usa tu hook

interface TreatmentCheckoutStepProps {
  prescription: PrescriptionItem[];
  // 🚀 AÑADIDO: price y catalogItemId en la definición
  newRx: { medicationName: string; dosage: string; frequency: string; duration: string; instructions: string; catalogItemId?: number; price?: string | number };
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
  
  // 🚀 Ejecutamos tu Hook existente
  const { products, isLoading, fetchInventory } = useCatalog();
  
  // Cargar el inventario al montar el componente (si tu hook no lo hace automáticamente)
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🚀 Filtramos en tiempo real usando el array 'products' de tu hook
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

  // Función al seleccionar un producto (usando tu interfaz UI_Product)
  const handleSelectProduct = (product: UI_Product) => {
    setNewRx({ 
      ...newRx, 
      medicationName: product.name, 
      catalogItemId: product.id, // ID real de base de datos
      price: product.price || 0 // 🚀 MAGIA: Extraemos el precio del catálogo
    });
    setShowDropdown(false);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pill className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('digital_prescription_closure')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t('prescription_desc')}
        </p>
      </div>

      <Card className="border-emerald-200 dark:border-emerald-900/50 shadow-sm bg-white dark:bg-slate-900 flex-1 overflow-hidden flex flex-col mb-6">
        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Pill className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t('rx_title')}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1.5 rounded-full">
            <ShoppingBag className="w-4 h-4" /> 
            <span className="font-medium">Ventas Habilitadas</span>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
          
          <div className="grid gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 🚀 EL INPUT CON BÚSQUEDA PREDICTIVA */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  {t('medication')} / Producto de Tienda
                </label>
                <div className="relative">
                  <Input 
                    placeholder="Escribe para buscar o agrega texto libre..." 
                    value={newRx.medicationName} 
                    onChange={e => {
                      setNewRx({...newRx, medicationName: e.target.value, catalogItemId: undefined});
                      setShowDropdown(true);
                    }} 
                    onFocus={() => setShowDropdown(true)}
                    className="bg-white dark:bg-slate-900 h-10 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-9 pr-9" 
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  
                  {isLoading && (
                    <Loader2 className="w-4 h-4 absolute right-3 top-3 text-emerald-500 animate-spin" />
                  )}
                </div>

                {/* 🚀 Renderizado del Autocomplete */}
                {showDropdown && newRx.medicationName.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0"
                        >
                          {/* Muestra la imagen del producto si existe, si no un icono */}
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                          ) : (
                            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-md">
                              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                            <div className="flex gap-2 items-center text-xs">
                              <span className="text-slate-500">{product.price ? `$${product.price} MXN` : 'Consultar'}</span>
                              {product.stockQuantity !== undefined && (
                                <span className={product.stockQuantity > 0 ? "text-emerald-600" : "text-red-500"}>
                                  • {product.stockQuantity > 0 ? `${product.stockQuantity} en stock` : 'Agotado'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-slate-500 text-center">
                        No encontrado en catálogo. Se recetará como texto libre.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('dosage')}</label>
                <Input placeholder={t('rx_dosage')} value={newRx.dosage} onChange={e => setNewRx({...newRx, dosage: e.target.value})} className="bg-white dark:bg-slate-900 h-10 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('frequency')}</label>
                <Input placeholder={t('rx_frequency')} value={newRx.frequency} onChange={e => setNewRx({...newRx, frequency: e.target.value})} className="bg-white dark:bg-slate-900 h-10 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('duration')}</label>
                <Input placeholder={t('rx_duration')} value={newRx.duration} onChange={e => setNewRx({...newRx, duration: e.target.value})} className="bg-white dark:bg-slate-900 h-10 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{t('extra_instructions')}</label>
                <Input placeholder={t('rx_instructions')} value={newRx.instructions} onChange={e => setNewRx({...newRx, instructions: e.target.value})} className="bg-white dark:bg-slate-900 h-10 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
            </div>

            {/* 🚀 CAMBIO: Quitamos el !newRx.dosage del disabled */}
            <Button onClick={handleAddRx} disabled={!newRx.medicationName} className="w-full mt-2 h-10 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white">
              <Plus className="w-4 h-4 mr-2" /> {t('rx_add_item')}
            </Button>
          </div>

          <div className="space-y-3 flex-1">
            {prescription.length === 0 ? (
               <div className="h-full min-h-[150px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500">
                 <Pill className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm">{t('rx_empty_state')}</p>
               </div>
            ) : (
              prescription.map((item: any, index) => (
                <div key={item.id || index} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      {item.medicationName} 
                      {item.catalogItemId && (
                        <span className="flex items-center text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          <ShoppingBag className="w-3 h-3 mr-1" /> Tienda
                        </span>
                      )}
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">{item.dosage}</span>
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t('take_medication', { frequency: item.frequency, duration: item.duration })}
                    </p>
                    {item.instructions && <p className="text-xs text-slate-500 dark:text-slate-500 italic mt-1">{t('note', { instructions: item.instructions })}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removePrescriptionItem(item.id)} className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="h-12 px-6 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5 mr-2" /> {t('btn_back_to_evaluation')}
        </Button>
        <div className="text-right text-sm text-slate-500 dark:text-slate-400 flex items-center">
           {t('use_finish_button')} <strong className="mx-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> {t('finish_and_charge_btn')}</strong> {t('of_top_bar')}
        </div>
      </div>
    </div>
  );
};