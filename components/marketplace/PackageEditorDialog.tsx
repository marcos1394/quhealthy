"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X, Zap, Percent, DollarSign, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";
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
import {  UI_Package, UI_Service } from "@/types/catalog";

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
    setPkg({ ...pkg, serviceIds: ids });
  };

  const applyDiscountPercent = (percent: number) => {
    if (realValue === 0) return;
    const newPrice = Math.round(realValue * (1 - percent / 100));
    setPkg({ ...pkg, price: newPrice });
    setDiscountPercent(percent);
  };

  const suggestedDiscounts = [
    { label: '10% OFF', percent: 10 },
    { label: '15% OFF', percent: 15 },
    { label: '20% OFF', percent: 20 }
  ];

  const isValid = pkg.name && pkg.category && pkg.price > 0 && pkg.serviceIds.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-5xl p-0 overflow-hidden rounded-[2rem]">
        
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {pkg.isNew ? t('dialog_create', { defaultValue: 'Crear Paquete' }) : t('dialog_edit', { defaultValue: 'Editar Paquete' })}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                {t('dialog_desc')}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-8 py-6">
          <div className="space-y-8">
            
            {/* Banner de Valor Real */}
            {pkg.serviceIds.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-medical-50 dark:bg-medical-500/5 border border-medical-100 dark:border-medical-500/20 rounded-3xl p-6">
                <div className="grid grid-cols-3 gap-6 text-center divide-x divide-medical-200 dark:divide-medical-800/50">
                  <div>
                    <p className="text-[10px] text-medical-600 dark:text-medical-400 uppercase font-bold tracking-wider mb-1">{t('real_value')}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">${realValue}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-medical-600 dark:text-medical-400 uppercase font-bold tracking-wider mb-1">{t('your_price')}</p>
                    <p className="text-2xl font-black text-medical-600 dark:text-medical-400">${pkg.price}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider mb-1">{t('saving')}</p>
                    <p className="text-2xl font-black text-emerald-500">${savings}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Columna Izquierda: Datos del Paquete */}
              <div className="space-y-6">
                <div className="flex gap-5 items-start">
                  {/* Foto */}
                  <div className="relative group/pkg-img flex-shrink-0">
                    <div className={cn(
                      "w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/50",
                      pkg.imageUrl ? "border-transparent shadow-md" : "border-dashed border-slate-300 dark:border-slate-700 hover:border-medical-400"
                    )}>
                      {pkg.imageUrl ? (
                        <img src={pkg.imageUrl} alt="Paquete" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-slate-400 mb-2" />
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('photo')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('name_label')}</Label>
                      <Input placeholder={t('name_placeholder')} value={pkg.name} onChange={(e) => setPkg({ ...pkg, name: e.target.value })} className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('category_label')}</Label>
                      <Input placeholder={t('category_placeholder')} value={pkg.category} onChange={(e) => setPkg({ ...pkg, category: e.target.value })} className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-11" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('desc_label')}</Label>
                  <Textarea placeholder={t('desc_placeholder')} value={pkg.description} onChange={(e) => setPkg({ ...pkg, description: e.target.value })} rows={3} className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 resize-none" />
                </div>

                {/* Motor de Precios */}
                {pkg.serviceIds.length > 0 && (
                  <div className="space-y-5 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-500" /> {t('apply_discount', { percent: discountPercent })}
                    </Label>
                    
                    <Slider 
                      value={[discountPercent]} max={50} min={0} step={5}
                      onValueChange={(vals) => applyDiscountPercent(vals[0])}
                      className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                    />

                    <div className="flex gap-2">
                      {suggestedDiscounts.map((sug, idx) => (
                        <Badge key={idx} variant="outline" onClick={() => applyDiscountPercent(sug.percent)} className="cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex-1 justify-center py-2">
                          {sug.label}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-1.5 relative">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('manual_price')}</Label>
                      <DollarSign className="absolute left-3 top-[28px] w-5 h-5 text-slate-400" />
                      <Input 
                        type="number" min="0" value={pkg.price || ''}
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          setPkg({ ...pkg, price: newPrice });
                          setDiscountPercent(realValue > 0 ? Math.max(0, Math.min(100, Math.round(((realValue - newPrice) / realValue) * 100))) : 0);
                        }}
                        className="pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 h-12 text-lg font-bold text-medical-600 dark:text-medical-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Selección de Servicios */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col h-full">
                <Label className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <ShoppingCart className="w-4 h-4 text-medical-500" /> {t('included_services')}
                </Label>
                
                {availableServices.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-amber-500 mb-3" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t('no_services')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('no_services_desc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableServices.map(service => {
                      const isSelected = pkg.serviceIds.includes(service.id);
                      return (
                        <div 
                          key={service.id} onClick={() => handleServiceToggle(service.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer",
                            isSelected ? "bg-medical-50 dark:bg-medical-500/10 border-medical-200 dark:border-medical-500/30 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-medical-300"
                          )}
                        >
                          <Checkbox checked={isSelected} className="data-[state=checked]:bg-medical-600 data-[state=checked]:border-medical-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{service.name}</p>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">${service.price}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-medical-500 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200 dark:border-slate-700">{t('cancel')}</Button>
          <Button onClick={() => onSave(pkg)} disabled={!isValid} className="rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold px-8">
            <Zap className="w-4 h-4 mr-2" /> {t('save_package')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}