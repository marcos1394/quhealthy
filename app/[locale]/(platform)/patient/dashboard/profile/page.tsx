"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm, useWatch, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    User, Mail, Phone, MapPin, CheckCircle, Save,
    Activity, HeartPulse, AlertTriangle, Loader2
} from 'lucide-react';

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Esquema de Validación
const patientProfileSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
    currentMedications: z.string().optional(),
    emergencyContactName: z.string().min(3, "Nombre requerido").optional().or(z.literal('')),
    emergencyContactPhone: z.string().optional().or(z.literal('')),
});

type PatientProfileValues = z.infer<typeof patientProfileSchema>;

export default function PatientProfilePage() {
    const t = useTranslations('PatientProfile'); // Ajusta a tus keys
    const [isSaving, setIsSaving] = useState(false);

    // Formulario
    const form = useForm<PatientProfileValues>({
        resolver: zodResolver(patientProfileSchema),
        defaultValues: {
            fullName: "Carlos Mendoza",
            email: "carlos.mendoza@example.com",
            phone: "+52 55 9876 5432",
            bloodType: "O+",
            allergies: "Penicilina, Nueces",
            currentMedications: "Ninguna",
            emergencyContactName: "Ana Mendoza",
            emergencyContactPhone: "+52 55 1234 5678",
        }
    });

    // Detectar cambios sucios (dirty state) para mostrar el banner
    const isDirty = form.formState.isDirty;

    const onSubmit = async (data: PatientProfileValues) => {
        setIsSaving(true);
        try {
            // Simulación
            await new Promise(r => setTimeout(r, 1000));
            toast.success("Perfil actualizado con éxito");
            form.reset(data); // Limpiar estado "dirty"
        } catch (e) {
            toast.error("Ocurrió un error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30 pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 relative">

                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-3.5 bg-gradient-to-br from-medical-500 to-indigo-500 rounded-2xl shadow-lg shadow-medical-500/20 text-white">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Mi Perfil de Salud
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-light">
                            Manten tus datos médicos y de contacto siempre actualizados.
                        </p>
                    </div>
                </div>

                {/* Formularios */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Sección 1: Datos Personales */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-3xl">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Datos Personales</h2>
                            </div>
                            <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                                <FormField control={form.control} name="fullName" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'fullName'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 dark:text-slate-300">Nombre Completo</FormLabel>
                                        <FormControl><Input {...field} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="email" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'email'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 dark:text-slate-300">Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
                                                <Input type="email" {...field} className="h-12 pl-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="phone" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'phone'> }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel className="text-slate-700 dark:text-slate-300">Teléfono Móvil</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
                                                <Input {...field} className="h-12 pl-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        {/* Sección 2: Perfil Médico Básico */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-3xl">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
                                    <HeartPulse className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Perfil Médico Crítico</h2>
                            </div>
                            <CardContent className="p-6 md:p-8 space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="bloodType" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'bloodType'> }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 dark:text-slate-300">Tipo de Sangre</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200">
                                                        <SelectValue placeholder="Selecciona..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white dark:bg-slate-900">
                                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "No lo sé"].map(bt => (
                                                        <SelectItem key={bt} value={bt} className="focus:bg-slate-100">{bt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="allergies" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'allergies'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            Alergias Conocidas <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Ej. Penicilina, Mariscos (dejar en blanco si ninguna)" className="min-h-[100px] resize-none bg-slate-50 dark:bg-slate-950/50 border-slate-200 focus:border-rose-500" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="currentMedications" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'currentMedications'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 dark:text-slate-300">Medicamentos Actuales</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Lista los medicamentos que tomas regularmente..." className="min-h-[100px] resize-none bg-slate-50 dark:bg-slate-950/50 border-slate-200" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            </CardContent>
                        </Card>

                        {/* Sticky Save Banner */}
                        <AnimatePresence>
                            {isDirty && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
                                >
                                    <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-full">
                                                <AlertTriangle className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Cambios sin guardar</p>
                                                <p className="text-xs text-slate-300 font-light">Tienes modificaciones pendientes en tu perfil.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-white hover:bg-slate-800 hover:text-white hidden sm:flex"
                                                onClick={() => form.reset()}
                                            >
                                                Descartar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="bg-medical-500 hover:bg-medical-600 text-white font-bold shadow-md shadow-medical-500/20"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                                {isSaving ? "Guardando..." : "Guardar ahora"}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </form>
                </Form>
            </div>
        </div>
    );
}
