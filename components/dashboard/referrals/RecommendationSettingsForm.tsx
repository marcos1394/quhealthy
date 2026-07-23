"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Percent, 
  Save, 
  Handshake, 
  TrendingUp, 
  Tag, 
  ListFilter,
  Calculator,
  Check
} from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QhSpinner } from '@/components/ui/QhSpinner';

import { useRecommendationConfig } from '@/hooks/useRecommendationConfig';
import { useCatalog } from '@/hooks/useCatalog'; 
import { RecommendationConfigDto } from '@/services/recommendationService';
import { cn } from '@/lib/utils';

interface RecommendationSettingsFormProps {
  initialData?: RecommendationConfigDto;
  onSaved?: () => void;
}

export const RecommendationSettingsForm: React.FC<RecommendationSettingsFormProps> = ({ 
  initialData, 
  onSaved 
}) => {
  const { isSaving, saveConfig } = useRecommendationConfig();
  
  const { 
    services, 
    packages, 
    products, 
    courses, 
    isLoading: isLoadingCatalog,
    fetchInventory 
  } = useCatalog();
  
  const [formData, setFormData] = useState<RecommendationConfigDto>({
    campaignCode: '',
    applyToAll: true,
    applicableItemIds: [],
    isActive: false,
    discountAmount: 0,
    isDiscountPercentage: false,
    commissionAmount: 0,
    isCommissionPercentage: false,
  });

  const [basePrice, setBasePrice] = useState(1000);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const catalogItems = [...services, ...packages, ...products, ...courses];

  const handleChange = (field: keyof RecommendationConfigDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCatalogItem = (itemId: number) => {
    setFormData((prev) => {
      const currentItems = prev.applicableItemIds || [];
      if (currentItems.includes(itemId)) {
        return { ...prev, applicableItemIds: currentItems.filter(id => id !== itemId) };
      } else {
        return { ...prev, applicableItemIds: [...currentItems, itemId] };
      }
    });
  };

  const handleSave = async () => {
    if (!formData.campaignCode || formData.campaignCode.trim() === '') {
      return;
    }
    const success = await saveConfig(formData);
    if (success && onSaved) {
      onSaved();
    }
  };

  if (isLoadingCatalog) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px] gap-4">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 animate-pulse">Cargando inventario y catálogo...</p>
      </div>
    );
  }

  // Cálculos del simulador
  const discountVal = formData.isDiscountPercentage 
    ? (basePrice * (formData.discountAmount || 0)) / 100 
    : (formData.discountAmount || 0);
    
  const commissionVal = formData.isCommissionPercentage
    ? (basePrice * (formData.commissionAmount || 0)) / 100
    : (formData.commissionAmount || 0);
    
  const finalPrice = Math.max(0, basePrice - discountVal);
  const providerEarning = Math.max(0, finalPrice - commissionVal);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* --- FORMULARIO PRINCIPAL --- */}
      <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Cabecera del Formulario */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <Handshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {initialData ? 'Editar Campaña Promocional' : 'Crear Campaña de Recomendación'}
              </h2>
              <p className="text-xs font-medium text-gray-500">
                Ajuste las reglas de descuento para pacientes y comisión para colegas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white dark:bg-[#0a0a0a] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm self-start sm:self-auto">
            <Switch 
              id="active-program" 
              checked={formData.isActive}
              onCheckedChange={(val) => handleChange('isActive', val)}
            />
            <Label htmlFor="active-program" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
              {formData.isActive ? "Campaña Activa" : "Campaña Pausada"}
            </Label>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Identificador de Campaña */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>Código Identificador de Campaña</span>
            </label>
            <input 
              type="text"
              value={formData.campaignCode}
              onChange={(e) => handleChange('campaignCode', e.target.value.toUpperCase().replace(/\s/g, ''))}
              className="w-full h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 rounded-xl shadow-sm disabled:opacity-50"
              placeholder="Ej. DERMA2026"
              disabled={!!initialData}
            />
            <p className="text-[11px] font-semibold text-gray-400">
              Clave única que los pacientes o colegas ingresarán en el check-out para aplicar beneficios.
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Alcance de Servicios */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>Servicios y Catálogo Aplicable</span>
              </label>

              <div className="flex items-center gap-2">
                <Switch 
                  id="apply-all" 
                  checked={formData.applyToAll}
                  onCheckedChange={(val) => {
                    handleChange('applyToAll', val);
                    if (val) handleChange('applicableItemIds', []);
                  }}
                />
                <Label htmlFor="apply-all" className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">
                  Aplicar a todo mi catálogo
                </Label>
              </div>
            </div>

            {!formData.applyToAll && (
              <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                {catalogItems.map((item: any) => {
                  const isChecked = (formData.applicableItemIds || []).includes(item.id);
                  return (
                    <label 
                      key={item.id} 
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer text-xs font-semibold",
                        isChecked 
                          ? "bg-white dark:bg-[#0a0a0a] border-emerald-200 dark:border-emerald-900/40 text-gray-900 dark:text-white shadow-sm"
                          : "bg-transparent border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#111]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCatalogItem(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-500">${item.price}</span>
                    </label>
                  );
                })}
                {catalogItems.length === 0 && (
                  <p className="text-xs font-medium text-gray-500 text-center py-4">No hay ítems registrados en el catálogo.</p>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Configuración de Beneficios (Descuento y Comisión) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Descuento Paciente */}
            <div className="space-y-2 bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-bold text-gray-900 dark:text-white">
                Descuento al Paciente
              </label>
              <div className="flex flex-col gap-2.5">
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.discountAmount || ''}
                    onChange={(e) => handleChange('discountAmount', Number(e.target.value))}
                    className="w-full h-11 pl-9 pr-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ej. 10"
                  />
                  {formData.isDiscountPercentage ? (
                    <Percent className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  )}
                </div>

                <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-xl gap-1">
                  <button 
                    type="button"
                    onClick={() => handleChange('isDiscountPercentage', false)} 
                    className={cn(
                      "flex-1 text-xs py-1.5 font-bold rounded-lg transition-all",
                      !formData.isDiscountPercentage 
                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    Monto ($)
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleChange('isDiscountPercentage', true)} 
                    className={cn(
                      "flex-1 text-xs py-1.5 font-bold rounded-lg transition-all",
                      formData.isDiscountPercentage 
                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    Porcentaje (%)
                  </button>
                </div>
              </div>
            </div>

            {/* Comisión Colega */}
            <div className="space-y-2 bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-bold text-gray-900 dark:text-white">
                Comisión para Colega Referente
              </label>
              <div className="flex flex-col gap-2.5">
                <div className="relative">
                  <input 
                    type="number"
                    value={formData.commissionAmount || ''}
                    onChange={(e) => handleChange('commissionAmount', Number(e.target.value))}
                    className="w-full h-11 pl-9 pr-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ej. 100"
                  />
                  {formData.isCommissionPercentage ? (
                    <Percent className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  )}
                </div>

                <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-xl gap-1">
                  <button 
                    type="button"
                    onClick={() => handleChange('isCommissionPercentage', false)} 
                    className={cn(
                      "flex-1 text-xs py-1.5 font-bold rounded-lg transition-all",
                      !formData.isCommissionPercentage 
                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    Monto ($)
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleChange('isCommissionPercentage', true)} 
                    className={cn(
                      "flex-1 text-xs py-1.5 font-bold rounded-lg transition-all",
                      formData.isCommissionPercentage 
                        ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    Porcentaje (%)
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer del Formulario */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex justify-end">
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isSaving || !formData.campaignCode}
            className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <><QhSpinner size="sm" className="text-current" /> Guardando...</>
            ) : (
              <><Save className="w-4 h-4" strokeWidth={2} /> Guardar Campaña</>
            )}
          </button>
        </div>

      </div>

      {/* --- SIMULADOR EN TIEMPO REAL --- */}
      <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-fit space-y-6">
        
        <div>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                Simulador de Retorno
              </h3>
              <p className="text-[11px] font-semibold text-gray-500">
                Calcula la distribución final de montos.
              </p>
            </div>
          </div>

          <div className="space-y-5 mt-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Precio de Referencia del Servicio
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl shadow-sm focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="bg-gray-50/80 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500">Descuento al paciente</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                  -${discountVal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500">Precio final abonado</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  ${finalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500">Comisión para el colega</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  -${commissionVal.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>Tu ingreso neto</span>
                </span>
                <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${providerEarning.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};