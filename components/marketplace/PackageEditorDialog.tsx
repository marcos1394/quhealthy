"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Zap, Percent, DollarSign, ShoppingCart, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { UI_Package, UI_Service } from "@/types/catalog";

interface PackageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: UI_Package | null;
  availableServices: UI_Service[];
  onSave: (pkg: UI_Package) => void;
  onImageUpload?: (id: number, file: File) => void;
}

export function PackageEditorDialog({
  isOpen, onClose, initialData, availableServices, onSave, onImageUpload
}: PackageEditorDialogProps) {
  const t = useTranslations('Marketplace.packages');
  
  const [pkg, setPkg] = useState<UI_Package | null>(null);
  const [discountPercent, setDiscountPercent] = useState(15);

  useEffect(() => {
    if (isOpen && initialData) {
      setPkg({ ...initialData });
      const rVal = calculateRealValue(initialData.serviceIds);
      setDiscountPercent(rVal > 0 ? Math.round(((rVal - initialData.price) / rVal) * 100) : 15);
    }
  }, [isOpen, initialData]);

  if (!pkg) return null;

  const realValue = calculateRealValue(pkg.serviceIds);
  const savings = Math.max(0, realValue - pkg.price);

  function calculateRealValue(serviceIds: number[]) {
    return serviceIds.reduce((sum, id) => sum + (availableServices.find(s => s.id === id)?.price || 0), 0);
  }

  const handleServiceToggle = (serviceId: number) => {
    const ids = pkg.serviceIds.includes(serviceId)
      ? pkg.serviceIds.filter(id => id !== serviceId)
      : [...pkg.serviceIds, serviceId];
    
    // Auto-update price when pulling services in or out, respecting the current discount %
    const newRealValue = calculateRealValue(ids);
    const newPrice = Math.round(newRealValue * (1 - discountPercent / 100));
    setPkg({ ...pkg, serviceIds: ids, price: newPrice });
  };

  const applyDiscountPercent = (percent: number) => {
    if (realValue === 0) return;
    const newPrice = Math.round(realValue * (1 - percent / 100));
    setPkg({ ...pkg, price: newPrice });
    setDiscountPercent(percent);
  };

  const manualPriceChange = (newPrice: number) => {
    setPkg({ ...pkg, price: newPrice });
    setDiscountPercent(realValue > 0 ? Math.max(0, Math.min(100, Math.round(((realValue - newPrice) / realValue) * 100))) : 0);
  };

  const suggestedDiscounts = [
    { label: '10%', percent: 10 },
    { label: '15%', percent: 15 },
    { label: '20%', percent: 20 },
    { label: '25%', percent: 25 },
  ];

  const isValid = pkg.name && pkg.category && pkg.price >= 0 && pkg.serviceIds.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 !w-[95vw] !max-w-[1200px] p-0 overflow-hidden rounded-[2rem] shadow-2xl">
        
        {/* Encabezado Espacioso */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {pkg.isNew ? t('dialog_create', { defaultValue: 'Diseñar Nuevo Paquete' }) : t('dialog_edit', { defaultValue: 'Editar Paquete' })}
              </DialogTitle>
              <DialogDescription className="text-base text-slate-500 dark:text-slate-400 font-light">
                {t('dialog_desc', { defaultValue: 'Agrupa servicios, aplica un descuento estratégico y potencia tus ventas.' })}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* ScrollArea ajustada para no desbordar la pantalla verticalmente */}
        <ScrollArea className="max-h-[60vh] bg-slate-50 dark:bg-slate-950">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Columna Izquierda: Identidad Visual y Detalles */}
              <div className="space-y-8">
                
                {/* Fotografía Panorámica */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     {t('photo', { defaultValue: 'Portada del Paquete' })}
                  </Label>
                  <div className={cn(
                    "w-full aspect-[21/9] rounded-3xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer bg-white dark:bg-slate-900 group",
                    pkg.imageUrl ? "border-transparent shadow-lg" : "border-dashed border-slate-300 dark:border-slate-700 hover:border-medical-400 hover:bg-medical-50/50 dark:hover:bg-medical-500/5 hover:scale-[1.01]"
                  )}>
                    {pkg.imageUrl ? (
                      <img src={pkg.imageUrl} alt="Paquete" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center p-6">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-medical-100 dark:group-hover:bg-medical-500/20 transition-colors">
                          <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-medical-500 transition-colors" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Haz clic para subir un banner</p>
                        <p className="text-xs text-slate-500 mt-1 font-light">Resolución recomendada: 1200x500px</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Campos de Información (Taller Inputs) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('name_label')}</Label>
                    <Input 
                      placeholder={t('name_placeholder')} 
                      value={pkg.name} 
                      onChange={(e) => setPkg({ ...pkg, name: e.target.value })} 
                      className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-14 text-base px-4 focus-visible:ring-medical-500/20 focus-visible:border-medical-500 transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('category_label')}</Label>
                    <Input 
                      placeholder={t('category_placeholder')} 
                      value={pkg.category} 
                      onChange={(e) => setPkg({ ...pkg, category: e.target.value })} 
                      className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-14 text-base px-4 focus-visible:ring-medical-500/20 focus-visible:border-medical-500 transition-all shadow-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('desc_label')}</Label>
                  <Textarea 
                    placeholder={t('desc_placeholder')} 
                    value={pkg.description} 
                    onChange={(e) => setPkg({ ...pkg, description: e.target.value })} 
                    rows={4} 
                    className="rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base p-4 focus-visible:ring-medical-500/20 focus-visible:border-medical-500 transition-all shadow-sm resize-none" 
                  />
                </div>
              </div>

              {/* Columna Derecha: Configuración Estratégica */}
              <div className="flex flex-col gap-6">
                
                {/* 1. SELECCIÓN DE SERVICIOS */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-5">
                    <Label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      <ShoppingCart className="w-5 h-5 text-medical-500" /> {t('included_services')}
                    </Label>
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full font-bold">
                      {pkg.serviceIds.length}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {availableServices.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                        <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('no_services')}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">{t('no_services_desc')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availableServices.map(service => {
                          const isSelected = pkg.serviceIds.includes(service.id);
                          return (
                            <div 
                              key={service.id} onClick={() => handleServiceToggle(service.id)}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                                isSelected 
                                  ? "bg-medical-50/80 dark:bg-medical-500/10 border-medical-200 dark:border-medical-500/30 shadow-sm" 
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-medical-300 dark:hover:border-medical-700 hover:shadow-sm"
                              )}
                            >
                              <Checkbox 
                                checked={isSelected} 
                                className="w-5 h-5 data-[state=checked]:bg-medical-600 data-[state=checked]:border-medical-600 rounded-md" 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-0.5 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                  {service.name}
                                </p>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">${service.price} MXN</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. MOTOR DE PRECIOS Y VALOR */}
                <div className={cn(
                  "bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition-all duration-500 relative overflow-hidden",
                  pkg.serviceIds.length > 0 ? "border-medical-200 dark:border-medical-800 ring-1 ring-medical-500/10" : "border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none"
                )}>
                  
                  {/* Decorative background gradient */}
                  {pkg.serviceIds.length > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-medical-50/50 via-transparent to-transparent dark:from-medical-500/5 pointer-events-none" />
                  )}

                  <div className="relative z-10 space-y-6">
                    {/* Valuación */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-1">{t('real_value')}</p>
                        <p className="text-xl font-medium text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600">${realValue}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest mb-1 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t('saving', { defaultValue: 'Ahorro' })}
                        </p>
                        <p className="text-2xl font-black text-emerald-500">${savings}</p>
                      </div>
                    </div>

                    {/* Deslizador de Descuento */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                          <Percent className="w-4 h-4 text-emerald-500" /> Descuento Sugerido
                        </Label>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-100 border-0 font-black px-2">
                          {discountPercent}%
                        </Badge>
                      </div>
                      
                      <Slider 
                        value={[discountPercent]} max={60} min={0} step={1}
                        onValueChange={(vals) => applyDiscountPercent(vals[0])}
                        className="py-2 [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white dark:[&_[role=slider]]:border-slate-900 [&_[role=slider]]:shadow-lg [&_[role=slider]]:w-6 [&_[role=slider]]:h-6"
                      />

                      <div className="flex gap-2">
                        {suggestedDiscounts.map((sug, idx) => (
                          <Badge 
                            key={idx} variant="outline" 
                            onClick={() => applyDiscountPercent(sug.percent)} 
                            className={cn(
                              "cursor-pointer transition-all flex-1 justify-center py-2 border font-bold text-xs rounded-xl",
                              discountPercent === sug.percent 
                                ? "bg-emerald-500 border-emerald-500 text-white dark:bg-emerald-600 dark:border-emerald-600 hover:bg-emerald-600" 
                                : "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            )}
                          >
                            {sug.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Input Precio Final */}
                    <div className="pt-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">{t('manual_price')}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-medical-600 dark:text-medical-400" />
                        <Input 
                          type="number" min="0" value={pkg.price || ''}
                          onChange={(e) => manualPriceChange(Number(e.target.value))}
                          className="pl-12 rounded-2xl bg-white dark:bg-slate-950 border-2 border-medical-200 dark:border-medical-800 h-16 text-3xl font-black text-medical-600 dark:text-medical-400 focus-visible:ring-medical-500/30 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium mb-4 sm:mb-0">
            {!isValid && (
              <>
                <Info className="w-4 h-4 text-amber-500" />
                <span>Llena todos los campos para guardar</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200 dark:border-slate-700 h-12 px-6 font-bold flex-1 sm:flex-initial">
              {t('cancel')}
            </Button>
            <Button 
              onClick={() => onSave(pkg)} 
              disabled={!isValid} 
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 h-12 flex-1 sm:flex-initial px-8 font-bold shadow-none transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 mr-2" /> {t('save_package')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}