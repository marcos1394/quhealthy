"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { 
  GripVertical, 
  Video, 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Copy,
  Save,
  Trash2,
  Info,
  Camera
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { UI_Service, CancellationPolicy } from "@/types/catalog"; // Ajusta el path de tus tipos

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

  // Validaciones
  const isValid = service.name && service.category && service.price > 0 && service.duration > 0;
  
  const getPriceWarning = (price: number) => {
    if (price < 200) return { level: 'low', message: t('price_warning_low', { defaultValue: 'Precio inusualmente bajo' }) };
    if (price > 5000) return { level: 'high', message: t('price_warning_high', { defaultValue: 'Precio por encima del promedio' }) };
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
        "group rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-sm",
        service.isNew || service.hasUnsavedChanges
          ? "bg-medical-50/30 dark:bg-medical-500/5 border-medical-200 dark:border-medical-500/30" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      <div className="p-6 md:p-8 space-y-8">
        
        {/* --- CABECERA DE LA TARJETA --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors">
              <GripVertical className="w-5 h-5" />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                #{index + 1}
              </span>
              
              {(service.isNew || service.hasUnsavedChanges) && (
                <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 shadow-none font-semibold">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  {t('unsaved_changes', { defaultValue: 'Sin guardar' })}
                </Badge>
              )}
              {!isValid && (
                <Badge className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 shadow-none font-semibold">
                  {t('incomplete', { defaultValue: 'Incompleto' })}
                </Badge>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {onDuplicate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      onClick={() => onDuplicate(service)}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10 rounded-xl"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('duplicate', { defaultValue: 'Duplicar' })}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button 
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm(t('delete_confirm', { defaultValue: '¿Seguro que deseas eliminar este servicio?' }))) {
                  onDelete(service.id);
                }
              }}
              className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <Button 
              size="sm"
              onClick={() => onSave(service)}
              disabled={!isValid || (!service.hasUnsavedChanges && !service.isNew)}
              className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl shadow-sm disabled:opacity-50 ml-2"
            >
              <Save className="w-4 h-4 mr-2" /> {t('save', { defaultValue: 'Guardar' })}
            </Button>
          </div>
        </div>

        {/* --- FORMULARIO PRINCIPAL --- */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          
          {/* Subida de Imagen (Rediseño Cinemático) */}
          <div className="flex flex-col items-center gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer group/img relative",
                service.imageUrl 
                  ? "border-transparent shadow-md" 
                  : "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-medical-400 dark:hover:border-medical-500 hover:bg-medical-50 dark:hover:bg-medical-500/5"
              )}
            >
              {service.imageUrl ? (
                <>
                  <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-slate-400 group-hover/img:text-medical-500 transition-colors mb-2" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover/img:text-medical-600">
                    {t('photo', { defaultValue: 'Foto' })}
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

          {/* Inputs Centrales */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('name_label', { defaultValue: 'Nombre del Servicio' })}
                </Label>
                <Input 
                  value={service.name}
                  onChange={(e) => onUpdate(service.id, { name: e.target.value, hasUnsavedChanges: true })}
                  placeholder="Ej. Consulta de Valoración"
                  className={cn(
                    "rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11",
                    !service.name && "border-rose-300 focus:ring-rose-500/20"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('category_label', { defaultValue: 'Especialidad / Categoría' })}
                </Label>
                <Input 
                  value={service.category || ''}
                  onChange={(e) => onUpdate(service.id, { category: e.target.value, hasUnsavedChanges: true })}
                  placeholder="Ej. Dermatología"
                  className={cn(
                    "rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11",
                    !service.category && "border-rose-300 focus:ring-rose-500/20"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 relative">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  {t('price_label', { defaultValue: 'Precio' })}
                  {priceWarning && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className={cn("w-3.5 h-3.5", priceWarning.level === 'low' ? "text-amber-500" : "text-blue-500")} />
                        </TooltipTrigger>
                        <TooltipContent><p>{priceWarning.message}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Label>
                <DollarSign className="absolute left-3 top-[30px] w-4 h-4 text-slate-400" />
                <Input 
                  type="number" min="0" step="50"
                  value={service.price || ''}
                  onChange={(e) => onUpdate(service.id, { price: Number(e.target.value), hasUnsavedChanges: true })}
                  className={cn(
                    "pl-9 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-semibold",
                    (!service.price || service.price <= 0) && "border-rose-300 focus:ring-rose-500/20"
                  )}
                />
              </div>

              <div className="space-y-1.5 relative">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('duration_label', { defaultValue: 'Duración' })}
                </Label>
                <Clock className="absolute left-3 top-[30px] w-4 h-4 text-slate-400" />
                <Input 
                  type="number" min="5" step="5"
                  value={service.duration || ''}
                  onChange={(e) => onUpdate(service.id, { duration: Number(e.target.value), hasUnsavedChanges: true })}
                  className={cn(
                    "pl-9 pr-14 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11 font-semibold",
                    (!service.duration || service.duration <= 0) && "border-rose-300 focus:ring-rose-500/20"
                  )}
                />
                <span className="absolute right-4 top-[30px] text-xs font-bold text-slate-400 uppercase">Min</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('desc_label', { defaultValue: 'Descripción' })}
              </Label>
              <Textarea 
                value={service.description}
                onChange={(e) => onUpdate(service.id, { description: e.target.value.slice(0, 200), hasUnsavedChanges: true })}
                placeholder={t('desc_placeholder', { defaultValue: '¿Qué incluye esta consulta?' })}
                rows={2}
                maxLength={200}
                className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none text-sm"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* --- CONFIGURACIONES AVANZADAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('delivery_type', { defaultValue: 'Modalidad' })}
            </Label>
            <div className="flex bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button
                onClick={() => onUpdate(service.id, { serviceDeliveryType: 'in_person', hasUnsavedChanges: true })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
                  service.serviceDeliveryType === 'in_person' ? 'bg-medical-100 dark:bg-medical-500/20 text-medical-700 dark:text-medical-400' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <MapPin className="w-3.5 h-3.5" /> Presencial
              </button>
              <button
                onClick={() => onUpdate(service.id, { serviceDeliveryType: 'video_call', hasUnsavedChanges: true })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
                  service.serviceDeliveryType === 'video_call' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <Video className="w-3.5 h-3.5" /> Online
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('cancellation', { defaultValue: 'Política de Cancelación' })}
            </Label>
            <Select 
              value={service.cancellationPolicy} 
              onValueChange={(val) => onUpdate(service.id, { cancellationPolicy: val as CancellationPolicy, hasUnsavedChanges: true })}
            >
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-[42px] text-sm font-medium shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="moderate">Moderada</SelectItem>
                <SelectItem value="strict">Estricta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('follow_up', { defaultValue: 'Seguimiento Gratuito' })}
            </Label>
            <Input 
              type="number"
              placeholder="0"
              value={service.followUpPeriodDays || ''}
              onChange={(e) => onUpdate(service.id, { followUpPeriodDays: parseInt(e.target.value) || undefined, hasUnsavedChanges: true })}
              className="rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-[42px] pr-12 shadow-sm"
            />
            <span className="absolute right-3 top-[34px] text-xs font-bold text-slate-400 uppercase">Días</span>
          </div>

        </div>

      </div>
    </motion.div>
  );
}