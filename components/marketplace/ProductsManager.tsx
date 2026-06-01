"use client";

import React, { useRef, useState } from "react";
import { Plus, Trash2, Save, ImagePlus, ShoppingBag, Box, Barcode, Tag, Info, Sparkles, Camera, Loader2, FlaskConical, Building2, ShieldAlert, FileText, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Agrega esto debajo de tus imports
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  maxLimit?: number;
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
        
        // Nuevos campos
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
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
      
      {/* --- CABECERA (HEADER) --- */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 bg-white dark:bg-slate-900 gap-4">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-4 text-slate-900 dark:text-white text-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl border border-indigo-200 dark:border-indigo-500/30"
            >
              <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            {t('title', { defaultValue: 'Farmacia / Productos' })}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 text-base">
            {t('description', { defaultValue: 'Gestiona el inventario de productos físicos.' })}
            {products.length > 0 && (
              <Badge className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 shadow-sm font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                {products.length} {products.length === 1 ? t('product_single', { defaultValue: 'Producto' }) : t('product_plural', { defaultValue: 'Productos' })}
              </Badge>
            )}
            {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
              <Badge variant="outline" className={cn(
                "font-medium shadow-sm",
                canAdd ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
              )}>
                {currentUsage} / {maxLimit} {t('usage_limit', { defaultValue: 'usados' })}
              </Badge>
            )}
          </CardDescription>
        </div>

        <Button 
          onClick={handleAddWrapper} 
          disabled={!canAdd}
          className={cn(
            "shadow-md transition-all rounded-xl h-11 font-bold",
            canAdd ? "bg-medical-600 hover:bg-medical-700 text-white hover:shadow-lg" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
          )}
        >
          <Plus className="w-4 h-4 mr-2" /> 
          {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Lleno' }) : t('btn_add', { defaultValue: 'Nuevo Producto' })}
        </Button>
      </CardHeader>

      <CardContent className="space-y-8 pt-8 p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/50">
        
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30"
          >
            <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl mb-6 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('empty_state', { defaultValue: 'No tienes productos' })}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center leading-relaxed">
              {t('empty_desc', { defaultValue: 'Agrega medicamentos, suplementos o productos que ofrezcas en tu clínica.' })}
            </p>
            <Button 
              onClick={handleAddWrapper}
              disabled={!canAdd}
              className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-12 font-bold px-8 shadow-lg shadow-medical-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Crear mi primer producto' })}
            </Button>
          </motion.div>
        ) : (
          /* --- LISTA DE PRODUCTOS --- */
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                layout
              >
                <Card className={cn(
                  "border transition-all duration-300 shadow-sm rounded-3xl overflow-hidden group",
                  product.isNew ? "border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-lg shadow-indigo-500/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl",
                  product.hasUnsavedChanges && !product.isNew ? "border-amber-300 dark:border-amber-500/50 bg-amber-50/30 dark:bg-amber-900/10" : ""
                )}>
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8">

                      {/* 📸 Imagen del Producto */}
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative cursor-pointer group/image transition-all hover:border-indigo-500"
                          onClick={() => fileInputRefs.current[product.id]?.click()}
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover/image:opacity-50 transition-opacity" />
                          ) : (
                            <ImagePlus className="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover/image:scale-110 transition-transform" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-bold">{t('change_image', { defaultValue: 'Cambiar' })}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                          {t('photo_label', { defaultValue: 'Foto del Producto' })}
                        </span>
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

                      {/* 📝 Formulario */}
                      <div className="flex-1 space-y-6">
                        
                        {/* 🚀 MAGIA DE IA: Banner de Escaneo Inteligente */}
                        <div className="bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center text-sm">
                              <Sparkles className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                              Asistente de Catálogo IA
                            </h4>
                            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">
                              Sube o toma una foto de la caja del medicamento y llenaremos los datos por ti.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {/* Input para GALERÍA */}
                            <input 
                              type="file" 
                              accept="image/*" 
                              ref={el => { fileInputRefs.current[`ai_gallery_${product.id}` as any] = el as any; }}
                              className="hidden" 
                              onChange={(e) => handleAiScan(e, product.id)} 
                            />

                            <Button 
                              type="button"
                              size="sm"
                              onClick={() => {
                                setActiveProductIdForCamera(product.id);
                                setIsCameraOpen(true);
                              }}
                              disabled={scanningProductId === product.id}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex-1 sm:flex-none"
                            >
                              {scanningProductId === product.id ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ...</>
                              ) : (
                                <><Camera className="w-4 h-4 mr-2" /> Cámara</>
                              )}
                            </Button>

                            <Button 
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => (fileInputRefs.current[`ai_gallery_${product.id}` as any] as any)?.click()}
                              disabled={scanningProductId === product.id}
                              className="border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex-1 sm:flex-none"
                            >
                              <ImagePlus className="w-4 h-4 mr-2" /> Galería
                            </Button>
                          </div>
                        </div>

                        {/* Campos Básicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_name', { defaultValue: 'Nombre del Producto' })}</label>
                            <Input 
                              value={product.name} 
                              onChange={e => onUpdate(product.id, { name: e.target.value })} 
                              placeholder={t('placeholder_name', { defaultValue: 'Ej: Suplemento vitamínico' })} 
                              className={cn("h-11 font-bold text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white", !product.name ? "border-red-300 dark:border-red-500/50" : "")} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_price', { defaultValue: 'Precio' })}</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">$</span>
                                <Input 
                                  type="number" min="0" value={product.price || ''} 
                                  onChange={e => onUpdate(product.id, { price: parseFloat(e.target.value) || 0 })} 
                                  className="h-11 pl-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold" 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center"><Tag className="w-3 h-3 mr-1" /> {t('label_category', { defaultValue: 'Categoría' })}</label>
                              <Input 
                                value={product.category} 
                                onChange={e => onUpdate(product.id, { category: e.target.value })} 
                                placeholder={t('placeholder_category', { defaultValue: 'Farmacia' })} 
                                className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* 🛡️ SECCIÓN CUMPLIMIENTO REGULATORIO (COFEPRIS) */}
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200/60 dark:border-amber-800/50 space-y-5">
                          <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center text-sm border-b border-amber-200/50 pb-2">
                            <ShieldAlert className="w-4 h-4 mr-2" /> Cumplimiento Regulatorio y Farmacológico
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Categoría COFEPRIS */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Clasificación Sanitaria</label>
                              <select
                                value={product.cofeprisCategory || 'OTC_GENERAL'}
                                onChange={(e) => onUpdate(product.id, { cofeprisCategory: e.target.value })}
                                className="w-full h-11 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              >
                                {COFEPRIS_CATEGORIES.map(cat => (
                                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* URL Ficha Técnica */}
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                                <FileText className="w-3.5 h-3.5 mr-1" /> Ficha Técnica (IPP PDF)
                              </label>
                              <Input 
                                value={product.technicalSheetUrl || ''} 
                                onChange={e => onUpdate(product.id, { technicalSheetUrl: e.target.value })} 
                                placeholder="Ej: https://.../medicamento.pdf" 
                                className="bg-white dark:bg-slate-950" 
                              />
                            </div>

                            <div className="space-y-2 relative">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                                  <FlaskConical className="w-3.5 h-3.5 mr-1" /> Sustancia Activa
                                </label>
                                {suggestStatus[product.id] === 'SEARCHING' && (
                                  <span className="text-[10px] text-amber-600 font-bold animate-pulse flex items-center">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Buscando...
                                  </span>
                                )}
                                {suggestStatus[product.id] === 'FOUND' && (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                                    <Sparkles className="w-3 h-3 mr-1" /> BD QuHealthy
                                  </span>
                                )}
                                {suggestStatus[product.id] === 'NOT_FOUND' && (
                                  <span className="text-[10px] text-slate-500 font-bold flex items-center">
                                    <Info className="w-3 h-3 mr-1" /> Bajo revisión al guardar
                                  </span>
                                )}
                              </div>
                              <Input 
                                value={product.activeIngredient || ''} 
                                onChange={e => handleActiveIngredientChange(product.id, e.target.value)} 
                                placeholder="Ej: Paracetamol 500mg" 
                                className="bg-white dark:bg-slate-950" 
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                                <Building2 className="w-3.5 h-3.5 mr-1" /> Laboratorio / Marca
                              </label>
                              <Input 
                                value={product.manufacturer || ''} 
                                onChange={e => onUpdate(product.id, { manufacturer: e.target.value })} 
                                placeholder="Ej: Pfizer, Bayer" 
                                className="bg-white dark:bg-slate-950" 
                              />
                            </div>
                          </div>

                          {/* Toggles de Compliance */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-amber-200/50">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={product.requiresPrescription || false}
                                onChange={e => onUpdate(product.id, { requiresPrescription: e.target.checked })}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Requiere Receta Médica</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={product.isAntibiotic || false}
                                onChange={e => onUpdate(product.id, { isAntibiotic: e.target.checked })}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Es Antibiótico (Retención/Sello)</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={product.requiresPhysicalRetention || false}
                                onChange={e => onUpdate(product.id, { requiresPhysicalRetention: e.target.checked })}
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                              />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Exige Recolectar Receta Original</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={product.allowsInterstateShipping ?? true}
                                onChange={e => onUpdate(product.id, { allowsInterstateShipping: e.target.checked })}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className="text-sm font-medium flex items-center text-slate-700 dark:text-slate-300">
                                <Truck className="w-3.5 h-3.5 mr-1" /> Permite Envío Foráneo
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Descripción y SKU (Originales) */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_desc', { defaultValue: 'Descripción Corta' })}</label>
                          <Input 
                            value={product.description} 
                            onChange={e => onUpdate(product.id, { description: e.target.value })} 
                            placeholder={t('placeholder_desc', { defaultValue: 'Beneficios, tamaño, etc.' })} 
                            className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center">
                              <Box className="w-4 h-4 mr-1 text-slate-400" /> {t('label_stock', { defaultValue: 'Stock Disponible' })}
                            </label>
                            <Input 
                              type="number" min="0" value={product.stockQuantity || ''} 
                              onChange={e => onUpdate(product.id, { stockQuantity: parseInt(e.target.value) || 0 })} 
                              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center">
                              <ShieldAlert className="w-4 h-4 mr-1 text-slate-400" /> Alerta de Stock
                            </label>
                            <Input 
                              type="number" min="0" value={product.stockAlertThreshold || ''} 
                              onChange={e => onUpdate(product.id, { stockAlertThreshold: parseInt(e.target.value) || 0 })} 
                              placeholder="Ej: 5"
                              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center">
                              <Barcode className="w-4 h-4 mr-1 text-slate-400" /> {t('label_sku', { defaultValue: 'SKU / Código' })}
                            </label>
                            <Input 
                              value={product.sku || ''} 
                              onChange={e => onUpdate(product.id, { sku: e.target.value })} 
                              placeholder={t('placeholder_sku', { defaultValue: 'Ej: MED-001' })} 
                              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700" 
                            />
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <Button 
                            variant="ghost" 
                            onClick={() => onDelete(product.id)} 
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-11 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> {tGlobal('delete', { defaultValue: 'Eliminar' })}
                          </Button>
                          <Button
                            onClick={() => onSave(product)}
                            disabled={!product.hasUnsavedChanges && !product.isNew}
                            className={cn(
                              "rounded-xl h-11 font-bold shadow-sm transition-all px-6",
                              product.hasUnsavedChanges || product.isNew 
                                ? "bg-medical-600 hover:bg-medical-700 text-white shadow-md" 
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            )}
                          >
                            <Save className="w-4 h-4 mr-2" /> 
                            {product.isNew ? tGlobal('save_new', { defaultValue: 'Guardar' }) : tGlobal('save_changes', { defaultValue: 'Guardar Cambios' })}
                          </Button>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>

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
    </Card>
  );
}