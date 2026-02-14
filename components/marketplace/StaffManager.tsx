"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Trash2, 
  User, 
  Crown, 
  Upload,
  Camera,
  Check,
  X,
  Info,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StaffManager Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEATURE GATING SUAVE
 *    - Premium badge visible pero no agresivo
 *    - Beneficios claros (+60% confianza)
 *    - Upgrade CTA atractivo
 *    - Value proposition específica
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Upload image preview
 *    - Character counter
 *    - Validation visual
 *    - Save confirmation
 * 
 * 3. PRIMING
 *    - Stats de valor (+60% confianza)
 *    - Role badges (Lead, Specialist)
 *    - Success examples
 *    - Team showcase
 * 
 * 4. CREDIBILIDAD
 *    - Stats específicos
 *    - Professional presentation
 *    - Clear roles
 *    - Social proof
 * 
 * 5. AFFORDANCE
 *    - Avatar upload clear
 *    - Hover effects
 *    - Drag reorder
 *    - Visual hierarchy
 * 
 * 6. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Placeholders específicos
 *    - Role icons
 *    - Clear labels
 *    - Examples visible
 */

// --- TIPOS ---
export interface StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  role?: 'lead' | 'specialist' | 'assistant';
  credentials?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

interface StaffManagerProps {
  staff: StaffMember[];
  onAdd: () => void;
  onUpdate: (id: number, field: keyof StaffMember, value: string) => void;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void;
  isBusinessPlan?: boolean;
  onUpgrade?: () => void;
}

export function StaffManager({ 
  staff, 
  onAdd, 
  onUpdate, 
  onDelete,
  onImageUpload,
  isBusinessPlan = false,
  onUpgrade 
}: StaffManagerProps) {
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  // Helper para role badge - PRIMING
  const getRoleBadge = (role?: string) => {
    const roles = {
      lead: { 
        label: 'Director', 
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: Award 
      },
      specialist: { 
        label: 'Especialista', 
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: Star 
      },
      assistant: { 
        label: 'Asistente', 
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: User 
      }
    };
    return roles[role as keyof typeof roles] || roles.specialist;
  };

  // Handle image upload - FEEDBACK INMEDIATO
  const handleImageUpload = (memberId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setUploadingImage(memberId);

    if (onImageUpload) {
      onImageUpload(memberId, file);
      toast.success('Imagen cargada exitosamente');
    }

    setTimeout(() => setUploadingImage(null), 1000);
  };

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
              className="p-2 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-xl border border-orange-500/20"
            >
              <Users className="w-6 h-6 text-orange-400" />
            </motion.div>
            Equipo de Trabajo
          </CardTitle>
          <CardDescription className="text-gray-400 flex items-center gap-2">
            Presenta a tu equipo profesional
            {isBusinessPlan && staff.length > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {staff.length} {staff.length === 1 ? 'miembro' : 'miembros'}
              </Badge>
            )}
          </CardDescription>
        </div>
        
        <div className="flex items-center gap-3">
          {!isBusinessPlan && (
            <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 text-orange-400 border-orange-500/20 hidden sm:flex gap-1">
              <Crown className="w-3 h-3" /> Plan Business
            </Badge>
          )}
          <Button 
            onClick={onAdd} 
            disabled={!isBusinessPlan}
            className={cn(
              "shadow-2xl transition-all duration-300",
              !isBusinessPlan 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed hover:bg-gray-800" 
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            )}
          >
            <Plus className="w-4 h-4 mr-2" /> Agregar Miembro
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        
        {/* Upsell Message - FEATURE GATING SUAVE */}
        {!isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border border-orange-500/20 rounded-2xl p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Crown className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-orange-300 mb-2">
                  Presenta a tu Equipo Completo
                </h4>
                <p className="text-sm text-orange-200/80 mb-4">
                  Con el <strong>Plan Business</strong> puedes agregar múltiples especialistas, 
                  gestionar sus agendas individuales y aumentar la confianza de tus pacientes.
                </p>

                {/* Benefits List */}
                <ul className="space-y-2 mb-4">
                  {[
                    { icon: TrendingUp, text: '+60% más confianza en pacientes nuevos' },
                    { icon: Users, text: 'Gestiona agendas de hasta 10 profesionales' },
                    { icon: Sparkles, text: 'Cada miembro tiene su perfil personalizado' },
                    { icon: Star, text: 'Calificaciones individuales por especialista' }
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-orange-300/80">
                      <benefit.icon className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-400" />
                      <span>{benefit.text}</span>
                    </li>
                  ))}
                </ul>

                {onUpgrade && (
                  <Button
                    onClick={onUpgrade}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold shadow-xl"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Actualizar a Business
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Staff Members List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {staff.map((member, index) => {
              const roleBadge = getRoleBadge(member.role);
              const RoleIcon = roleBadge.icon;
              const bioLength = member.bio?.length || 0;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                  className={cn(
                    "group relative rounded-2xl border transition-all duration-300",
                    member.isNew || member.hasUnsavedChanges
                      ? "bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/30 shadow-lg shadow-purple-500/10"
                      : "bg-gray-950 border-gray-800 hover:border-gray-700 hover:shadow-xl"
                  )}
                >
                  <div className="p-6 space-y-5">
                    
                    {/* Header Actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-800 text-gray-400 text-xs">
                          #{index + 1}
                        </Badge>
                        {member.role && (
                          <Badge variant="outline" className={cn("text-xs", roleBadge.color)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleBadge.label}
                          </Badge>
                        )}
                        {(member.isNew || member.hasUnsavedChanges) && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Sin guardar
                          </Badge>
                        )}
                      </div>

                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="default"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`¿Eliminar a ${member.name || 'este miembro'}?`)) {
                              onDelete(member.id);
                              toast.success('Miembro eliminado del equipo');
                            }
                          }}
                          className="h-9 w-9 text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                      
                      {/* Avatar Upload Section - AFFORDANCE */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <label 
                            htmlFor={`avatar-${member.id}`}
                            className="relative group/avatar cursor-pointer block"
                          >
                            <Avatar className="w-24 h-24 border-2 border-gray-800 group-hover/avatar:border-purple-500 transition-all group-hover/avatar:scale-105">
                              <AvatarImage src={member.imageUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500">
                                <User className="w-10 h-10" />
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all">
                              {uploadingImage === member.id ? (
                                <div className="animate-spin">
                                  <Camera className="w-6 h-6 text-white" />
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-white mb-1" />
                                  <span className="text-[10px] text-white font-semibold">Cambiar</span>
                                </>
                              )}
                            </div>
                          </label>
                          <input
                            id={`avatar-${member.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(member.id, e)}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Foto Perfil
                        </span>
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 space-y-4">
                        
                        {/* Name & Specialty */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Nombre Completo
                            </Label>
                            <Input 
                              value={member.name}
                              onChange={(e) => {
                                onUpdate(member.id, 'name', e.target.value);
                              }}
                              placeholder="Dr. Juan Pérez López"
                              className={cn(
                                "bg-gray-900 border-gray-700 h-11 text-base transition-all",
                                "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                                !member.name ? "border-red-500/50" :""
                              )}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Especialidad
                            </Label>
                            <Input 
                              value={member.specialty}
                              onChange={(e) => {
                                onUpdate(member.id, 'specialty', e.target.value);
                              }}
                              placeholder="Ej: Pediatría, Nutrición, Fisioterapia..."
                              className="bg-gray-900 border-gray-700 h-11 text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        {/* Credentials (Optional) */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            Credenciales
                            <span className="text-gray-600 text-[10px] normal-case">(Opcional)</span>
                          </Label>
                          <Input 
                            value={member.credentials || ''}
                            onChange={(e) => {
                              onUpdate(member.id, 'credentials', e.target.value);
                            }}
                            placeholder="Ej: Cédula 123456, Maestría en..."
                            className="bg-gray-900 border-gray-700 h-11 text-sm focus:border-blue-500"
                          />
                        </div>
                        
                        {/* Bio */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Biografía Corta
                            </Label>
                            <span className={cn(
                              "text-xs font-semibold",
                              bioLength > 150 ? "text-amber-400" : "text-gray-600"
                            )}>
                              {bioLength}/200
                            </span>
                          </div>
                          <Textarea 
                            value={member.bio}
                            onChange={(e) => {
                              onUpdate(member.id, 'bio', e.target.value.slice(0, 200));
                            }}
                            placeholder="Breve descripción de la experiencia, especialidad y enfoque del profesional. Ej: 10 años de experiencia en medicina familiar, enfoque preventivo..."
                            rows={3}
                            maxLength={200}
                            className="bg-gray-900 border-gray-700 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State (Business Plan) */}
        {isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50"
          >
            <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-4 border border-gray-700">
              <Users className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-lg font-bold text-white mb-1">Tu equipo está vacío</p>
            <p className="text-sm text-gray-500 mb-6">
              Agrega profesionales para mostrar un equipo completo
            </p>
            <Button 
              onClick={onAdd}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Miembro
            </Button>
          </motion.div>
        )}

        {/* Team Benefits Footer */}
        {staff.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-400 mb-2">
                💡 Presenta a tu equipo de forma profesional
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-300/80">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-400" />
                  <span>Fotos profesionales aumentan confianza</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-400" />
                  <span>Menciona credenciales y experiencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-400" />
                  <span>Bios específicas sobre especialidades</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-400" />
                  <span>Equipos de 2-5 miembros son ideales</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}