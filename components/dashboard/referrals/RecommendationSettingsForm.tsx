"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { DollarSign, Percent, Save, Handshake, TrendingUp, Tag, ListFilter } from 'lucide-react';
import { useRecommendationConfig } from '@/hooks/useRecommendationConfig';
import { useCatalog } from '@/hooks/useCatalog'; 
import { RecommendationConfigDto } from '@/services/recommendationService';

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
      <div className="flex flex-col items-center justify-center p-12">
        <QhSpinner size="md" />
      </div>
    );
  }

  const discountVal = formData.isDiscountPercentage 
    ? (basePrice * (formData.discountAmount || 0)) / 100 
    : (formData.discountAmount || 0);
  
  const commissionVal = formData.isCommissionPercentage
    ? (basePrice * (formData.commissionAmount || 0)) / 100
    : (formData.commissionAmount || 0);
    
  const finalPrice = Math.max(0, basePrice - discountVal);
  const providerEarning = Math.max(0, finalPrice - commissionVal);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Handshake className="w-5 h-5 text-indigo-500" />
                {initialData ? 'Editar Campaña' : 'Crear Campaña de Recomendación'}
              </CardTitle>
              <CardDescription className="mt-1">
                Genera códigos promocionales para que tus colegas te envíen pacientes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="active-program" className="text-sm text-slate-500 font-medium">
                {formData.isActive ? "Campaña Activa" : "Campaña Pausada"}
              </Label>
              <Switch 
                id="active-program" 
                checked={formData.isActive}
                onCheckedChange={(val) => handleChange('isActive', val)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          <div className={`space-y-8 ${!formData.isActive && 'opacity-50 pointer-events-none transition-opacity'}`}>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Identificador
                </h3>
              </div>
              <div className="relative">
                <Input 
                  type="text"
                  value={formData.campaignCode}
                  onChange={(e) => handleChange('campaignCode', e.target.value.toUpperCase().replace(/\s/g, ''))}
                  className="font-mono text-lg uppercase"
                  placeholder="Ej. DERMA2026"
                  disabled={!!initialData} // Usualmente no se debe cambiar el código una vez creado
                />
                <p className="text-xs text-slate-500 mt-2">Este es el código que el paciente deberá ingresar al agendar.</p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ListFilter className="w-4 h-4" /> Servicios Aplicables
                </h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor="apply-all" className="text-sm">Aplicar a todo mi catálogo</Label>
                  <Switch 
                    id="apply-all" 
                    checked={formData.applyToAll}
                    onCheckedChange={(val) => {
                      handleChange('applyToAll', val);
                      if (val) handleChange('applicableItemIds', []);
                    }}
                  />
                </div>
              </div>

              {!formData.applyToAll && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  {catalogItems.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md transition-colors">
                      <input 
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={(formData.applicableItemIds || []).includes(item.id)}
                        onChange={() => toggleCatalogItem(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label htmlFor={`item-${item.id}`} className="flex-1 cursor-pointer">
                        {item.name} <span className="text-slate-400 font-normal ml-2">${item.price}</span>
                      </Label>
                    </div>
                  ))}
                  {catalogItems.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No tienes servicios en tu catálogo.</p>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Descuento Paciente</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Input 
                      type="number"
                      value={formData.discountAmount || ''}
                      onChange={(e) => handleChange('discountAmount', Number(e.target.value))}
                      className="pl-9"
                      placeholder="Ej. 10"
                    />
                    {formData.isDiscountPercentage ? <Percent className="absolute left-3 top-3 w-4 h-4 text-slate-400" /> : <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button onClick={() => handleChange('isDiscountPercentage', false)} className={`flex-1 text-xs py-1.5 rounded-md ${!formData.isDiscountPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>Monto ($)</button>
                    <button onClick={() => handleChange('isDiscountPercentage', true)} className={`flex-1 text-xs py-1.5 rounded-md ${formData.isDiscountPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>Porcentaje (%)</button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Comisión Colega</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Input 
                      type="number"
                      value={formData.commissionAmount || ''}
                      onChange={(e) => handleChange('commissionAmount', Number(e.target.value))}
                      className="pl-9"
                      placeholder="Ej. 100"
                    />
                    {formData.isCommissionPercentage ? <Percent className="absolute left-3 top-3 w-4 h-4 text-slate-400" /> : <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button onClick={() => handleChange('isCommissionPercentage', false)} className={`flex-1 text-xs py-1.5 rounded-md ${!formData.isCommissionPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>Monto ($)</button>
                    <button onClick={() => handleChange('isCommissionPercentage', true)} className={`flex-1 text-xs py-1.5 rounded-md ${formData.isCommissionPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}>Porcentaje (%)</button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              {isSaving ? <QhSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Campaña
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-0 shadow-lg text-white overflow-hidden relative h-fit">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Simulador
          </CardTitle>
          <CardDescription className="text-slate-400">
            Calcula la distribución final.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label className="text-slate-300">Precio de prueba</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <Input 
                type="number" 
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="pl-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Descuento aplicado</span>
              <span className="text-red-400 font-medium">-${discountVal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Comisión al colega</span>
              <span className="text-amber-400 font-medium">-${commissionVal.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-700 flex justify-between font-semibold">
              <span>Tú ganas</span>
              <span className="text-emerald-400">${providerEarning.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};