"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { DollarSign, Percent, Save, Handshake, TrendingUp } from 'lucide-react';
import { useRecommendationConfig, RecommendationConfigDto } from '@/hooks/useRecommendationConfig';

export const RecommendationSettingsForm = () => {
  const { config, isLoading, isSaving, saveConfig } = useRecommendationConfig();
  
  const [formData, setFormData] = useState<RecommendationConfigDto>({
    isActive: false,
    discountAmount: 0,
    isDiscountPercentage: false,
    commissionAmount: 0,
    isCommissionPercentage: false,
  });

  // Example base price for simulator
  const [basePrice, setBasePrice] = useState(1000);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = (field: keyof RecommendationConfigDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await saveConfig(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <QhSpinner size="md" />
      </div>
    );
  }

  // Calculate simulator values
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
                Configuración de Recomendaciones
              </CardTitle>
              <CardDescription className="mt-1">
                Acepta pacientes recomendados por otros especialistas. Ofrece un descuento para el paciente y una comisión para tu colega.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="active-program" className="text-sm text-slate-500 font-medium">
                {formData.isActive ? "Programa Activo" : "Programa Pausado"}
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
          
          <div className={`space-y-6 ${!formData.isActive && 'opacity-50 pointer-events-none'}`}>
            
            {/* Beneficio para el Paciente */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Beneficio al Paciente</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                  ¿Cuánto descuento recibirá el paciente cuando use el código de un colega para agendar contigo?
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Input 
                    type="number"
                    value={formData.discountAmount || ''}
                    onChange={(e) => handleChange('discountAmount', Number(e.target.value))}
                    className="pl-9 h-12"
                    placeholder="Ej. 10"
                  />
                  {formData.isDiscountPercentage ? (
                    <Percent className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-950">
                  <button
                    onClick={() => handleChange('isDiscountPercentage', false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!formData.isDiscountPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Fijo ($)
                  </button>
                  <button
                    onClick={() => handleChange('isDiscountPercentage', true)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${formData.isDiscountPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Porcentaje (%)
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Beneficio para el Referidor */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Comisión para tu Colega</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                  ¿Cuánto ganar&aacute; el médico que te envíe un paciente? (Se deduce de tu ganancia final)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Input 
                    type="number"
                    value={formData.commissionAmount || ''}
                    onChange={(e) => handleChange('commissionAmount', Number(e.target.value))}
                    className="pl-9 h-12"
                    placeholder="Ej. 100"
                  />
                  {formData.isCommissionPercentage ? (
                    <Percent className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-950">
                  <button
                    onClick={() => handleChange('isCommissionPercentage', false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!formData.isCommissionPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Fijo ($)
                  </button>
                  <button
                    onClick={() => handleChange('isCommissionPercentage', true)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${formData.isCommissionPercentage ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Porcentaje (%)
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
            >
              {isSaving ? <QhSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulador Card */}
      <Card className="bg-slate-900 border-0 shadow-lg text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Simulador
          </CardTitle>
          <CardDescription className="text-slate-400">
            Descubre cómo se distribuirá el dinero.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label className="text-slate-300">Precio base de tu consulta</Label>
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
          
          <div className="text-xs text-slate-500 text-center">
            El paciente pagará un total de ${finalPrice.toFixed(2)}. QuHealthy retendrá la comisión automáticamente como garante.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
