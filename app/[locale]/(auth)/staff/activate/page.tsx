"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function ActivateStaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      toast.success("Cuenta activada correctamente");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Ocurrió un error al activar la cuenta. Es posible que el enlace haya expirado.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-6 text-center max-w-md mx-auto py-12"
        >
          <div className="h-16 w-16 bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
            <CheckCircle2
              className="h-8 w-8 text-black dark:text-white"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            ¡Cuenta Activada!
          </h1>
          <p className="text-gray-500 font-light">
            Tu cuenta de equipo ha sido activada correctamente. Ahora puedes
            iniciar sesión en la plataforma.
          </p>
          <Link href="/login" className="w-full">
            <Button className="w-full h-12 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-none">
              Iniciar Sesión
            </Button>
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md mx-auto space-y-8 py-8"
      >
        <div className="text-center space-y-2 lg:text-left">
          <Link href="/" className="inline-block mb-8">
            <span className="text-2xl font-serif italic tracking-tight text-black dark:text-white">
              QuHealthy.
            </span>
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-black dark:text-white">
            Activa tu Cuenta
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-light">
            Completa tus datos para unirte al equipo de la clínica.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-none flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              {error}
            </p>
          </div>
        )}

        {!error && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-14 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black/10 rounded-none"
                          placeholder="Ej. Ana"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                        Apellido
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-14 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black/10 rounded-none"
                          placeholder="Ej. García"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-14 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black/10 rounded-none"
                        type="password"
                        placeholder="Crea una contraseña segura"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Confirmar Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-14 bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black/10 rounded-none"
                        type="password"
                        placeholder="Repite la contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-none mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Activando...
                  </>
                ) : (
                  "Activar Cuenta"
                )}
              </Button>
            </form>
          </Form>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero_medical_lifestyle.png"
          alt="Staff Activate"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            Bienvenido al equipo
          </h2>
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-none border border-white/20 w-max">
            <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
            <div>
              <p className="text-white font-medium text-sm">Conexión Segura</p>
              <p className="text-gray-300 text-xs font-light max-w-xs">
                Activación protegida
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        {renderContent()}
      </div>
    </div>
  );
}
