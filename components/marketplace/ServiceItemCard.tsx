"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useRef, useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { 
  GripVertical,
  UploadCloud, 
  Video, 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Copy,
  Save,
  Trash2,
  Camera,
  Globe
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UI_Service, CancellationPolicy } from "@/types/catalog";

interface ServiceItemCardProps {
  service: UI_Service;
  index: number;
  onUpdate: (id: number, updates: Partial<UI_Service>) => void;
  onSave: (service: UI_Service) => void;
  onDelete: (id: number) => void;
  onDuplicate?: (service: UI_Service) => void;
  onImageUpload?: (id: number, file: File) => void;
}

export function ServiceItemCard({
  service,
  index,
  onUpdate,
  onSave,
  onDelete,
  onDuplicate,
  onImageUpload
}: ServiceItemCardProps) {
  const t = useTranslations('Marketplace.services');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(service.id, file);
    }
  };

  // Validaciones
  const isValid = service.name && service.category && service.price > 0 && service.duration > 0;
  
  const getPriceWarning = (price: number) => {
    if (price < 200) return { level: 'low', message: t('price_warning_low', { defaultValue: 'PRECIO INUSUALMENTE BAJO' }) };
    if (price > 5000) return { level: 'high', message: t('price_warning_high', { defaultValue: 'PRECIO SOBRE PROMEDIO' }) };
    return null;
  };
  
  const priceWarning = getPriceWarning(service.price);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col border border-black/20 dark:border-white/20 transition-colors rounded-none overflow-hidden",
        service.isNew || service.hasUnsavedChanges
          ? "bg-amber-50/10 dark:bg-amber-900/5 border-amber-500/50" 
          : "bg-white dark:bg-[#0a0a0a]"
      )}
    >
      {/* --- CABECERA DE LA TARJETA (BARRA DE CONTROL) --- */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <GripVertical className="w-5 h-5" strokeWidth={1.5} />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 px-2 py-0.5 text-black dark:text-white">
              S-{(index + 1).toString().padStart(3, '0')}
            </span>
            
            {(service.isNew || service.hasUnsavedChanges) && (
              <span className="border border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
                {t('unsaved_changes', { defaultValue: 'SIN GUARDAR' })}
              </span>
            )}
            {!isValid && (
              <span className="border border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                {t('incomplete', { defaultValue: 'DATOS INCOMPLETOS' })}
              </span>
            )}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-0 w-full sm:w-auto justify-end mt-4 sm:mt-0 border border-black/20 dark:border-white/20">
          {onDuplicate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => onDuplicate(service)}
                    className="h-8 w-10 flex items-center justify-center border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-none border-none">
                  {t('duplicate', { defaultValue: 'DUPLICAR' })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="h-8 w-10 flex items-center justify-center border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>

          <button 
            onClick={() => onSave(service)}
            disabled={!isValid || (!service.hasUnsavedChanges && !service.isNew)}
            className="h-8 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Save className="w-3 h-3" strokeWidth={1.5} /> {t('save', { defaultValue: 'CONFIRMAR' })}
          </button>
        </div>
      </div>

      {/* --- MATRIZ DEL FORMULARIO PRINCIPAL --- */}
      <div className="flex flex-col md:flex-row">
        
        {/* Celda: Subida de Imagen */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col shrink-0 w-full md:w-64">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t('image_label', { defaultValue: 'PORTADA DEL SERVICIO' })}
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full h-40 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer group relative rounded-none",
              service.imageUrl 
                ? "border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]" 
                : "border border-dashed border-black/30 dark:border-white/30 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-[#0a0a0a]",
              isDragging && "border-black dark:border-white bg-black/5 dark:bg-white/5 scale-[1.02]"
            )}
          >
            {service.imageUrl ? (
              <>
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-contain group-hover:opacity-40 transition-opacity duration-300 p-2" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border border-white flex items-center justify-center bg-black/50 backdrop-blur-sm mb-2">
                    <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] text-white font-bold uppercase tracking-widest bg-black px-2 py-1">
                    CAMBIAR FOTOGRAFÍA
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center bg-white dark:bg-[#0a0a0a] group-hover:border-black dark:group-hover:border-white transition-colors mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)]">
                  <UploadCloud className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] text-black dark:text-white font-bold uppercase tracking-widest mb-1">
                  SUBIR IMAGEN
                </span>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest text-center px-4 leading-relaxed">
                  ARRASTRE O HAGA CLIC<br />(JPG, PNG, WEBP)
                </span>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onImageUpload) {
                onImageUpload(service.id, file);
              }
              e.target.value = '';
            }}
          />
        </div>

        {/* Celda: Inputs Centrales */}
        <div className="flex-1 flex flex-col">
          
          <div className="flex flex-col sm:flex-row border-b border-black/10 dark:border-white/10">
            <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                {t('name_label', { defaultValue: 'NOMBRE TÉCNICO' })} <span className="text-red-500">*</span>
              </label>
              <input 
                value={service.name}
                onChange={(e) => onUpdate(service.id, { name: e.target.value, hasUnsavedChanges: true })}
                placeholder="EJ. CONSULTA DE VALORACIÓN"
                className={cn(
                  "w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400",
                  !service.name && "border-red-500/50"
                )}
              />
            </div>

            <div className="flex-1 p-6">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                {t('category_label', { defaultValue: 'CLASIFICACIÓN' })} <span className="text-red-500">*</span>
              </label>
              <input 
                value={service.category || ''}
                onChange={(e) => onUpdate(service.id, { category: e.target.value, hasUnsavedChanges: true })}
                placeholder="EJ. DERMATOLOGÍA"
                className={cn(
                  "w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400",
                  !service.category && "border-red-500/50"
                )}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row border-b border-black/10 dark:border-white/10">
            <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>{t('price_label', { defaultValue: 'VALOR COMERCIAL' })} <span className="text-red-500">*</span></span>
                {priceWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className={cn("w-3.5 h-3.5", priceWarning.level === 'low' ? "text-amber-500" : "text-blue-500")} strokeWidth={1.5} />
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-none border-none">
                        {priceWarning.message}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" strokeWidth={1.5} />
                <input 
                  type="number" min="0" step="50"
                  value={service.price || ''}
                  onChange={(e) => onUpdate(service.id, { price: Number(e.target.value), hasUnsavedChanges: true })}
                  className={cn(
                    "w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-sm font-mono font-bold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors",
                    (!service.price || service.price <= 0) && "border-red-500/50"
                  )}
                />
              </div>
            </div>

            <div className="flex-1 p-6">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                {t('duration_label', { defaultValue: 'TIEMPO OPERATIVO' })} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" strokeWidth={1.5} />
                <input 
                  type="number" min="5" step="5"
                  value={service.duration || ''}
                  onChange={(e) => onUpdate(service.id, { duration: Number(e.target.value), hasUnsavedChanges: true })}
                  className={cn(
                    "w-full h-12 pl-10 pr-12 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-sm font-mono font-bold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors",
                    (!service.duration || service.duration <= 0) && "border-red-500/50"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">MIN</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
              {t('desc_label', { defaultValue: 'ESPECIFICACIONES TÉCNICAS' })}
            </label>
            <textarea 
              value={service.description}
              onChange={(e) => onUpdate(service.id, { description: e.target.value.slice(0, 200), hasUnsavedChanges: true })}
              placeholder={t('desc_placeholder', { defaultValue: 'DETALLES DE OPERACIÓN...' })}
              rows={2}
              maxLength={200}
              className="w-full min-h-[60px] p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors resize-y placeholder:text-gray-400"
            />
          </div>

        </div>
      </div>

      {/* --- CONFIGURACIONES AVANZADAS (FOOTER MATRIZ) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
        
        <div className="p-6 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t('delivery_type', { defaultValue: 'MODALIDAD DE ENTREGA' })}
          </label>
          <div className="flex border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
            <button
              onClick={() => onUpdate(service.id, { serviceDeliveryType: 'in_person', hasUnsavedChanges: true })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 border-r border-black/10 dark:border-white/10 text-[8px] font-bold uppercase tracking-widest transition-colors",
                service.serviceDeliveryType === 'in_person' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]'
              )}
            >
              <MapPin className="w-3 h-3" strokeWidth={1.5} /> LOC.
            </button>
            <button
              onClick={() => onUpdate(service.id, { serviceDeliveryType: 'hybrid', hasUnsavedChanges: true })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 border-r border-black/10 dark:border-white/10 text-[8px] font-bold uppercase tracking-widest transition-colors",
                service.serviceDeliveryType === 'hybrid' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]'
              )}
            >
              <Globe className="w-3 h-3" strokeWidth={1.5} /> MIX
            </button>
            <button
              onClick={() => onUpdate(service.id, { serviceDeliveryType: 'video_call', hasUnsavedChanges: true })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 text-[8px] font-bold uppercase tracking-widest transition-colors",
                service.serviceDeliveryType === 'video_call' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111]'
              )}
            >
              <Video className="w-3 h-3" strokeWidth={1.5} /> REM.
            </button>
          </div>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t('cancellation', { defaultValue: 'REGLAS DE ANULACIÓN' })}
          </label>
          <Select 
            value={service.cancellationPolicy} 
            onValueChange={(val) => onUpdate(service.id, { cancellationPolicy: val as CancellationPolicy, hasUnsavedChanges: true })}
          >
            <SelectTrigger className="w-full h-10 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[9px] font-bold text-black dark:text-white uppercase tracking-widest focus:ring-0 focus:border-black dark:focus:border-white rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl">
              <SelectItem value="flexible" className="text-[9px] font-bold uppercase tracking-widest rounded-none">FLEXIBLE</SelectItem>
              <SelectItem value="moderate" className="text-[9px] font-bold uppercase tracking-widest rounded-none">MODERADA</SelectItem>
              <SelectItem value="strict" className="text-[9px] font-bold uppercase tracking-widest rounded-none">ESTRICTA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-6 flex flex-col justify-center relative">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            {t('follow_up', { defaultValue: 'VENTANA DE SEGUIMIENTO' })}
          </label>
          <div className="relative">
            <input 
              type="number"
              placeholder="0"
              value={service.followUpPeriodDays || ''}
              onChange={(e) => onUpdate(service.id, { followUpPeriodDays: parseInt(e.target.value) || undefined, hasUnsavedChanges: true })}
              className="w-full h-10 pl-4 pr-12 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-xs font-mono font-bold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">DÍAS</span>
          </div>
        </div>

      </div>

      {/* Brutalist Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none p-0 overflow-hidden shadow-2xl sm:max-w-md [&>button]:hidden">
          <div className="p-6 md:p-8 border-b border-black/20 dark:border-white/20">
            <AlertDialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-red-500 flex items-center justify-center bg-red-50 dark:bg-red-900/10 shrink-0">
                  <Trash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                </div>
                <AlertDialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white leading-none mt-1">
                  {t('delete_confirm_title', { defaultValue: 'ANULAR SERVICIO' })}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed text-left font-semibold">
                {t('delete_confirm_message', { defaultValue: '¿Confirma la eliminación permanente de este servicio del catálogo? Esta acción no se puede deshacer.' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-0 bg-gray-50 dark:bg-[#050505] flex flex-row sm:flex-row gap-0 sm:space-x-0 border-none">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 h-14 border-r border-black/20 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              CANCELAR
            </button>
            <button 
              onClick={() => {
                onDelete(service.id);
                setIsDeleteModalOpen(false);
              }}
              className="flex-1 h-14 text-[9px] font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              SÍ, ELIMINAR
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}