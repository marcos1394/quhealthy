"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    User, Bell, Shield, Settings2, CheckCircle,
    UploadCloud, Mail, Phone, Lock, EyeOff, Eye, AlertCircle
} from 'lucide-react';

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Esquema de Validación de Perfil
const profileSchema = z.object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
    specialty: z.string().min(2, "Especialidad requerida"),
    about: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Esquema de Contraseña
const securitySchema = z.object({
    currentPassword: z.string().min(8, "Mínimo 8 caracteres"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securitySchema>;

export default function ProviderSettingsPage() {
    const t = useTranslations('ProviderSettings'); // Asegúrate de tener estas keys en tus archivos de idiomas o usa textos estáticos si no están.
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
    const [showPassword, setShowPassword] = useState(false);

    // Formularios
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "Dr. John Doe",
            email: "john.doe@quhealthy.com",
            phone: "+52 55 1234 5678",
            specialty: "Medicina General",
            about: "Médico especialista con más de 10 años de experiencia..."
        }
    });

    const securityForm = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    // Handlers
    const onSubmitProfile = async (data: ProfileFormValues) => {
        try {
            // Simulación de guardado
            await new Promise(r => setTimeout(r, 1000));
            toast.success("Perfil actualizado correctamente");
        } catch (e) {
            toast.error("Error al actualizar el perfil");
        }
    };

    const onSubmitSecurity = async (data: SecurityFormValues) => {
        try {
            await new Promise(r => setTimeout(r, 1000));
            toast.success("Contraseña actualizada con éxito");
            securityForm.reset();
        } catch (e) {
            toast.error("Error al cambiar contraseña");
        }
    };

    // Tabs Navigator
    const tabs = [
        { id: 'profile', icon: User, label: 'Perfil Personal', desc: 'Gestiona tu información pública y de contacto.' },
        { id: 'notifications', icon: Bell, label: 'Notificaciones', desc: 'Personaliza cómo y cuándo te contactamos.' },
        { id: 'security', icon: Shield, label: 'Seguridad', desc: 'Contraseña y autenticación de dos factores.' },
    ] as const;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="p-3.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg text-white">
                        <Settings2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Configuración de la Cuenta
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-light">
                            Administra tus preferencias, perfil y seguridad.
                        </p>
                    </div>
                </div>

                {/* Master Detail Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Master: Navegación Vertical */}
                    <div className="w-full lg:w-72 shrink-0 space-y-2">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-start text-left gap-4 p-4 rounded-2xl transition-all duration-200 border ${isActive
                                        ? 'bg-white dark:bg-slate-900 border-medical-500/30 dark:border-medical-500/30 shadow-md ring-1 ring-medical-500/20 shadow-medical-500/10'
                                        : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl mt-0.5 ${isActive ? 'bg-medical-50 dark:bg-medical-500/20 text-medical-600 dark:text-medical-400' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500'}`}>
                                        <tab.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isActive ? 'text-medical-700 dark:text-medical-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {tab.label}
                                        </h3>
                                        <p className="text-xs font-light text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                            {tab.desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Detail: Contenido */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                        >

                            {/* --- TAB PERFIL --- */}
                            {activeTab === 'profile' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Información Personal</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Actualiza tu foto y tus datos personales. Estos serán visibles para tus pacientes.</p>
                                    </div>

                                    <div className="p-6 md:p-8 flex-1">
                                        <Form {...profileForm}>
                                            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-8">

                                                {/* Foto de Perfil Upload UI */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                                        <span className="text-2xl font-bold tracking-tighter text-medical-600">JD</span>
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                                            <UploadCloud className="w-6 h-6 mb-1" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">Subir</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold tracking-tight text-slate-900 dark:text-white mb-1">Foto de Perfil</h4>
                                                        <p className="text-xs text-slate-500 mb-3">JPG, GIF o PNG. Tamaño máximo 2MB.</p>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" type="button" variant="outline" className="border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300">Cambiar Foto</Button>
                                                            <Button size="sm" type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Eliminar</Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator className="bg-slate-100 dark:bg-slate-800" />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField control={profileForm.control} name="fullName" render={({ field }: { field: ControllerRenderProps<ProfileFormValues, 'fullName'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Nombre Completo</FormLabel>
                                                            <FormControl><Input placeholder="Ej. Dr. Juan Pérez" {...field} className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-medical-500" /></FormControl>
                                                            <FormMessage className="font-light text-xs" />
                                                        </FormItem>
                                                    )} />

                                                    <FormField control={profileForm.control} name="specialty" render={({ field }: { field: ControllerRenderProps<ProfileFormValues, 'specialty'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Especialidad Principal</FormLabel>
                                                            <FormControl><Input placeholder="Ej. Cardiología" {...field} className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-medical-500" /></FormControl>
                                                            <FormMessage className="font-light text-xs" />
                                                        </FormItem>
                                                    )} />

                                                    <FormField control={profileForm.control} name="email" render={({ field }: { field: ControllerRenderProps<ProfileFormValues, 'email'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Correo Electrónico</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Mail className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
                                                                    <Input type="email" placeholder="tucorreo@ejemplo.com" {...field} className="h-12 pl-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-medical-500" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="font-light text-xs" />
                                                        </FormItem>
                                                    )} />

                                                    <FormField control={profileForm.control} name="phone" render={({ field }: { field: ControllerRenderProps<ProfileFormValues, 'phone'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Teléfono</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Phone className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
                                                                    <Input placeholder="+52 55 ..." {...field} className="h-12 pl-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-medical-500" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="font-light text-xs" />
                                                        </FormItem>
                                                    )} />
                                                </div>

                                                <FormField control={profileForm.control} name="about" render={({ field }: { field: ControllerRenderProps<ProfileFormValues, 'about'> }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-700 dark:text-slate-300">Biografía Pública (Resumen)</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Escribe un breve resumen de tu experiencia..." {...field} className="min-h-[120px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-medical-500" />
                                                        </FormControl>
                                                        <FormMessage className="font-light text-xs" />
                                                    </FormItem>
                                                )} />

                                                <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
                                                    <Button
                                                        type="submit"
                                                        disabled={profileForm.formState.isSubmitting}
                                                        className="bg-medical-600 hover:bg-medical-700 text-white shadow-md shadow-medical-500/20 px-8 h-12 rounded-xl"
                                                    >
                                                        {profileForm.formState.isSubmitting ? <span className="animate-pulse">Guardando...</span> : <><CheckCircle className="w-4 h-4 mr-2" /> Guardar Cambios</>}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB NOTIFICACIONES --- */}
                            {activeTab === 'notifications' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Preferencias de Notificación</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Controla por qué canales deseas recibir alertas sobre tus citas y pacientes.</p>
                                    </div>
                                    <div className="p-6 md:p-8 space-y-6">

                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-500" /> Correos Electrónicos</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Recibe resúmenes diarios y alertas de nuevas citas al correo.</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Phone className="w-4 h-4 text-amber-500" /> SMS & WhatsApp</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Recibe recordatorios en tiempo real directo a tu celular.</p>
                                                </div>
                                                <Switch />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                            <Button className="bg-medical-600 hover:bg-medical-700 text-white h-11 px-8 rounded-xl shadow-md">
                                                Actualizar Preferencias
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* --- TAB SEGURIDAD --- */}
                            {activeTab === 'security' && (
                                <div className="flex flex-col h-full">
                                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Seguridad de la Cuenta</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Actualiza tu contraseña y configura factores de autenticación adicionales.</p>
                                    </div>

                                    <div className="p-6 md:p-8 space-y-8">

                                        {/* Alerta de 2FA */}
                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">Autenticación de Dos Factores Inactiva</h4>
                                                <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">Te recomendamos activar el 2FA para agregar una capa extra de seguridad a tus datos médicos.</p>
                                                <Button variant="outline" size="sm" className="mt-3 bg-white hover:bg-amber-50 text-amber-700 border-amber-200 h-8">Configurar 2FA</Button>
                                            </div>
                                        </div>

                                        <Form {...securityForm}>
                                            <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-6">
                                                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <Lock className="w-5 h-5 text-medical-500" /> Cambiar Contraseña
                                                </h3>

                                                <div className="grid grid-cols-1 gap-5 max-w-md">
                                                    <FormField control={securityForm.control} name="currentPassword" render={({ field }: { field: ControllerRenderProps<SecurityFormValues, 'currentPassword'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Contraseña Actual</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" {...field} className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200" />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )} />

                                                    <FormField control={securityForm.control} name="newPassword" render={({ field }: { field: ControllerRenderProps<SecurityFormValues, 'newPassword'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Nueva Contraseña</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Input type={showPassword ? 'text' : 'password'} {...field} className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200" />
                                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )} />

                                                    <FormField control={securityForm.control} name="confirmPassword" render={({ field }: { field: ControllerRenderProps<SecurityFormValues, 'confirmPassword'> }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 dark:text-slate-300">Confirmar Nueva Contraseña</FormLabel>
                                                            <FormControl>
                                                                <Input type="password" {...field} className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200" />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )} />
                                                </div>

                                                <div className="pt-4 flex justify-start">
                                                    <Button
                                                        type="submit"
                                                        disabled={securityForm.formState.isSubmitting}
                                                        className="bg-medical-600 hover:bg-medical-700 text-white px-8 h-11 rounded-xl shadow-md shadow-medical-500/20"
                                                    >
                                                        {securityForm.formState.isSubmitting ? "Actualizando..." : "Actualizar Contraseña"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </div>
                </div>

            </div>
        </div>
    );
}
