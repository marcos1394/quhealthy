"use client";

import React from "react";
import { Palette, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Definimos la interfaz de los datos que este componente maneja
export interface IdentitySettings {
  storeName: string;
  storeSlug: string;
  primaryColor: string;
  storeLogoUrl?: string; // Opcional por ahora
  bannerImageUrl?: string; // Opcional por ahora
}

interface VisualIdentitySectionProps {
  settings: IdentitySettings;
  onChange: (key: keyof IdentitySettings, value: string) => void;
}

// Sub-componente visual pequeño para los uploads (Placeholder)
const FileUploadPlaceholder = ({ label }: { label: string }) => (
  <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800 transition-colors cursor-pointer group bg-gray-900/50">
    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/20 transition-colors">
      <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
    </div>
    <p className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">{label}</p>
    <p className="text-xs text-gray-500 mt-1">Click para subir (JPG/PNG)</p>
  </div>
);

export function VisualIdentitySection({ settings, onChange }: VisualIdentitySectionProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Palette className="w-5 h-5 text-purple-400" />
          </div>
          Identidad Visual
        </CardTitle>
        <CardDescription className="text-gray-400">
          Define el nombre, la dirección web y los colores que verán tus pacientes.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-2">
        
        {/* Nombre y URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="text-gray-300 font-medium">Nombre del Consultorio</Label>
            <Input 
              placeholder="Ej: Dr. Marcos Wellness" 
              value={settings.storeName}
              onChange={(e) => onChange('storeName', e.target.value)}
              className="bg-gray-950 border-gray-700 focus:border-purple-500 h-11 transition-all"
            />
          </div>
          
          <div className="space-y-2.5">
            <Label className="text-gray-300 font-medium">URL Personalizada</Label>
            <div className="flex group">
              <span className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-md px-3 py-2 text-sm text-gray-400 flex items-center group-focus-within:border-purple-500 transition-colors">
                quhealthy.com/
              </span>
              <Input 
                placeholder="mi-clinica" 
                value={settings.storeSlug}
                // Lógica simple para limpiar el slug
                onChange={(e) => onChange('storeSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className="rounded-l-none bg-gray-950 border-gray-700 focus:border-purple-500 h-11 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
             <Label className="text-gray-300 font-medium">Logotipo</Label>
             <FileUploadPlaceholder label="Logo (Cuadrado)" />
          </div>
          <div className="space-y-2.5">
             <Label className="text-gray-300 font-medium">Banner de Portada</Label>
             <FileUploadPlaceholder label="Banner (1200x400)" />
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <Label className="text-gray-300 font-medium">Color de Marca</Label>
          <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center gap-6">
            
            {/* Visualizador del color */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div 
                    className="w-16 h-16 rounded-xl border-2 border-white/10 shadow-inner flex-shrink-0 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: settings.primaryColor }}
                >
                    <input 
                        type="color" 
                        value={settings.primaryColor}
                        onChange={(e) => onChange('primaryColor', e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-gray-400">Color Principal</span>
                    <Input 
                        value={settings.primaryColor} 
                        onChange={(e) => onChange('primaryColor', e.target.value)}
                        className="bg-gray-800 border-gray-700 w-28 h-8 text-xs uppercase font-mono mt-1"
                        maxLength={7}
                    />
                </div>
            </div>

            {/* Separador visual */}
            <div className="hidden sm:block w-px h-12 bg-gray-800"></div>

            {/* Preview Mini */}
            <div className="flex-1 w-full bg-gray-900 rounded-lg p-3 border border-gray-800 flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700"></div>
                    <div className="space-y-1">
                        <div className="w-20 h-2 bg-gray-700 rounded"></div>
                        <div className="w-12 h-2 bg-gray-800 rounded"></div>
                    </div>
                </div>
                <button 
                    className="px-3 py-1 rounded text-xs text-white font-medium"
                    style={{ backgroundColor: settings.primaryColor }}
                >
                    Botón Ejemplo
                </button>
            </div>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}