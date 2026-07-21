"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { securityService } from "@/services/security.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordPage() {
  const t = useTranslations("SettingsSecurity");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  
  const newPassword = watch("newPassword");

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await securityService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Contraseña actualizada exitosamente");
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/provider/dashboard/settings" className="p-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </Link>
          <div className="p-3 bg-black dark:bg-white border border-black dark:border-white w-fit">
            <Lock className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">
              {t("options.password.title") || "Cambiar Contraseña"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
              {t("options.password.desc") || "Actualiza tu contraseña de acceso"}
            </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="bg-transparent border-black/20 dark:border-white/20 rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold uppercase tracking-tight">
                  Contraseña de Seguridad
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide mt-1">
                  Tu contraseña debe tener al menos 8 caracteres.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-2 relative">
                  <Label className="text-xs uppercase font-bold tracking-widest">Contraseña Actual</Label>
                  <div className="relative">
                    <Input 
                      type={showCurrent ? "text" : "password"} 
                      className="rounded-none border-black/20 dark:border-white/20 pr-10" 
                      {...register("currentPassword", { required: "Este campo es requerido" })}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-gray-500">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.currentPassword.message as string}</p>}
                </div>

                <div className="space-y-2 relative">
                  <Label className="text-xs uppercase font-bold tracking-widest">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input 
                      type={showNew ? "text" : "password"} 
                      className="rounded-none border-black/20 dark:border-white/20 pr-10" 
                      {...register("newPassword", { 
                        required: "Este campo es requerido",
                        minLength: { value: 8, message: "Mínimo 8 caracteres" }
                      })}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-gray-500">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.newPassword.message as string}</p>}
                </div>

                <div className="space-y-2 relative">
                  <Label className="text-xs uppercase font-bold tracking-widest">Confirmar Contraseña</Label>
                  <Input 
                    type={showNew ? "text" : "password"} 
                    className="rounded-none border-black/20 dark:border-white/20" 
                    {...register("confirmPassword", { 
                      required: "Este campo es requerido",
                      validate: value => value === newPassword || "Las contraseñas no coinciden"
                    })}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.confirmPassword.message as string}</p>}
                </div>

              </CardContent>
              <CardFooter className="bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 p-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Contraseña
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
