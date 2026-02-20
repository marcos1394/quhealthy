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


// --- TIPOS ---
export type ServiceDeliveryType = 'in_person' | 'video_call' | 'hybrid';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';


export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  category: string; // 🚀 NUEVO CAMPO
  price: number;
  serviceDeliveryType: ServiceDeliveryType;
  cancellationPolicy: CancellationPolicy;
  followUpPeriodDays?: number;
  imageUrl?: string; // 📸 NUEVO
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
  onImageUpload?: (id: number, file: File) => void; // 📸 NUEVO
}

// Common service templates - SATISFICING
const serviceTemplates = [
  { name: "Consulta General", duration: 30, price: 500, type: 'in_person' as ServiceDeliveryType },
  { name: "Consulta de Seguimiento", duration: 20, price: 350, type: 'video_call' as ServiceDeliveryType },
  { name: "Valoración Inicial", duration: 45, price: 700, type: 'in_person' as ServiceDeliveryType },
  { name: "Teleconsulta", duration: 25, price: 400, type: 'video_call' as ServiceDeliveryType }
];

// Common durations - SATISFICING
const commonDurations = [15, 20, 30, 45, 60, 90, 120];

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
    <Card className="bg-gray-900 border-gray-800 shadow-xl">
      
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20"
            >
              <Zap className="w-6 h-6 text-yellow-400" />
            </motion.div>
            Catálogo de Servicios
          </CardTitle>
          <CardDescription className="text-gray-400 flex items-center gap-2">
            Gestiona los servicios que ofreces
            {services.length > 0 && (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
              </Badge>
            )}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {/* Templates Button */}
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Tag className="w-4 h-4 mr-2" />
            Plantillas
          </Button>
          
          <Button 
            onClick={onAdd} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Servicio
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        
        {/* Templates Panel - SATISFICING */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-400 mb-1">
                    Plantillas Rápidas
                  </p>
                  <p className="text-xs text-blue-300/80">
                    Haz clic en una plantilla para crear un servicio basado en configuraciones comunes
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {serviceTemplates.map((template, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                    className="flex flex-col items-start gap-2 p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      {template.type === 'video_call' ? (
                        <Video className="w-4 h-4 text-purple-400" />
                      ) : (
                        <MapPin className="w-4 h-4 text-blue-400" />
                      )}
                      <p className="text-xs font-semibold text-white">{template.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Badge className="bg-gray-800 text-xs">${template.price}</Badge>
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
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300 flex-1">
              <strong>Cambios sin guardar:</strong> Recuerda guardar cada servicio individualmente
            </p>
          </motion.div>
        )}

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
                transition={{ duration: 0.2 }}
                className={cn(
                  "group rounded-2xl border transition-all duration-300",
                  service.isNew || service.hasUnsavedChanges
                    ? "bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/30 shadow-lg shadow-purple-500/10" 
                    : "bg-gray-950 border-gray-800 hover:border-gray-700 hover:shadow-xl"
                )}
              >
                <div className="p-5 space-y-5">
                  
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono text-gray-500">#{index + 1}</span>
                      {(service.isNew || service.hasUnsavedChanges) && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 text-[10px] h-5 w-fit">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Sin Guardar
                        </Badge>
                      )}
                      {!isValid && (
                        <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 text-[10px] h-5 w-fit">
                          Incompleto
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {onDuplicate && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="default"
                                variant="ghost"
                                onClick={() => handleDuplicate(service)}
                                className="h-9 w-9 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
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
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 h-9"
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
                        className="h-9 w-9 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="space-y-5">
                  {/* Row 1: Image & Name */}
<div className="flex gap-4 items-start">
  
  {/* 📸 Recuadro de Imagen */}
  <div className="relative group/service-img flex-shrink-0">
    <div className={cn(
      "w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer bg-gray-950",
      service.imageUrl ? "border-purple-500/50" : "border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-gray-800"
    )}>
      {service.imageUrl ? (
        <img src={service.imageUrl} alt="Servicio" className="w-full h-full object-cover" />
      ) : (
        <>
          <Camera className="w-5 h-5 text-gray-500 mb-1 group-hover/service-img:text-purple-400 transition-colors" />
          <span className="text-[9px] text-gray-500 font-bold uppercase">Foto</span>
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
        e.target.value = ''; // Limpiar input
      }}
    />
  </div>

  {/* Input del Nombre */}
  <div className="space-y-2 flex-1">
    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
      Nombre del Servicio
    </Label>
    <Input 
      value={service.name}
      onChange={(e) => {
        onUpdate(service.id, { name: e.target.value, hasUnsavedChanges: true });
      }}
      placeholder="Ej: Consulta General, Valoración Inicial..."
      className={cn(
        "bg-gray-900 border-gray-700 h-12 text-base transition-all",
        "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
        !service.name ? "border-red-500/50" : ""
      )}
    />
  </div>
{/* 🚀 NUEVO: Input de Categoría */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          Categoría
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
            "bg-gray-900 border-gray-700 h-12 text-base transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
            !service.category ? "border-red-500/50" : ""
          )}
        />
      </div>
</div>


{/* 🚀 ROW NUEVA: PRECIO Y DURACIÓN (Lo que te faltaba) */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Price */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                          Precio
                          {priceWarning && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className={cn(
                                    "w-3 h-3",
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
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input 
                            type="number" 
                            min="0"
                            step="50"
                            value={service.price || ''}
                            onChange={(e) => onUpdate(service.id, { price: Number(e.target.value), hasUnsavedChanges: true })}
                            className={cn(
                              "bg-gray-900 border-gray-700 pl-9 h-12 text-lg font-bold transition-all focus:border-purple-500",
                              !service.price || service.price <= 0 ? "border-red-500/50" : ""
                            )}
                          />
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Duración
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input 
                            type="number" 
                            min="5"
                            step="5"
                            value={service.duration || ''}
                            onChange={(e) => onUpdate(service.id, { duration: Number(e.target.value), hasUnsavedChanges: true })}
                            className={cn(
                              "bg-gray-900 border-gray-700 pl-9 pr-12 h-12 text-lg font-bold transition-all focus:border-purple-500",
                              !service.duration || service.duration <= 0 ? "border-red-500/50" : ""
                            )}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase">
                            min
                          </span>
                        </div>
                      </div>
                    </div>                    
                    
                   
                    {/* Row 2: Description */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Descripción Corta
                        </Label>
                        <span className="text-xs text-gray-600">
                          {service.description.length}/200
                        </span>
                      </div>
                      <Textarea 
                        value={service.description}
                        onChange={(e) => {
                          onUpdate(service.id, { description: e.target.value.slice(0, 200), hasUnsavedChanges: true });
                        }}
                        placeholder="Describe brevemente en qué consiste este servicio y qué incluye..."
                        rows={2}
                        maxLength={200}
                        className="bg-gray-900 border-gray-700 resize-none min-h-[60px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>

                    <Separator className="bg-gray-800" />

                    {/* Row 3: Advanced Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      
                      {/* Delivery Type */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Modalidad
                        </Label>
                        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                          <button
                            onClick={() => onUpdate(service.id, { serviceDeliveryType: 'in_person', hasUnsavedChanges: true })}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all",
                              service.serviceDeliveryType === 'in_person' 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-gray-500 hover:text-gray-300'
                            )}
                          >
                            <MapPin className="w-3 h-3" /> Presencial
                          </button>
                          <button
                            onClick={() => onUpdate(service.id, { serviceDeliveryType: 'video_call', hasUnsavedChanges: true })}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all",
                              service.serviceDeliveryType === 'video_call' 
                                ? 'bg-purple-600 text-white shadow-lg' 
                                : 'text-gray-500 hover:text-gray-300'
                            )}
                          >
                            <Video className="w-3 h-3" /> Virtual
                          </button>
                        </div>
                      </div>

                      {/* Cancellation Policy */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Cancelación
                        </Label>
                        <Select 
                          value={service.cancellationPolicy} 
                          onValueChange={(val) => onUpdate(service.id, { cancellationPolicy: val as CancellationPolicy, hasUnsavedChanges: true })}
                        >
                          <SelectTrigger className="bg-gray-900 border-gray-700 h-10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-800">
                            <SelectItem value="flexible">
                              <div className="flex flex-col">
                                <span className="font-semibold">Flexible</span>
                                <span className="text-xs text-gray-500">24h antes</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="moderate">
                              <div className="flex flex-col">
                                <span className="font-semibold">Moderada</span>
                                <span className="text-xs text-gray-500">72h antes</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="strict">
                              <div className="flex flex-col">
                                <span className="font-semibold">Estricta</span>
                                <span className="text-xs text-gray-500">No reembolsable</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Follow-up */}
                      <div className="space-y-2">
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
                            className="bg-gray-900 border-gray-700 h-10 pr-14 focus:border-purple-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
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
            className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50"
          >
            <div className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-4 border border-gray-700">
              <Zap className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-lg font-bold text-white mb-1">Tu catálogo está vacío</p>
            <p className="text-sm text-gray-500 mb-6">
              Agrega servicios para que los pacientes puedan agendar contigo
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplates(true)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Tag className="w-4 h-4 mr-2" />
                Ver Plantillas
              </Button>
              <Button 
                onClick={onAdd}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
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
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-300/80">
              <p className="font-semibold text-emerald-400 mb-1">
                💡 Tip: Perfiles con 3+ servicios reciben 45% más reservas
              </p>
              <p>
                Ofrece variedad (consultas generales, seguimiento, valoraciones) para atraer más pacientes.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}