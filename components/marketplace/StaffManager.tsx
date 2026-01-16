"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, User, Crown, Upload } from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// --- TIPOS ---
export interface StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  isNew?: boolean;
}

interface StaffManagerProps {
  staff: StaffMember[];
  onAdd: () => void;
  onUpdate: (id: number, field: keyof StaffMember, value: string) => void;
  onDelete: (id: number) => void;
  isBusinessPlan?: boolean; // Para feature gating
}

export function StaffManager({ staff, onAdd, onUpdate, onDelete, isBusinessPlan = false }: StaffManagerProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            Equipo de Trabajo
          </CardTitle>
          <CardDescription className="text-gray-400">
            Presenta a los profesionales que trabajan contigo.
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-3">
            {!isBusinessPlan && (
                <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10 hidden sm:flex gap-1">
                    <Crown className="w-3 h-3" /> Plan Business
                </Badge>
            )}
            <Button 
                onClick={onAdd} 
                disabled={!isBusinessPlan} // Bloqueado si no es Business
                className={`
                    shadow-lg
                    ${!isBusinessPlan 
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed hover:bg-gray-800" 
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/20"}
                `}
            >
                <Plus className="w-4 h-4 mr-2" /> Agregar Miembro
            </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        
        {/* Mensaje de Upsell si no tiene plan */}
        {!isBusinessPlan && staff.length === 0 && (
            <div className="bg-orange-900/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                <Crown className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-semibold text-orange-400">Función Premium</h4>
                    <p className="text-xs text-gray-400 mt-1">
                        Actualiza a <strong>Plan Business</strong> para agregar múltiples especialistas a tu perfil y gestionar sus agendas.
                    </p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
            {staff.map((member) => (
                <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="group relative bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
                >
                    {/* Botón Eliminar (Absolute) */}
                    <div className="absolute top-4 right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                        <Button 
                            size="default" 
                            variant="ghost" 
                            onClick={() => onDelete(member.id)}
                            className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 h-8 w-8"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        
                        {/* Avatar Upload Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group/avatar cursor-pointer">
                                <Avatar className="w-20 h-20 border-2 border-gray-800 group-hover/avatar:border-purple-500 transition-colors">
                                    <AvatarImage src={member.imageUrl} />
                                    <AvatarFallback className="bg-gray-800 text-gray-500">
                                        <User className="w-8 h-8" />
                                    </AvatarFallback>
                                </Avatar>
                                {/* Overlay de carga */}
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Foto</span>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Nombre Completo</Label>
                                    <Input 
                                        value={member.name}
                                        onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
                                        placeholder="Dr. Nombre Apellido"
                                        className="bg-gray-900 border-gray-700 h-9 focus:border-purple-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-gray-500">Especialidad</Label>
                                    <Input 
                                        value={member.specialty}
                                        onChange={(e) => onUpdate(member.id, 'specialty', e.target.value)}
                                        placeholder="Ej: Pediatría, Nutrición..."
                                        className="bg-gray-900 border-gray-700 h-9 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-500">Biografía Corta</Label>
                                <Textarea 
                                    value={member.bio}
                                    onChange={(e) => onUpdate(member.id, 'bio', e.target.value)}
                                    placeholder="Breve descripción de la experiencia del profesional..."
                                    rows={2}
                                    className="bg-gray-900 border-gray-700 resize-none min-h-[60px] focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
        </div>

        {isBusinessPlan && staff.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                <div className="p-3 bg-gray-800 rounded-full mb-3">
                    <Users className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">No hay miembros en el equipo.</p>
                <Button variant="link" onClick={onAdd} className="text-purple-400 hover:text-purple-300">
                    Agregar el primero
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}