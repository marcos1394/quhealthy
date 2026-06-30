"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { staffService } from "@/services/staff.service";
import { StaffDTO } from "@/types/staff";

export function ProviderProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffId, setStaffId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    bio: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const staffList = await staffService.getMyStaff();
        // Buscar el staff principal (el dueño/director)
        const leadStaff = staffList.find(s => s.role === 'LEAD');
        
        if (leadStaff) {
          setStaffId(leadStaff.id || null);
          setFormData({
            name: leadStaff.name || "",
            specialty: leadStaff.specialty || "",
            email: leadStaff.email || "",
            phone: leadStaff.phone || "",
            bio: leadStaff.bio || ""
          });
        }
      } catch (error) {
        console.error("Error fetching provider profile:", error);
        toast.error("Error al cargar el perfil");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const payload: StaffDTO = {
        name: formData.name,
        specialty: formData.specialty,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        role: 'LEAD'
      };

      if (staffId) {
        await staffService.updateStaffMember(staffId, payload);
        toast.success("Perfil actualizado exitosamente");
      } else {
        const newStaff = await staffService.addStaffMember(payload);
        setStaffId(newStaff.id || null);
        toast.success("Perfil creado exitosamente");
      }
    } catch (err) {
      console.error("Error saving provider profile:", err);
      toast.error("Error al guardar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border border-black/20 dark:border-white/20 p-6 bg-white dark:bg-[#0a0a0a]">
        <h2 className="text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-black/20 dark:border-white/20 pb-4">
          Datos Generales
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre Completo *</Label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej. Dr. John Doe" 
                className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Especialidad</Label>
              <Input 
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                placeholder="Ej. Medicina General" 
                className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Correo Electrónico Público</Label>
              <Input 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ej. contacto@quhealthy.com" 
                type="email" 
                className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Teléfono Público</Label>
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ej. +52 55 1234 5678" 
                className="rounded-none border-black/20 dark:border-white/20 h-12 focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Acerca de Mí (Biografía Corta)</Label>
            <Textarea 
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Médico especialista con más de 10 años de experiencia..." 
              className="rounded-none border-black/20 dark:border-white/20 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white" 
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
