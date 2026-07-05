"use client"
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useRef, useState } from "react";
import { Plus, Trash2, Save, ImagePlus, ShoppingBag, Box, Barcode, Tag, Info, Sparkles, Camera, Loader2, FlaskConical, Building2, ShieldAlert, FileText, Truck, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const COFEPRIS_CATEGORIES = [
 { value: 'OTC_GENERAL', label: 'Venta Libre (Supermercados)' },
 { value: 'OTC_FARMACIA', label: 'Venta Libre (Exclusivo Farmacia)' },
 { value: 'RECETA_SIMPLE', label: 'Requiere Receta Simple' },
 { value: 'ANTIBIOTICO', label: 'Antibiótico (Requiere Sello/Retención)' },
 { value: 'PSICOTROPICO_CONTROLADO', label: 'Psicotrópico (Grupo III - Surtible 3 veces)' },
 { value: 'PSICOTROPICO_RETENCION', label: 'Psicotrópico (Grupo II - Retención Obligatoria)' },
 { value: 'ESTUPEFACIENTE', label: 'Estupefaciente (Grupo I - PROHIBIDO E-COMMERCE)' },
];

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UI_Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

// 🚀 MAGIA DE IA: Importamos el servicio y el manejador de errores
import { catalogAiService } from '@/services/catalogAiService';
import { complianceService } from '@/services/compliance.service';
import { handleApiError } from '@/lib/handleApiError';
import { CameraModal } from "./CameraModal";

interface ProductsManagerProps {
 products: UI_Product[];
 onAdd: () => void;
 onUpdate: (id: number, updates: Partial<UI_Product>) => void;
 onSave: (product: UI_Product) => void;
 onDelete: (id: number) => void;
 onImageUpload: (id: number, file: File) => void;
 canAdd?: boolean;
 currentUsage?: number;
 maxLimit?: number | null;
}

export function ProductsManager({
 products, 
 onAdd, 
 onUpdate, 
 onSave, 
 onDelete, 
 onImageUpload,
 canAdd = true,
 currentUsage,
 maxLimit
}: ProductsManagerProps) {
 const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
 
 // 🚀 MAGIA DE IA: Refs para los inputs de cámara de IA
 const [scanningProductId, setScanningProductId] = useState<number | null>(null);
 const [isCameraOpen, setIsCameraOpen] = useState(false);
 const [activeProductIdForCamera, setActiveProductIdForCamera] = useState<number | null>(null);

 const activeIngredientTimers = useRef<{ [key: number]: NodeJS.Timeout }>({});
 const [suggestStatus, setSuggestStatus] = useState<{ [key: number]: 'NONE' | 'SEARCHING' | 'FOUND' | 'NOT_FOUND' }>({});

 const t = useTranslations('Marketplace.products');
 const tGlobal = useTranslations('StoreCatalog.actions');

 const handleAddWrapper = () => {
 if (!canAdd) {
 toast.warning(t('limit_reached_msg', { defaultValue: 'Has alcanzado el límite de productos de tu plan.' }));
 return;
 }
 onAdd();
 };

 // 🚀 MAGIA DE IA: Función que procesa la imagen (Base64 o File)
 const processImageWithAi = async (productId: number, base64OrFile: string | File) => {
 setScanningProductId(productId);
 const loadingToast = toast.loading("Analizando caja con Inteligencia Artificial...");

 try {
 let base64String: string;
 
 if (base64OrFile instanceof File) {
 base64String = await new Promise((resolve) => {
 const reader = new FileReader();
 reader.readAsDataURL(base64OrFile);
 reader.onload = () => resolve(reader.result as string);
 });
 } else {
 base64String = base64OrFile;
 }

 const aiData = await catalogAiService.scanProductImage(base64String);

 onUpdate(productId, {
 name: aiData.name || '',
 description: aiData.description || '',
 activeIngredient: aiData.activeIngredient || '',
 manufacturer: aiData.manufacturer || '',
 cofeprisCategory: aiData.cofeprisCategory || 'OTC_GENERAL',
 requiresPrescription: aiData.requiresPrescription || false,
 isAntibiotic: aiData.isAntibiotic || false,
 requiresPhysicalRetention: aiData.requiresPhysicalRetention || false,
 allowsInterstateShipping: aiData.allowsInterstateShipping ?? true,
 });

 toast.update(loadingToast, { render: "¡Datos extraídos con éxito!", type: "success", isLoading: false, autoClose: 3000 });
 } catch (error) {
 handleApiError(error);
 toast.update(loadingToast, { render: "No pudimos extraer los datos de la imagen.", type: "error", isLoading: false, autoClose: 3000 });
 } finally {
 setScanningProductId(null);
 }
 };

 const handleAiScan = async (event: React.ChangeEvent<HTMLInputElement>, productId: number) => {
 const file = event.target.files?.[0];
 if (!file) return;
 await processImageWithAi(productId, file);
 event.target.value = ''; // Limpiar input
 };

 const handleActiveIngredientChange = (productId: number, value: string) => {
 onUpdate(productId, { activeIngredient: value });

 if (activeIngredientTimers.current[productId]) {
 clearTimeout(activeIngredientTimers.current[productId]);
 }

 if (!value || value.trim().length < 3) {
 onUpdate(productId, {
 cofeprisCategory: 'OTC_GENERAL',
 requiresPrescription: false,
 isAntibiotic: false,
 requiresPhysicalRetention: false,
 allowsInterstateShipping: true,
 });
 setSuggestStatus(prev => ({ ...prev, [productId]: 'NONE' }));
 return;
 }

 setSuggestStatus(prev => ({ ...prev, [productId]: 'SEARCHING' }));

 activeIngredientTimers.current[productId] = setTimeout(async () => {
 try {
 const result = await complianceService.suggestComplianceByIngredient(value);
 if (result.found) {
 onUpdate(productId, {
 cofeprisCategory: result.cofeprisCategory,
 requiresPrescription: result.requiresPrescription,
 isAntibiotic: result.isAntibiotic,
 requiresPhysicalRetention: result.requiresPhysicalRetention,
 allowsInterstateShipping: result.allowsInterstateShipping,
 });
 setSuggestStatus(prev => ({ ...prev, [productId]: 'FOUND' }));
 toast.info(`Reglas COFEPRIS aplicadas para: ${value}`);
 } else {
 onUpdate(productId, {
 cofeprisCategory: 'OTC_GENERAL',
 requiresPrescription: false,
 isAntibiotic: false,
 requiresPhysicalRetention: false,
 allowsInterstateShipping: true,
 });
 setSuggestStatus(prev => ({ ...prev, [productId]: 'NOT_FOUND' }));
 }
 } catch (error) {
 setSuggestStatus(prev => ({ ...prev, [productId]: 'NONE' }));
 }
 }, 600);
 };

 return (
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* --- CABECERA (HEADER) --- */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505] gap-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
 <ShoppingBag className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
 {t('title', { defaultValue: 'Farmacia e Insumos' })}
 </h2>
 <div className="flex flex-wrap items-center gap-3">
 {products.length > 0 && (
 <span className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
 <Sparkles className="w-3 h-3" strokeWidth={2} />
 {products.length} Registros Activos
 </span>
 )}

 {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
 <span className={cn(
 "border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1",
 canAdd 
 ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" 
 : "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
 )}>
 Consumo: {currentUsage} / {maxLimit}
 </span>
 )}
 </div>
 </div>
 </div>

 <Button 
 onClick={handleAddWrapper} 
 disabled={!canAdd}
 className="w-full sm:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed border-0"
 >
 <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> 
 {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Agotado' }) : t('btn_add', { defaultValue: 'Nuevo Producto' })}
 </Button>
 </div>

 <div className="p-6 md:p-8 space-y-8 bg-gray-50/50 dark:bg-[#050505]/50">
 
 {products.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-400 dark:border-gray-600 bg-white dark:bg-[#0a0a0a]"
 >
 <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-6">
 <ShoppingBag className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
 {t('empty_state', { defaultValue: 'Inventario Vacío' })}
 </p>
 <p className="text-xs text-gray-500 font-light mb-8 max-w-sm text-center leading-relaxed">
 {t('empty_desc', { defaultValue: 'Agrega medicamentos, suplementos o productos que ofrezcas en tu clínica.' })}
 </p>
 <Button 
 onClick={handleAddWrapper}
 disabled={!canAdd}
 className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-8 disabled:opacity-50 border-0"
 >
 <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
 {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Registrar Primer Producto' })}
 </Button>
 </motion.div>
 ) : (
 /* --- LISTA DE PRODUCTOS --- */
 <AnimatePresence mode="popLayout">
 {products.map((product) => (
 <motion.div
 key={product.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 layout
 className={cn(
 "border bg-white dark:bg-[#0a0a0a] transition-colors",
 product.isNew || product.hasUnsavedChanges 
 ? "border-black dark:border-white ring-1 ring-black dark:ring-white" 
 : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white"
 )}
 >
 <div className="flex flex-col lg:flex-row">

 {/* 📸 Zona Lateral: Imagen del Producto */}
 <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6 md:p-8 flex flex-col justify-between">
 <div className="space-y-4">
 
 {/* Estado superior */}
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-gray-400">ID: {product.id < 0 ? 'NUEVO' : product.id}</span>
 {(product.isNew || product.hasUnsavedChanges) && (
 <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-2 py-1">
 Modificado
 </span>
 )}
 </div>

 {/* Dropzone Imagen */}
 <div
 className="w-full aspect-square border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black overflow-hidden relative cursor-pointer group hover:border-black dark:hover:border-white transition-colors mt-4"
 onClick={() => fileInputRefs.current[product.id]?.click()}
 >
 {product.imageUrl ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen" />
 ) : (
 <ImagePlus className="w-8 h-8 text-gray-400" strokeWidth={1} />
 )}
 <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
 <span className="text-[9px] font-bold uppercase tracking-widest text-white border border-white px-2 py-1">
 {t('change_image', { defaultValue: 'Actualizar' })}
 </span>
 </div>
 </div>
 
 <input
 type="file"
 accept="image/*"
 className="hidden"
 ref={el => { fileInputRefs.current[product.id] = el; }}
 onChange={(e) => {
 if (e.target.files && e.target.files[0]) {
 onImageUpload(product.id, e.target.files[0]);
 }
 }}
 />
 </div>
 </div>

 {/* 📝 Zona Principal: Formulario */}
 <div className="flex-1 p-6 md:p-8 space-y-8">
 
 {/* 🚀 MAGIA DE IA: Banner de Escaneo Inteligente (Blueprint Style) */}
 <div className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
 <div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center">
 <Sparkles className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
 Módulo de Extracción IA
 </h4>
 <p className="text-xs text-gray-500 font-light mt-1">
 Escanea el empaque del medicamento para autocompletar la ficha técnica.
 </p>
 </div>
 <div className="flex gap-3 w-full md:w-auto">
 <input 
 type="file" 
 accept="image/*" 
 ref={el => { fileInputRefs.current[`ai_gallery_${product.id}` as any] = el as any; }}
 className="hidden" 
 onChange={(e) => handleAiScan(e, product.id)} 
 />
 <Button 
 type="button"
 onClick={() => {
 setActiveProductIdForCamera(product.id);
 setIsCameraOpen(true);
 }}
 disabled={scanningProductId === product.id}
 className="flex-1 md:flex-none rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest h-10 px-4 border-0"
 >
 {scanningProductId === product.id ? (
 <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> ...</>
 ) : (
 <><Camera className="w-3.5 h-3.5 mr-2" strokeWidth={2} /> Escanear</>
 )}
 </Button>
 <Button 
 type="button"
 variant="outline"
 onClick={() => (fileInputRefs.current[`ai_gallery_${product.id}` as any] as any)?.click()}
 disabled={scanningProductId === product.id}
 className="flex-1 md:flex-none rounded-none border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-10 px-4 transition-colors"
 >
 <ImagePlus className="w-3.5 h-3.5 mr-2" strokeWidth={2} /> Archivo
 </Button>
 </div>
 </div>

 {/* Campos Básicos */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 {t('label_name', { defaultValue: 'Denominación Comercial' })}
 </label>
 <Input 
 value={product.name} 
 onChange={e => onUpdate(product.id, { name: e.target.value })} 
 placeholder={t('placeholder_name', { defaultValue: 'Ej: Suplemento vitamínico' })} 
 className={cn(
 "rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors", 
 !product.name ? "border-red-500" : ""
 )} 
 />
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 {t('label_price', { defaultValue: 'Precio Unitario' })}
 </label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
 <Input 
 type="number" min="0" value={product.price || ''} 
 onChange={e => onUpdate(product.id, { price: parseFloat(e.target.value) || 0 })} 
 className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 pl-8 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <Tag className="w-3 h-3" strokeWidth={2} /> {t('label_category', { defaultValue: 'Categoría' })}
 </label>
 <Input 
 value={product.category} 
 onChange={e => onUpdate(product.id, { category: e.target.value })} 
 placeholder={t('placeholder_category', { defaultValue: 'Farmacia' })} 
 className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>
 </div>
 </div>

 {/* 🛡️ SECCIÓN CUMPLIMIENTO REGULATORIO (COFEPRIS) */}
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 
 <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#050505]">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.5} /> Cumplimiento Regulatorio y Farmacológico (COFEPRIS)
 </h4>
 </div>

 <div className="p-6 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Categoría COFEPRIS */}
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Clasificación Sanitaria</label>
 <select
 value={product.cofeprisCategory || 'OTC_GENERAL'}
 onChange={(e) => onUpdate(product.id, { cofeprisCategory: e.target.value })}
 className="w-full h-12 rounded-none bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none appearance-none"
 >
 {COFEPRIS_CATEGORIES.map(cat => (
 <option key={cat.value} value={cat.value}>{cat.label}</option>
 ))}
 </select>
 </div>

 {/* URL Ficha Técnica */}
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Ficha Técnica (IPP PDF)
 </label>
 <Input 
 value={product.technicalSheetUrl || ''} 
 onChange={e => onUpdate(product.id, { technicalSheetUrl: e.target.value })} 
 placeholder="Ej: https://.../medicamento.pdf" 
 className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>

 {/* Sustancia Activa */}
 <div className="space-y-2 relative">
 <div className="flex items-center justify-between">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.5} /> Sustancia Activa
 </label>
 {suggestStatus[product.id] === 'SEARCHING' && (
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 animate-pulse">
 Validando BD...
 </span>
 )}
 {suggestStatus[product.id] === 'FOUND' && (
 <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-1">
 <Check className="w-3 h-3" /> Reglas Aplicadas
 </span>
 )}
 </div>
 <Input 
 value={product.activeIngredient || ''} 
 onChange={e => handleActiveIngredientChange(product.id, e.target.value)} 
 placeholder="Ej: Paracetamol 500mg" 
 className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>

 {/* Laboratorio */}
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Laboratorio / Marca
 </label>
 <Input 
 value={product.manufacturer || ''} 
 onChange={e => onUpdate(product.id, { manufacturer: e.target.value })} 
 placeholder="Ej: Pfizer, Bayer" 
 className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>
 </div>

 {/* Toggles de Compliance (Architectural Checkboxes) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
 <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors group bg-gray-50 dark:bg-[#050505]">
 <input 
 type="checkbox" 
 checked={product.requiresPrescription || false}
 onChange={e => onUpdate(product.id, { requiresPrescription: e.target.checked })}
 className="w-4 h-4 rounded-none border-gray-300 bg-white checked:bg-black checked:border-black dark:bg-[#0a0a0a] dark:border-gray-700 dark:checked:bg-white dark:checked:border-white focus:ring-0 focus:ring-offset-0"
 />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Requiere Receta Médica</span>
 </label>

 <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors group bg-gray-50 dark:bg-[#050505]">
 <input 
 type="checkbox" 
 checked={product.isAntibiotic || false}
 onChange={e => onUpdate(product.id, { isAntibiotic: e.target.checked })}
 className="w-4 h-4 rounded-none border-gray-300 bg-white checked:bg-black checked:border-black dark:bg-[#0a0a0a] dark:border-gray-700 dark:checked:bg-white dark:checked:border-white focus:ring-0 focus:ring-offset-0"
 />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Es Antibiótico (Sello)</span>
 </label>

 <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors group bg-gray-50 dark:bg-[#050505]">
 <input 
 type="checkbox" 
 checked={product.requiresPhysicalRetention || false}
 onChange={e => onUpdate(product.id, { requiresPhysicalRetention: e.target.checked })}
 className="w-4 h-4 rounded-none border-gray-300 bg-white checked:bg-black checked:border-black dark:bg-[#0a0a0a] dark:border-gray-700 dark:checked:bg-white dark:checked:border-white focus:ring-0 focus:ring-offset-0"
 />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Exige Recolectar Original</span>
 </label>

 <label className="flex items-center space-x-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors group bg-gray-50 dark:bg-[#050505]">
 <input 
 type="checkbox" 
 checked={product.allowsInterstateShipping ?? true}
 onChange={e => onUpdate(product.id, { allowsInterstateShipping: e.target.checked })}
 className="w-4 h-4 rounded-none border-gray-300 bg-white checked:bg-black checked:border-black dark:bg-[#0a0a0a] dark:border-gray-700 dark:checked:bg-white dark:checked:border-white focus:ring-0 focus:ring-offset-0"
 />
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <Truck className="w-3 h-3" /> Permite Envío Foráneo
 </span>
 </label>
 </div>
 </div>
 </div>

 {/* Descripción Corta */}
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 {t('label_desc', { defaultValue: 'Descripción Comercial' })}
 </label>
 <Input 
 value={product.description} 
 onChange={e => onUpdate(product.id, { description: e.target.value })} 
 placeholder={t('placeholder_desc', { defaultValue: 'Beneficios, tamaño, etc.' })} 
 className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>

 {/* Stock y SKU (Blueprint Grid) */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 mt-6">
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-4 space-y-2 bg-gray-50 dark:bg-[#050505]">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Box className="w-3.5 h-3.5" /> {t('label_stock', { defaultValue: 'Inventario Físico' })}
 </label>
 <Input 
 type="number" min="0" value={product.stockQuantity || ''} 
 onChange={e => onUpdate(product.id, { stockQuantity: parseInt(e.target.value) || 0 })} 
 className="rounded-none bg-white dark:bg-black border-gray-200 dark:border-gray-800 h-10 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-4 space-y-2 bg-gray-50 dark:bg-[#050505]">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <ShieldAlert className="w-3.5 h-3.5" /> Alerta Mínima
 </label>
 <Input 
 type="number" min="0" value={product.stockAlertThreshold || ''} 
 onChange={e => onUpdate(product.id, { stockAlertThreshold: parseInt(e.target.value) || 0 })} 
 placeholder="Ej: 5"
 className="rounded-none bg-white dark:bg-black border-gray-200 dark:border-gray-800 h-10 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-4 space-y-2 bg-gray-50 dark:bg-[#050505]">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Barcode className="w-3.5 h-3.5" /> {t('label_sku', { defaultValue: 'Código SKU' })}
 </label>
 <Input 
 value={product.sku || ''} 
 onChange={e => onUpdate(product.id, { sku: e.target.value })} 
 placeholder={t('placeholder_sku', { defaultValue: 'Ej: MED-001' })} 
 className="rounded-none bg-white dark:bg-black border-gray-200 dark:border-gray-800 h-10 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
 />
 </div>
 </div>

 {/* Acciones */}
 <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
 <Button 
 variant="ghost" 
 onClick={() => onDelete(product.id)} 
 className="w-full sm:w-auto rounded-none border border-transparent text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 transition-colors h-12 px-6 text-[10px] font-bold uppercase tracking-widest"
 >
 <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} /> {tGlobal('delete', { defaultValue: 'Purgar' })}
 </Button>
 <Button
 onClick={() => onSave(product)}
 disabled={!product.hasUnsavedChanges && !product.isNew}
 className={cn(
 "w-full sm:w-auto rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
 product.hasUnsavedChanges || product.isNew 
 ? "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" 
 : "bg-gray-100 text-gray-400 dark:bg-gray-900 cursor-not-allowed"
 )}
 >
 <Save className="w-4 h-4 mr-2" strokeWidth={2} /> 
 {product.isNew ? tGlobal('save_new', { defaultValue: 'Confirmar' }) : tGlobal('save_changes', { defaultValue: 'Sincronizar' })}
 </Button>
 </div>

 </div>

 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 )}
 </div>

 {/* 🚀 MODAL DE CÁMARA EN VIVO */}
 <CameraModal 
 isOpen={isCameraOpen}
 onClose={() => {
 setIsCameraOpen(false);
 setActiveProductIdForCamera(null);
 }}
 onCapture={(base64) => {
 if (activeProductIdForCamera !== null) {
 processImageWithAi(activeProductIdForCamera, base64);
 }
 }}
 />
 </div>
 );
}