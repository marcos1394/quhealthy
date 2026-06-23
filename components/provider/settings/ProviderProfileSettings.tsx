"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { toast } from "react-toastify";

export function ProviderProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Perfil actualizado exitosamente");
    } catch (err) {
      toast.error("Error al guardar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border border-black/20 dark:border-white/20 p-6 bg-white dark:bg-[#0a0a0a]">
        <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-black/20 dark:border-white/20 pb-4">
          Datos Generales
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre Completo</Label>
              <Input defaultValue="Dr. John Doe" className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Especialidad</Label>
              <Input defaultValue="Medicina General" className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Correo Electrónico</Label>
              <Input defaultValue="john.doe@quhealthy.com" type="email" className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Teléfono</Label>
              <Input defaultValue="+52 55 1234 5678" className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Acerca de Mí (Biografía Corta)</Label>
            <Textarea defaultValue="Médico especialista con más de 10 años de experiencia..." className="rounded-none border-black/20 dark:border-white/20 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
