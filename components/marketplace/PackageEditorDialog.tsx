"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-pass-data-to-parent */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Zap, Percent, DollarSign, ShoppingCart, CheckCircle2, AlertCircle, Info, Camera, CheckSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (isOpen && initialData) {
 const p = { ...initialData, packageItems: initialData.packageItems || [] };
 setPkg(p);
 const rVal = calculateRealValue(p.packageItems);
 setDiscountPercent(rVal > 0 ? Math.round(((rVal - p.price) / rVal) * 100) : 15);
 }
 }, [isOpen, initialData]);

 if (!pkg) return null;

 const realValue = calculateRealValue(pkg.packageItems);
 const savings = Math.max(0, realValue - pkg.price);

 function calculateRealValue(items: UI_Package['packageItems']) {
 if (!items) return 0;
 return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 }

 const handleQuantityChange = (serviceId: number, delta: number) => {
 let currentItems = [...(pkg.packageItems || [])];
 const existingIndex = currentItems.findIndex(i => i.id === serviceId);
 
 if (existingIndex >= 0) {
 const newQuantity = Math.max(0, currentItems[existingIndex].quantity + delta);
 if (newQuantity === 0) {
 currentItems.splice(existingIndex, 1);
 } else {
 currentItems[existingIndex].quantity = newQuantity;
 }
 } else if (delta > 0) {
 const service = availableServices.find(s => s.id === serviceId);
 if (service) {
 currentItems.push({
 id: service.id,
 name: service.name,
 type: 'SERVICE',
 price: service.price,
 quantity: delta
 });
 }
 }
 
 const newRealValue = calculateRealValue(currentItems);
 const newPrice = Math.round(newRealValue * (1 - discountPercent / 100));
 setPkg({ ...pkg, packageItems: currentItems, price: newPrice });
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

 const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file || !pkg) return;
 const objectUrl = URL.createObjectURL(file);
 setPkg({ ...pkg, imageUrl: objectUrl });
 if (onImageUpload) onImageUpload(pkg.id, file);
 e.target.value = '';
 };

 const suggestedDiscounts = [
 { label: '10%', percent: 10 },
 { label: '15%', percent: 15 },
 { label: '20%', percent: 20 },
 { label: '25%', percent: 25 },
 ];

 const isValid = pkg.name && pkg.category && pkg.price >= 0 && (pkg.packageItems || []).length > 0;

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
 <DialogContent className="[&>button]:hidden bg-white dark:bg-[#0a0a0a] border border-black dark:border-white !w-[95vw] !max-w-[1200px] p-0 overflow-hidden rounded-none shadow-2xl flex flex-col max-h-[90vh]">
 
 {/* --- HEADER ARQUITECTÓNICO --- */}
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
 <ShoppingCart className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
 Ensamblador Comercial
 </p>
 <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
 {pkg.isNew ? t('dialog_create', { defaultValue: 'NUEVO PAQUETE' }) : t('dialog_edit', { defaultValue: 'EDICIÓN DE PAQUETE' })}
 </DialogTitle>
 </div>
 </div>
 <button 
 onClick={onClose} 
 className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-colors border border-transparent hover:border-black/20 dark:hover:border-white/20 shrink-0"
 >
 <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
 </button>
 </div>

 {/* --- ÁREA DE SCROLL PRINCIPAL --- */}
 <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 
 {/* --- COLUMNA IZQUIERDA: IDENTIDAD Y DETALLES --- */}
 <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10">
 
 {/* Fotografía Panorámica */}
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex flex-col">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
 <Camera className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('photo', { defaultValue: 'RECURSO GRÁFICO (BANNER)' })}
 </label>

 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />

 <div
 onClick={() => fileInputRef.current?.click()}
 className={cn(
 "w-full aspect-[21/9] border border-black/20 dark:border-white/20 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer group bg-white dark:bg-[#0a0a0a] rounded-none",
 pkg.imageUrl ? "" : "border-dashed hover:bg-black/5 dark:hover:bg-white/5"
 )}
 >
 {pkg.imageUrl ? (
 <img src={pkg.imageUrl} alt="Paquete" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
 ) : (
 <div className="text-center flex flex-col items-center p-6">
 <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-4 transition-colors">
 <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white" strokeWidth={1.5} />
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">SELECCIONAR ARCHIVO</p>
 <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mt-2">1200x500PX RECOMENDADO</p>
 </div>
 )}
 </div>
 </div>

 {/* Formulario (Inputs) */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 <div className="flex flex-col sm:flex-row border-b border-black/10 dark:border-white/10">
 <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
 {t('name_label', { defaultValue: 'DENOMINACIÓN' })} <span className="text-red-500">*</span>
 </label>
 <input 
 value={pkg.name} 
 onChange={(e) => setPkg({ ...pkg, name: e.target.value.toUpperCase() })} 
 placeholder="EJ. PAQUETE PREVENTIVO" 
 className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" 
 />
 <div className="mt-2 text-[9px] font-bold uppercase tracking-widest flex items-center justify-between">
 <span className={cn(
 (pkg.name.trim() ? pkg.name.trim().split(/\s+/).length : 0) < 3 ? "text-red-500" : "text-emerald-500"
 )}>
 {(pkg.name.trim() ? pkg.name.trim().split(/\s+/).length : 0)} / 3 PALABRAS MÍN.
 </span>
 </div>
 </div>
 <div className="flex-1 p-6">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
 {t('category_label', { defaultValue: 'CATEGORIZACIÓN' })} <span className="text-red-500">*</span>
 </label>
 <input 
 value={pkg.category} 
 onChange={(e) => setPkg({ ...pkg, category: e.target.value.toUpperCase() })} 
 placeholder="EJ. CHEQUEOS GENERALES" 
 className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" 
 />
 </div>
 </div>

 <div className="p-6">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
 {t('desc_label', { defaultValue: 'ESPECIFICACIONES DEL PAQUETE' })}
 </label>
 <textarea 
 value={pkg.description} 
 onChange={(e) => setPkg({ ...pkg, description: e.target.value.toUpperCase() })} 
 placeholder={t('desc_placeholder', { defaultValue: 'DESCRIPCIÓN COMERCIAL...' })}
 rows={4} 
 className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors resize-y placeholder:text-gray-400" 
 />
 <div className="mt-2 text-[9px] font-bold uppercase tracking-widest flex items-center justify-between">
 <span className={cn(
 (pkg.description?.length || 0) < 150 ? "text-red-500" : "text-emerald-500"
 )}>
 {(pkg.description?.length || 0)} / 150 CARACTERES MÍN.
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* --- COLUMNA DERECHA: ENSAMBLE Y MOTOR DE PRECIOS --- */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* 1. SELECCIÓN DE SERVICIOS */}
 <div className="flex flex-col border-b border-black/10 dark:border-white/10 flex-1 min-h-[300px]">
 <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
 <CheckSquare className="w-3.5 h-3.5" strokeWidth={1.5} /> {t('included_services', { defaultValue: 'SERVICIOS INTEGRADOS' })}
 </label>
 <span className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-black dark:text-white">
 {(pkg.packageItems || []).reduce((acc, i) => acc + i.quantity, 0)} ITEMS
 </span>
 </div>
 
 <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a]">
 {availableServices.length === 0 ? (
 <div className="flex flex-col items-center justify-center text-center p-12 h-full">
 <AlertCircle className="w-8 h-8 text-gray-400 mb-4" strokeWidth={1.5} />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{t('no_services', { defaultValue: 'INVENTARIO VACÍO' })}</p>
 <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 max-w-xs leading-relaxed">{t('no_services_desc', { defaultValue: 'AGREGUE SERVICIOS AL CATÁLOGO PREVIO A LA CREACIÓN DE UN PAQUETE.' })}</p>
 </div>
 ) : (
 <div className="flex flex-col">
 {availableServices.map(service => {
 const packageItem = (pkg.packageItems || []).find(i => i.id === service.id);
 const quantity = packageItem ? packageItem.quantity : 0;
 const isSelected = quantity > 0;
 return (
 <div 
 key={service.id} 
 className={cn(
 "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-black/10 dark:border-white/10 transition-colors",
 isSelected ? "bg-black/5 dark:bg-white/5" : "hover:bg-gray-50 dark:hover:bg-[#111]"
 )}
 >
 <div className="flex-1 min-w-0 flex items-center gap-4">
 <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 text-[10px] font-bold">
 {quantity}x
 </div>
 <div className="flex flex-col min-w-0">
 <p className={cn(
 "text-xs font-semibold uppercase tracking-widest truncate",
 isSelected ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
 )}>
 {service.name}
 </p>
 <span className="text-[10px] font-mono font-bold tracking-widest shrink-0 text-gray-500">
 ${service.price} C/U
 </span>
 </div>
 </div>
 
 <div className="flex items-center border border-black/20 dark:border-white/20 shrink-0 h-8">
 <button 
 onClick={() => handleQuantityChange(service.id, -1)}
 className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white transition-colors"
 >
 -
 </button>
 <div className="w-8 h-full flex items-center justify-center text-xs font-bold font-mono border-x border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
 {quantity}
 </div>
 <button 
 onClick={() => handleQuantityChange(service.id, 1)}
 className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white transition-colors"
 >
 +
 </button>
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
 "p-6 md:p-8 flex flex-col bg-gray-50 dark:bg-[#050505] transition-opacity",
 (pkg.packageItems || []).length === 0 && "opacity-50 pointer-events-none"
 )}>
 
 {/* Valuación */}
 <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-6 mb-6">
 <div className="flex flex-col gap-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {t('real_value', { defaultValue: 'VALOR TÉCNICO' })}
 </p>
 <p className="text-sm font-mono font-bold text-gray-400 line-through decoration-gray-500">
 ${realValue}
 </p>
 </div>
 <div className="flex flex-col items-end gap-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
 {t('saving', { defaultValue: 'DIFERENCIAL (AHORRO)' })} <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
 </p>
 <p className="text-xl font-mono font-black tracking-tight text-emerald-600 dark:text-emerald-400">
 ${savings}
 </p>
 </div>
 </div>

 {/* Controles de Precio */}
 <div className="flex flex-col gap-6">
 
 <div className="flex flex-col gap-4">
 <div className="flex items-center justify-between">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
 <Percent className="w-3.5 h-3.5" strokeWidth={1.5} /> COMPRESIÓN DE PRECIO (%)
 </label>
 <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
 {discountPercent}%
 </span>
 </div>
 
 {/* El slider de shadcn requerirá clases custom para verse brutalista, se aplican aquí */}
 <Slider 
 value={[discountPercent]} max={60} min={0} step={1}
 onValueChange={(vals) => applyDiscountPercent(vals[0])}
 className="py-2 [&_[role=slider]]:bg-black dark:[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:w-4 [&_[role=slider]]:h-6 [&_[role=slider]]:rounded-none [&_.bg-primary]:bg-black dark:[&_.bg-primary]:bg-white [&_.bg-secondary]:bg-black/10 dark:[&_.bg-secondary]:bg-white/10"
 />

 <div className="flex gap-2">
 {suggestedDiscounts.map((sug, idx) => (
 <button 
 key={idx} 
 onClick={() => applyDiscountPercent(sug.percent)} 
 className={cn(
 "flex-1 h-8 border text-[9px] font-bold uppercase tracking-widest transition-colors rounded-none",
 discountPercent === sug.percent 
 ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" 
 : "border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]"
 )}
 >
 {sug.label}
 </button>
 ))}
 </div>
 </div>

 <div className="flex flex-col">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
 {t('manual_price', { defaultValue: 'VALOR COMERCIAL FINAL' })}
 </label>
 <div className="relative">
 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white pointer-events-none" strokeWidth={2} />
 <input 
 type="number" min="0" value={pkg.price || ''}
 onChange={(e) => manualPriceChange(Number(e.target.value))}
 className="w-full h-14 pl-12 pr-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-lg font-mono font-black tracking-widest text-black dark:text-white uppercase focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors"
 />
 </div>
 </div>

 </div>

 </div>

 </div>
 </div>
 </div>

 {/* --- FOOTER DE COMANDOS --- */}
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
 
 <div className="flex items-center gap-2 w-full sm:w-auto text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
 {!isValid && (
 <>
 <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
 <span>COMPLETE LOS CAMPOS OBLIGATORIOS (*)</span>
 </>
 )}
 </div>

 <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
 <button 
 onClick={onClose} 
 className="h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none w-full sm:w-auto"
 >
 {t('cancel', { defaultValue: 'ANULAR' })}
 </button>
 <button 
 onClick={() => onSave(pkg)} 
 disabled={!isValid} 
 className="h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none w-full sm:w-auto disabled:opacity-50"
 >
 <Zap className="w-4 h-4" strokeWidth={1.5} /> {t('save_package', { defaultValue: 'CONFIRMAR ENSAMBLE' })}
 </button>
 </div>
 
 </div>

 </DialogContent>
 </Dialog>
 );
}