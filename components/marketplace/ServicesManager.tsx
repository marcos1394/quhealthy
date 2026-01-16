"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Plus, Trash2, Save, GripVertical, 
  Video, MapPin, Clock, DollarSign, AlertCircle 
} from "lucide-react";

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

// --- TIPOS ---
export type ServiceDeliveryType = 'in_person' | 'video_call';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  serviceDeliveryType: ServiceDeliveryType;
  cancellationPolicy: CancellationPolicy;
  followUpPeriodDays?: number;
  isNew?: boolean;
}

interface ServicesManagerProps {
  services: Service[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<Service>) => void;
  onDelete: (id: number) => void;
  onSave: (service: Service) => void;
}

export function ServicesManager({ services, onAdd, onUpdate, onDelete, onSave }: ServicesManagerProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            Catálogo de Servicios
          </CardTitle>
          <CardDescription className="text-gray-400">
            Gestiona los tratamientos o consultas que ofreces.
          </CardDescription>
        </div>
        <Button onClick={onAdd} className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Servicio
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <AnimatePresence mode="popLayout">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                group rounded-xl border p-5 transition-all
                ${service.isNew 
                    ? "bg-purple-900/10 border-purple-500/50 shadow-md shadow-purple-900/10" 
                    : "bg-gray-950 border-gray-800 hover:border-gray-700"}
              `}
            >
              {/* Header del Item */}
              <div className="flex items-center gap-3 mb-5">
                <div className="cursor-grab text-gray-600 hover:text-gray-400">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex flex-col">
                    <span className="text-xs font-mono text-gray-500">#{index + 1}</span>
                    {service.isNew && (
                        <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10 text-[10px] h-5 mt-1 w-fit">
                            Sin Guardar
                        </Badge>
                    )}
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    size="sm" 
                                    onClick={() => onSave(service)}
                                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/50 h-8"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Guardar
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Guardar cambios solo de este servicio</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button 
                        size="default" 
                        variant="ghost" 
                        onClick={() => onDelete(service.id)}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 h-8 w-8"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
              </div>

              {/* Formulario Grid */}
              <div className="grid gap-5">
                
                {/* Fila 1: Nombre y Precio/Duración */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre del Servicio</Label>
                        <Input 
                            value={service.name}
                            onChange={(e) => onUpdate(service.id, { name: e.target.value })}
                            placeholder="Ej: Consulta General"
                            className="bg-gray-900 border-gray-700 focus:border-purple-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> Precio
                            </Label>
                            <Input 
                                type="number"
                                value={service.price}
                                onChange={(e) => onUpdate(service.id, { price: Number(e.target.value) })}
                                className="bg-gray-900 border-gray-700 focus:border-purple-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Minutos
                            </Label>
                            <Input 
                                type="number"
                                value={service.duration}
                                onChange={(e) => onUpdate(service.id, { duration: Number(e.target.value) })}
                                className="bg-gray-900 border-gray-700 focus:border-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Fila 2: Descripción */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción Corta</Label>
                    <Textarea 
                        value={service.description}
                        onChange={(e) => onUpdate(service.id, { description: e.target.value })}
                        placeholder="Describe brevemente en qué consiste este servicio..."
                        rows={2}
                        className="bg-gray-900 border-gray-700 focus:border-purple-500 resize-none min-h-[60px]"
                    />
                </div>

                <Separator className="bg-gray-800" />

                {/* Fila 3: Configuración Avanzada */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Modalidad */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Modalidad</Label>
                        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
                            <button
                                onClick={() => onUpdate(service.id, { serviceDeliveryType: 'in_person' })}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${service.serviceDeliveryType === 'in_person' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <MapPin className="w-3 h-3" /> Presencial
                            </button>
                            <button
                                onClick={() => onUpdate(service.id, { serviceDeliveryType: 'video_call' })}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${service.serviceDeliveryType === 'video_call' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Video className="w-3 h-3" /> Virtual
                            </button>
                        </div>
                    </div>

                    {/* Política de Cancelación (Simplificada) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cancelación</Label>
                        <Select 
                            value={service.cancellationPolicy} 
                            onValueChange={(val) => onUpdate(service.id, { cancellationPolicy: val as CancellationPolicy })}
                        >
                            <SelectTrigger className="bg-gray-900 border-gray-700 h-9 text-xs">
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800">
                                <SelectItem value="flexible">Flexible (24h antes)</SelectItem>
                                <SelectItem value="moderate">Moderada (72h antes)</SelectItem>
                                <SelectItem value="strict">Estricta (No reembolsable)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Recordatorio */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                            Recordatorio
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger><AlertCircle className="w-3 h-3 text-gray-600" /></TooltipTrigger>
                                    <TooltipContent><p>Días después de la cita para enviar seguimiento.</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <div className="relative">
                            <Input 
                                type="number"
                                placeholder="Ej: 180"
                                value={service.followUpPeriodDays || ''}
                                onChange={(e) => onUpdate(service.id, { followUpPeriodDays: parseInt(e.target.value) || undefined })}
                                className="bg-gray-900 border-gray-700 h-9 pr-12 focus:border-purple-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">días</span>
                        </div>
                    </div>

                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {services.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                <div className="p-4 bg-gray-800 rounded-full mb-3">
                    <Zap className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium">Tu catálogo está vacío</p>
                <p className="text-sm text-gray-600 mb-4">Agrega tu primer servicio para comenzar a vender.</p>
                <Button variant="outline" onClick={onAdd} className="border-gray-700 hover:bg-gray-800 text-gray-300">
                    <Plus className="w-4 h-4 mr-2" /> Agregar Servicio
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}