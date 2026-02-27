/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { 
  User, Calendar, Phone, MapPin, HeartPulse, 
  Activity, Clock, AlertCircle, Pill, Target, Sparkles, Loader2, 
  ChevronRight, ChevronLeft, Save
} from "lucide-react";

// ShadCN UI
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Tipos
interface PatientProfileForm {
  fullName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  healthGoals: string[];
  servicePreferences: string[];
  preferredSchedule: string;
  interestInActivities: Record<string, number>;
}

// Configuración de Pasos
const SECTIONS = [
  { id: 0, title: "Datos Personales", icon: User, description: "Información básica de contacto" },
  { id: 1, title: "Historial Médico", icon: HeartPulse, description: "Antecedentes importantes" },
  { id: 2, title: "Preferencias", icon: Sparkles, description: "Tus objetivos y gustos" },
];

const GOALS_OPTIONS = ["Bajar de peso", "Mejorar piel", "Reducir estrés", "Aumentar energía", "Rehabilitación física"];
const SERVICES_OPTIONS = ["Masajes", "Faciales", "Nutrición", "Dermatología", "Odontología"];

// Animaciones
const fadeIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};

export default function PatientProfilePage() {
  const [form, setForm] = useState<PatientProfileForm>({
    fullName: "", birthDate: "", gender: "", phoneNumber: "", address: "",
    medicalHistory: "", allergies: "", currentMedications: "",
    healthGoals: [], servicePreferences: [], preferredSchedule: "",
    interestInActivities: { ejercicio: 5, dieta: 5, skincare: 5 },
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (field: 'healthGoals' | 'servicePreferences', value: string) => {
    setForm(prev => {
        const current = prev[field];
        const updated = current.includes(value) 
            ? current.filter(item => item !== value)
            : [...current, value];
        return { ...prev, [field]: updated };
    });
  };

  const handleInterestChange = (activity: string, value: number[]) => {
    setForm((prev) => ({
      ...prev,
      interestInActivities: {
        ...prev.interestInActivities,
        [activity]: value[0],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulación de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      // await axios.post("/api/patients/profile", form);

      toast.success("¡Perfil actualizado correctamente!");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30 flex items-center justify-center">
      
      <Card className="w-full max-w-5xl bg-gray-900 border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* SIDEBAR DE PASOS */}
        <div className="w-full md:w-1/3 bg-gray-950/50 p-6 border-r border-gray-800 flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Tu Perfil de Salud</h2>
                <p className="text-sm text-gray-400 mb-8">Completa tu información para recibir recomendaciones personalizadas.</p>
                
                <div className="space-y-2">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setCurrentSection(section.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${
                                currentSection === section.id 
                                ? "bg-purple-500/10 border border-purple-500/30" 
                                : "hover:bg-gray-800 border border-transparent"
                            }`}
                        >
                            <div className={`p-2 rounded-lg ${
                                currentSection === section.id ? "bg-purple-500 text-white" : "bg-gray-800 text-gray-400 group-hover:text-white"
                            }`}>
                                <section.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`font-medium ${currentSection === section.id ? "text-purple-400" : "text-gray-300"}`}>
                                    {section.title}
                                </p>
                                <p className="text-xs text-gray-500 hidden md:block">{section.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Indicador de Progreso */}
            <div className="mt-8 hidden md:block">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progreso</span>
                    <span>{Math.round(((currentSection + 1) / SECTIONS.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-purple-500 transition-all duration-500 ease-out" 
                        style={{ width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }} 
                    />
                </div>
            </div>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="flex-1 p-6 md:p-10 relative overflow-hidden">
            <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar"
                    >
                        {/* SECCIÓN 1: DATOS PERSONALES */}
                        {currentSection === 0 && (
                            <div className="space-y-5">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-400" /> Información Básica
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
                                        <Input name="fullName" value={form.fullName} onChange={handleInputChange} placeholder="Ej. Juan Pérez" className="bg-gray-800 border-gray-700" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Fecha de Nacimiento</label>
                                            <Input type="date" name="birthDate" value={form.birthDate} onChange={handleInputChange} className="bg-gray-800 border-gray-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Género</label>
                                            <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700">
                                                    <SelectItem value="male">Masculino</SelectItem>
                                                    <SelectItem value="female">Femenino</SelectItem>
                                                    <SelectItem value="other">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Teléfono</label>
                                            <Input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} placeholder="+52..." className="bg-gray-800 border-gray-700" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Dirección</label>
                                            <Input name="address" value={form.address} onChange={handleInputChange} placeholder="Ciudad, Estado" className="bg-gray-800 border-gray-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECCIÓN 2: HISTORIAL MÉDICO */}
                        {currentSection === 1 && (
                            <div className="space-y-5">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <HeartPulse className="w-5 h-5 text-red-400" /> Antecedentes Médicos
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Condiciones Médicas / Historial</label>
                                        <Textarea name="medicalHistory" value={form.medicalHistory} onChange={handleInputChange} placeholder="Diabetes, Hipertensión, Cirugías previas..." className="bg-gray-800 border-gray-700 min-h-[100px]" />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-400"/> Alergias</label>
                                        <Textarea name="allergies" value={form.allergies} onChange={handleInputChange} placeholder="Penicilina, Nueces, Látex..." className="bg-gray-800 border-gray-700" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Pill className="w-4 h-4 text-blue-400"/> Medicamentos Actuales</label>
                                        <Textarea name="currentMedications" value={form.currentMedications} onChange={handleInputChange} placeholder="Nombre, dosis y frecuencia..." className="bg-gray-800 border-gray-700" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECCIÓN 3: PREFERENCIAS */}
                        {currentSection === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-400" /> Objetivos y Gustos
                                </h3>

                                {/* Objetivos */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Target className="w-4 h-4"/> ¿Qué buscas lograr?</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GOALS_OPTIONS.map(goal => (
                                            <Badge 
                                                key={goal}
                                                variant="outline"
                                                className={`cursor-pointer px-3 py-1.5 transition-all ${
                                                    form.healthGoals.includes(goal) 
                                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' 
                                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                                                }`}
                                                onClick={() => toggleArrayItem('healthGoals', goal)}
                                            >
                                                {goal}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Horario */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Clock className="w-4 h-4"/> Horario ideal para citas</label>
                                    <Select value={form.preferredSchedule} onValueChange={(val) => handleSelectChange('preferredSchedule', val)}>
                                        <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            <SelectItem value="morning">Mañana (8am - 12pm)</SelectItem>
                                            <SelectItem value="afternoon">Tarde (12pm - 5pm)</SelectItem>
                                            <SelectItem value="evening">Noche (5pm - 9pm)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sliders de Interés */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Activity className="w-4 h-4"/> Nivel de Interés (1-10)</label>
                                    {Object.entries(form.interestInActivities).map(([activity, value]) => (
                                        <div key={activity} className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span className="capitalize">{activity}</span>
                                                <span className="text-white font-bold">{value}</span>
                                            </div>
                                            <Slider 
                                                defaultValue={[value]} 
                                                max={10} 
                                                step={1} 
                                                onValueChange={(val) => handleInterestChange(activity, val)}
                                                className="py-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>

                {/* FOOTER DE NAVEGACIÓN */}
                <div className="pt-6 mt-6 border-t border-gray-800 flex justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                        disabled={currentSection === 0}
                        className="text-gray-400 hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
                    </Button>

                    {currentSection < SECTIONS.length - 1 ? (
                        <Button 
                            onClick={() => setCurrentSection(Math.min(SECTIONS.length - 1, currentSection + 1))}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Siguiente <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Guardar Perfil
                        </Button>
                    )}
                </div>

            </form>
        </div>

      </Card>
    </div>
  );
}