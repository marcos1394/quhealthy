"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  GripVertical, 
  Video, 
  MapPin, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Copy,
  CheckCircle2,
  Info,
  TrendingUp,
  Sparkles,
  X,
  Tag,
  Camera
} from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

// Types
export type ServiceDeliveryType = 'in_person' | 'video_call' | 'hybrid';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  category: string;
  price: number;
  serviceDeliveryType: ServiceDeliveryType;
  cancellationPolicy: CancellationPolicy;
  followUpPeriodDays?: number;
  imageUrl?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

interface ServicesManagerProps {
  services: Service[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<Service>) => void;
  onDelete: (id: number) => void;
  onSave: (service: Service) => void;
  onDuplicate?: (service: Service) => void;
  onImageUpload?: (id: number, file: File) => void;
}

// Common service templates - SATISFICING
const serviceTemplates = [
  { name: "Consulta General", duration: 30, price: 500, type: 'in_person' as ServiceDeliveryType },
  { name: "Consulta de Seguimiento", duration: 20, price: 350, type: 'video_call' as ServiceDeliveryType },
  { name: "Valoración Inicial", duration: 45, price: 700, type: 'in_person' as ServiceDeliveryType },
  { name: "Teleconsulta", duration: 25, price: 400, type: 'video_call' as ServiceDeliveryType }
];

export function ServicesManager({ 
  services, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onSave,
  onDuplicate,
  onImageUpload 
}: ServicesManagerProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  // Helpers - FEEDBACK INMEDIATO
  const getPriceWarning = (price: number) => {
    if (price < 200) return { level: 'low', message: 'Precio muy bajo para el mercado' };
    if (price > 2000) return { level: 'high', message: 'Precio alto - asegúrate que sea premium' };
    return null;
  };

  const getDurationColor = (duration: number) => {
    if (duration < 20) return 'text-amber-400';
    if (duration > 90) return 'text-blue-400';
    return 'text-gray-400';
  };

  // Duplicate service - SATISFICING
  const handleDuplicate = (service: Service) => {
    if (onDuplicate) {
      onDuplicate(service);
      toast.success(`Servicio "${service.name}" duplicado`);
    }
  };

  const hasUnsavedChanges = services.some(s => s.isNew || s.hasUnsavedChanges);

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800/50 pb-6 bg-gradient-to-br from-gray-900 to-gray-800/50">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-4 text-white text-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/10"
            >
              <Zap className="w-7 h-7 text-yellow-400" />
            </motion.div>
            Catálogo de Servicios
          </CardTitle>
          <CardDescription className="text-gray-400 flex items-center gap-3 text-base">
            Gestiona los servicios que ofreces
            {services.length > 0 && (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
              </Badge>
            )}
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          {/* Templates Button */}
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 h-11"
          >
            <Tag className="w-4 h-4 mr-2" />
            Plantillas
          </Button>
          
          <Button 
            onClick={onAdd} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-105 h-11 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Servicio
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-8 p-8">
        
        {/* Templates Panel - SATISFICING */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6 overflow-hidden shadow-lg"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Info className="w-6 h-6 text-blue-400 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-base font-bold text-blue-400 mb-2">
                    Plantillas Rápidas
                  </p>
                  <p className="text-sm text-blue-300/80 leading-relaxed">
                    Haz clic en una plantilla para crear un servicio basado en configuraciones comunes
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {serviceTemplates.map((template, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onAdd();
                      const newService = services[services.length - 1];
                      if (newService) {
                        onUpdate(newService.id, {
                          name: template.name,
                          duration: template.duration,
                          price: template.price,
                          serviceDeliveryType: template.type
                        });
                      }
                      toast.success(`Plantilla "${template.name}" aplicada`);
                    }}
                    className="flex flex-col items-start gap-3 p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      {template.type === 'video_call' ? (
                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                          <Video className="w-4 h-4 text-purple-400" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                      <p className="text-sm font-bold text-white">{template.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Badge className="bg-gray-800 text-xs font-bold">${template.price}</Badge>
                      <span>•</span>
                      <span>{template.duration}min</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unsaved Changes Warning */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4 shadow-lg"
            >
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-300 font-semibold mb-1">
                  Cambios sin guardar
                </p>
                <p className="text-xs text-amber-300/80">
                  Recuerda guardar cada servicio individualmente para no perder los cambios
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services List */}
        <AnimatePresence mode="popLayout">
          {services.map((service, index) => {
            const priceWarning = getPriceWarning(service.price);
            const isExpanded = expandedService === service.id;
            const isValid = service.name && service.category && service.price > 0 && service.duration > 0;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
                className={cn(
                  "group rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                  service.isNew || service.hasUnsavedChanges
                    ? "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-pink-500/10 border-purple-500/40 shadow-xl shadow-purple-500/20" 
                    : "bg-gradient-to-br from-gray-950 to-gray-900 border-gray-800 hover:border-gray-700 hover:shadow-2xl"
                )}
              >
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors">
                      <GripVertical className="w-6 h-6" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-mono text-gray-500 font-bold">#{index + 1}</span>
                      <div className="flex gap-2">
                        {(service.isNew || service.hasUnsavedChanges) && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 text-[11px] h-6 font-semibold">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Sin Guardar
                          </Badge>
                        )}
                        {!isValid && (
                          <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 text-[11px] h-6 font-semibold">
                            Incompleto
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      {onDuplicate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="default"
                                variant="ghost"
                                onClick={() => handleDuplicate(service)}
                                className="h-10 w-10 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicar servicio</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <Button 
                        size="sm"
                        onClick={() => {
                          onSave(service);
                          toast.success(`Servicio "${service.name || 'sin nombre'}" guardado`);
                        }}
                        disabled={!isValid}
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 h-10 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" /> Guardar
                      </Button>

                      <Button 
                        size="default"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${service.name || 'este servicio'}"?`)) {
                            onDelete(service.id);
                            toast.success("Servicio eliminado");
                          }
                        }}
                        className="h-10 w-10 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="space-y-6">
                    {/* Row 1: Image & Name & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-6 items-start">
                      
                      {/* Image Upload */}
                      <div className="relative group/service-img flex-shrink-0">
                        <div className={cn(
                          "w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer bg-gray-950 shadow-lg",
                          service.imageUrl ? "border-purple-500/50 shadow-purple-500/20" : "border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-gray-900 hover:shadow-xl"
                        )}>
                          {service.imageUrl ? (
                            <img src={service.imageUrl} alt="Servicio" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-gray-500 mb-2 group-hover/service-img:text-purple-400 transition-colors" />
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Foto</span>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onImageUpload) {
                              onImageUpload(service.id, file);
                            }
                            e.target.value = '';
                          }}
                        />
                      </div>

                      {/* Name Input */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Nombre del Servicio *
                        </Label>
                        <Input 
                          value={service.name}
                          onChange={(e) => {
                            onUpdate(service.id, { name: e.target.value, hasUnsavedChanges: true });
                          }}
                          placeholder="Ej: Consulta General, Valoración Inicial..."
                          className={cn(
                            "bg-gray-900 border-gray-700 h-12 text-base font-semibold transition-all",
                            "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                            !service.name ? "border-red-500/50" : ""
                          )}
                        />
                      </div>

                      {/* Category Input */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          Categoría *
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Agrupa tus servicios (Ej: Masajes, Faciales, Consultas)
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input 
                          value={service.category || ''}
                          onChange={(e) => onUpdate(service.id, { category: e.target.value, hasUnsavedChanges: true })}
                          placeholder="Ej: Masajes Corporales"
                          className={cn(
                            "bg-gray-900 border-gray-700 h-12 text-base font-semibold transition-all",
                            "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                            !service.category ? "border-red-500/50" : ""
                          )}
                        />
                      </div>
                    </div>

                    {/* Row 2: Price & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Price */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          Precio *
                          {priceWarning && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className={cn(
                                    "w-4 h-4",
                                    priceWarning.level === 'low' ? "text-amber-400" : "text-blue-400"
                                  )} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{priceWarning.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <Input 
                            type="number" 
                            min="0"
                            step="50"
                            value={service.price || ''}
                            onChange={(e) => onUpdate(service.id, { price: Number(e.target.value), hasUnsavedChanges: true })}
                            className={cn(
                              "bg-gray-900 border-gray-700 pl-12 h-14 text-xl font-black transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                              !service.price || service.price <= 0 ? "border-red-500/50" : ""
                            )}
                          />
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Duración *
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <Input 
                            type="number" 
                            min="5"
                            step="5"
                            value={service.duration || ''}
                            onChange={(e) => onUpdate(service.id, { duration: Number(e.target.value), hasUnsavedChanges: true })}
                            className={cn(
                              "bg-gray-900 border-gray-700 pl-12 pr-16 h-14 text-xl font-black transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                              !service.duration || service.duration <= 0 ? "border-red-500/50" : ""
                            )}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500 uppercase">
                            min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Description */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Descripción Corta
                        </Label>
                        <span className="text-xs text-gray-600 font-mono">
                          {service.description.length}/200
                        </span>
                      </div>
                      <Textarea 
                        value={service.description}
                        onChange={(e) => {
                          onUpdate(service.id, { description: e.target.value.slice(0, 200), hasUnsavedChanges: true });
                        }}
                        placeholder="Describe brevemente en qué consiste este servicio y qué incluye..."
                        rows={3}
                        maxLength={200}
                        className="bg-gray-900 border-gray-700 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <Separator className="bg-gray-800" />

                    {/* Row 4: Advanced Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Delivery Type */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Modalidad
                        </Label>
                        <div className="flex bg-gray-900 p-1.5 rounded-xl border border-gray-800">
                          <button
                            onClick={() => onUpdate(service.id, { serviceDeliveryType: 'in_person', hasUnsavedChanges: true })}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                              service.serviceDeliveryType === 'in_person' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                : 'text-gray-500 hover:text-gray-300'
                            )}
                          >
                            <MapPin className="w-3.5 h-3.5" /> Presencial
                          </button>
                          <button
                            onClick={() => onUpdate(service.id, { serviceDeliveryType: 'video_call', hasUnsavedChanges: true })}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                              service.serviceDeliveryType === 'video_call' 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                                : 'text-gray-500 hover:text-gray-300'
                            )}
                          >
                            <Video className="w-3.5 h-3.5" /> Virtual
                          </button>
                        </div>
                      </div>

                      {/* Cancellation Policy */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Cancelación
                        </Label>
                        <Select 
                          value={service.cancellationPolicy} 
                          onValueChange={(val) => onUpdate(service.id, { cancellationPolicy: val as CancellationPolicy, hasUnsavedChanges: true })}
                        >
                          <SelectTrigger className="bg-gray-900 border-gray-700 h-11 text-sm font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800">
                            <SelectItem value="flexible">
                              <div className="flex flex-col py-1">
                                <span className="font-bold">Flexible</span>
                                <span className="text-xs text-gray-500">24h antes</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="moderate">
                              <div className="flex flex-col py-1">
                                <span className="font-bold">Moderada</span>
                                <span className="text-xs text-gray-500">72h antes</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="strict">
                              <div className="flex flex-col py-1">
                                <span className="font-bold">Estricta</span>
                                <span className="text-xs text-gray-500">No reembolsable</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Follow-up */}
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          Seguimiento
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-gray-600" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                Días después de la cita para enviar recordatorio de seguimiento
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <div className="relative">
                          <Input 
                            type="number"
                            placeholder="Opcional"
                            value={service.followUpPeriodDays || ''}
                            onChange={(e) => onUpdate(service.id, { 
                              followUpPeriodDays: parseInt(e.target.value) || undefined,
                              hasUnsavedChanges: true 
                            })}
                            className="bg-gray-900 border-gray-700 h-11 pr-16 focus:border-purple-500"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase">
                            días
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {services.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-800 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-900/30"
          >
            <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 border border-gray-700 shadow-xl">
              <Zap className="w-12 h-12 text-gray-500" />
            </div>
            <p className="text-xl font-black text-white mb-2">Tu catálogo está vacío</p>
            <p className="text-sm text-gray-500 mb-8 max-w-md text-center leading-relaxed">
              Agrega servicios para que los pacientes puedan descubrir y agendar contigo
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplates(true)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 h-12"
              >
                <Tag className="w-4 h-4 mr-2" />
                Ver Plantillas
              </Button>
              <Button 
                onClick={onAdd}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl h-12 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Servicio
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tips Footer */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-lg"
          >
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            </div>
            <div className="text-sm text-emerald-300/80">
              <p className="font-bold text-emerald-400 mb-2 text-base">
                💡 Tip: Perfiles con 3+ servicios reciben 45% más reservas
              </p>
              <p className="leading-relaxed">
                Ofrece variedad (consultas generales, seguimiento, valoraciones) para atraer más pacientes y aumentar tu tasa de conversión.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}