"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

const activateSchema = z
  .object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ActivateFormValues = z.infer<typeof activateSchema>;

function ActivateStaffContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ActivateFormValues>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Token de activación inválido o no proporcionado.");
    }
  }, [token]);

  const onSubmit = async (values: ActivateFormValues) => {
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await axios.post("/api/auth/staff/activate", {
        token,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      });
      setIsSuccess(true);
      toast.success("Cuenta activada correctamente", { theme: "colored" });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Ocurrió un error al activar la cuenta. Es posible que el enlace haya expirado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── ESTADO: ÉXITO EN ACTIVACIÓN ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6 space-y-5 font-sans"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2
            className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
            strokeWidth={2}
          />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            ¡Cuenta Activada Exitosamente!
          </h1>
          <p className="text-xs font-medium text-gray-500 max-w-xs mx-auto leading-relaxed">
            Tu cuenta de equipo ha sido activada correctamente. Ahora puedes acceder a la plataforma.
          </p>
        </div>

        <Link href="/login" className="block pt-2">
          <button
            type="button"
            className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <span>Iniciar Sesión Ahora</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </Link>
      </motion.div>
    );
  }

  // ── FORMULARIO PRINCIPAL ──────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md space-y-6 font-sans"
    >
      {/* Header & Logo Mobile */}
      <div className="text-center lg:text-left space-y-2">
        <Link href="/" className="inline-block lg:hidden mb-4">
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
          </span>
        </Link>

        <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
          <UserCheck className="w-4 h-4" strokeWidth={2} />
          <span>Activación de Miembro de Equipo</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Activa tu Cuenta
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
          Completa tus datos para unirte al equipo de la clínica en QuHealthy.
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        {/* Alerta de Error General */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!error && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <input
                          className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                          placeholder="Ej. Ana"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] font-semibold text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        Apellido
                      </FormLabel>
                      <FormControl>
                        <input
                          className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                          placeholder="Ej. García"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px] font-semibold text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contraseña */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                          placeholder="Crea una contraseña segura"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={16} strokeWidth={2} />
                          ) : (
                            <Eye size={16} strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] font-semibold text-red-500" />
                  </FormItem>
                )}
              />

              {/* Confirmar Contraseña */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Confirmar Contraseña
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                          placeholder="Repite la contraseña"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Ocultar confirmación de contraseña"
                              : "Mostrar confirmación de contraseña"
                          }
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} strokeWidth={2} />
                          ) : (
                            <Eye size={16} strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] font-semibold text-red-500" />
                  </FormItem>
                )}
              />

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <QhSpinner size="sm" className="text-current" />
                    <span>Activando cuenta...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                    <span>Activar mi Cuenta</span>
                  </>
                )}
              </button>
            </form>
          </Form>
        )}
      </div>
    </motion.div>
  );
}

export default function ActivateStaffPage() {
  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── PANEL IZQUIERDO (HERO VISUAL) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
        <img
          src="/hero_medical_lifestyle.png"
          alt="Staff Activate"
          className="absolute inset-0 w-full h-full object-cover object-top mix-blend-luminosity opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

        {/* Header Marca */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              QuHealthy<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Colaboración Clínica</span>
          </span>
        </div>

        {/* Mensaje de Bienvenida */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              ¡Bienvenido al Equipo!
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              Activa tus credenciales corporativas para acceder a los expedientes y agenda de la clínica.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Acceso Institucional Protegido
                </h3>
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  Activación encriptada con permisos preasignados por la administración.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (CONTENIDO) ─────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-gray-400">Cargando módulo de activación...</p>
            </div>
          }
        >
          <ActivateStaffContent />
        </Suspense>
      </div>

    </div>
  );
}