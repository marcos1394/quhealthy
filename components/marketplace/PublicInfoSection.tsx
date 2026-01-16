"use client";

import React from "react";
import { FileText, Crown, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Definimos la interfaz de datos para esta sección
export interface PublicInfoSettings {
  description: string;
  videoUrl?: string; // Opcional
}

interface PublicInfoSectionProps {
  settings: PublicInfoSettings;
  onChange: (key: keyof PublicInfoSettings, value: string) => void;
  isPremium?: boolean; // Para controlar el acceso al video
}

export function PublicInfoSection({ settings, onChange, isPremium = false }: PublicInfoSectionProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          Sobre Mí
        </CardTitle>
        <CardDescription className="text-gray-400">
          Cuenta tu historia, experiencia y conecta emocionalmente con tus pacientes.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        
        {/* Descripción Pública */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <Label className="text-gray-300 font-medium">Biografía / Descripción</Label>
            <span className={`text-xs ${settings.description.length > 450 ? "text-yellow-500" : "text-gray-500"}`}>
                {settings.description.length}/500
            </span>
          </div>
          <Textarea 
            placeholder="Hola, soy el Dr. Marcos. Me especializo en..." 
            rows={5}
            value={settings.description}
            onChange={(e) => onChange('description', e.target.value)}
            maxLength={500}
            className="bg-gray-950 border-gray-700 focus:border-blue-500 resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-500">
            Esta información aparecerá en la parte superior de tu perfil público.
          </p>
        </div>

        {/* Video de Bienvenida (Feature Gating) */}
        <div className={`
            p-5 rounded-xl border transition-all duration-300
            ${isPremium 
                ? "bg-purple-500/5 border-purple-500/20" 
                : "bg-gray-950 border-gray-800 opacity-80"}
        `}>
            <div className="flex items-center justify-between mb-3">
                <Label className={`font-medium flex items-center gap-2 ${isPremium ? "text-purple-300" : "text-gray-400"}`}>
                    <Video className="w-4 h-4" /> Video de Bienvenida
                </Label>
                {!isPremium && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">Premium</span>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Input 
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={settings.videoUrl || ''}
                        onChange={(e) => onChange('videoUrl', e.target.value)}
                        disabled={!isPremium}
                        className={`
                            pl-4 pr-4 h-11 transition-all
                            ${isPremium 
                                ? "bg-gray-900 border-purple-500/30 focus:border-purple-500 text-white" 
                                : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed"}
                        `}
                    />
                </div>
                
                <p className="text-xs text-gray-500 leading-snug">
                    {isPremium 
                        ? "Pega el enlace de YouTube o Vimeo. Los perfiles con video tienen 40% más conversión." 
                        : "Actualiza tu plan para añadir un video de presentación y aumentar la confianza de tus pacientes."}
                </p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}